import { useEffect, useRef, useState } from "react";
import {
  fileUrl,
  YouTubeJobError,
  cancelJobRequest,
  jobRequest,
  terminalJob,
  type VideoJob,
} from "@/lib/youtube-jobs";

type State = {
  phase: "idle" | "working" | "cancelling" | "cancelled" | "error" | "finished";
  job: VideoJob | null;
  error: string | null;
};
type Active = {
  requestId: string;
  controller: AbortController;
  posted: boolean;
  terminal: boolean;
  cancelling: boolean;
};
function saveFile(job: VideoJob) {
  const anchor = document.createElement("a");
  anchor.href = fileUrl(job);
  anchor.download = job.result?.filename ?? "";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
function requestId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
function delay(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 1000);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}
export function useVideoDownload(
  videoId: string,
  kind: "video" | "audio" | "subtitles" = "video",
) {
  const [state, setState] = useState<State>({
    phase: "idle",
    job: null,
    error: null,
  });
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  function rememberRetry(value: number | null) {
    setNow(Date.now());
    setRetryAt(value);
  }
  useEffect(() => {
    if (retryAt === null) return;
    const timer = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= retryAt) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);
  const active = useRef<Active | null>(null);
  const fileCheck = useRef<AbortController | null>(null);
  const [checkingFile, setCheckingFile] = useState(false);
  useEffect(() => {
    function dispose() {
      const current = active.current;
      active.current = null;
      current?.controller.abort();
      fileCheck.current?.abort();
      fileCheck.current = null;
      if (current?.posted && !current.terminal)
        void cancelJobRequest(current.requestId).catch(() => {});
      return current && !current.terminal;
    }
    function onPageHide() {
      const cancelled = dispose();
      setCheckingFile(false);
      if (cancelled) setState({ phase: "cancelled", job: null, error: null });
    }
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      dispose();
    };
  }, []);
  function cancel() {
    const current = active.current;
    if (!current || current.terminal || current.cancelling) return;
    current.cancelling = true;
    current.controller.abort();
    setState({ phase: "cancelling", job: null, error: null });
    if (!current.posted) {
      setState({ phase: "cancelled", job: null, error: null });
      active.current = null;
      return;
    }
    void cancelJobRequest(current.requestId)
      .then(() => {
        if (active.current === current) {
          active.current = null;
          setState({ phase: "cancelled", job: null, error: null });
        }
      })
      .catch(() => {
        if (active.current !== current) return;
        current.cancelling = false;
        setState({
          phase: "error",
          job: null,
          error:
            "Не удалось подтвердить отмену на сервере. Повторите отмену или дождитесь лимита времени задания.",
        });
      });
  }
  async function start(
    formatId: string,
    outputFormat?: "original" | "mp3",
    subtitleTrackId?: string,
  ) {
    if (active.current?.cancelling || fileCheck.current) return;
    if (
      active.current &&
      !active.current.terminal &&
      !active.current.controller.signal.aborted
    )
      return;
    const previous = active.current;
    const current: Active = {
      requestId: requestId(),
      controller: new AbortController(),
      posted: false,
      terminal: false,
      cancelling: false,
    };
    active.current = current;
    const signal = current.controller.signal;
    rememberRetry(null);
    setState({ phase: "working", job: null, error: null });
    try {
      if (previous?.posted) {
        try {
          await cancelJobRequest(previous.requestId);
        } catch (error) {
          if (!(error instanceof YouTubeJobError && error.status === 404))
            throw error;
        }
      }
      if (signal.aborted) return;
      const session = await jobRequest<{
        capabilities?: {
          audioDownloads?: boolean;
          subtitleDownloads?: boolean;
        };
      }>("session", { signal });
      if (kind === "audio" && session.capabilities?.audioDownloads !== true) {
        throw new Error(
          "Запущена прежняя версия API без поддержки аудио. Остановите pnpm api и запустите снова. Переходить во вкладку «Видео» не нужно.",
        );
      }
      if (signal.aborted) return;
      if (
        kind === "subtitles" &&
        session.capabilities?.subtitleDownloads !== true
      )
        throw new Error(
          "Запущена прежняя версия API без поддержки субтитров. Остановите pnpm api и запустите снова.",
        );
      current.posted = true;
      let job = await jobRequest<VideoJob>("jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          outputFormat,
          subtitleTrackId,
          videoId,
          formatId,
          requestId: current.requestId,
        }),
        signal,
      });
      while (active.current === current && !signal.aborted) {
        current.terminal = terminalJob(job);
        if (job.status === "ready") saveFile(job);
        setState({
          phase: current.terminal ? "finished" : "working",
          job,
          error: null,
        });
        if (current.terminal) {
          rememberRetry(job.error?.retryAt ?? null);
          return;
        }
        await delay(signal);
        job = await jobRequest<VideoJob>("jobs/" + job.id, { signal });
      }
    } catch (error) {
      if (active.current !== current || signal.aborted) return;
      if (current.posted)
        void cancelJobRequest(current.requestId).catch(() => {});
      current.controller.abort();
      rememberRetry(error instanceof YouTubeJobError ? error.retryAt : null);
      setState({
        phase: "error",
        job: null,
        error:
          error instanceof Error ? error.message : "Не удалось скачать файл.",
      });
    }
  }
  async function refreshReady(signal: AbortSignal) {
    if (!state.job) return null;
    const current = active.current;
    try {
      const job = await jobRequest<VideoJob>("jobs/" + state.job.id, {
        signal,
      });
      if (active.current !== current) return null;
      setState({ phase: "finished", job, error: null });
      return job.status === "ready" ? job : null;
    } catch (error) {
      if (signal.aborted || active.current !== current) return null;
      if (
        error instanceof YouTubeJobError &&
        [404, 410].includes(error.status)
      ) {
        setState({
          phase: "finished",
          job: null,
          error:
            "Файл больше не доступен. Нажмите «Скачать», чтобы создать его заново.",
        });
      } else {
        setState((value) => ({
          ...value,
          error: error instanceof Error ? error.message : "Файл недоступен.",
        }));
      }
      return null;
    }
  }
  async function saveReady() {
    if (fileCheck.current) return;
    const controller = new AbortController();
    fileCheck.current = controller;
    setCheckingFile(true);
    try {
      const ready = await refreshReady(controller.signal);
      if (ready && !controller.signal.aborted) saveFile(ready);
    } finally {
      if (fileCheck.current === controller) {
        fileCheck.current = null;
        setCheckingFile(false);
      }
    }
  }
  return {
    ...state,
    retryAfterSeconds:
      retryAt === null ? 0 : Math.max(0, Math.ceil((retryAt - now) / 1000)),
    checkingFile,
    cancelling: state.phase === "cancelling",
    busy: state.phase === "working" || state.phase === "cancelling",
    start,
    cancel,
    saveReady,
  };
}
