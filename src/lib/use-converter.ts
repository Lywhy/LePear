import { formatForName, targetsForName } from "@/lib/converter-formats";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  converterRequest,
  defaultConverterLimits,
  getConverterSession,
  saveConverterFile,
  uploadConverterFile,
  type ConverterJob,
  ConverterError,
} from "@/lib/converter-api";
type Run = {
  requestId: string;
  controller: AbortController;
  posted: boolean;
  terminal: boolean;
};
type View = {
  phase: "idle" | "working" | "cancelling" | "ready" | "error" | "cancelled";
  job: ConverterJob | null;
  upload: number | null;
  message: string;
};
const idle: View = { phase: "idle", job: null, upload: null, message: "" };
const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
async function cancelRequest(run: Run) {
  if (!run.posted) return;
  try {
    let job = await converterRequest<Partial<ConverterJob>>(
      "jobs/request/" + run.requestId,
      { method: "DELETE", keepalive: true },
    );
    const signal = AbortSignal.timeout(10000);
    while (job.id && job.status === "cancelling") {
      await wait(250, signal);
      job = await converterRequest<ConverterJob>("jobs/" + job.id, { signal });
    }
  } catch (error) {
    if (error instanceof ConverterError && error.status === 404) return;
    if (error instanceof DOMException && error.name === "TimeoutError")
      throw new ConverterError(
        "Остановка ещё не подтверждена. Подождите и повторите.",
      );
    throw error;
  }
}
export function useConverter() {
  const [view, setView] = useState<View>(idle);
  const [limits, setLimits] = useState(defaultConverterLimits);
  const runRef = useRef<Run | null>(null);
  const pendingCancellation = useRef<Run | null>(null);
  const saving = useRef(false);
  useEffect(() => {
    let mounted = true;
    void getConverterSession()
      .then((session) => {
        if (mounted) setLimits(session.limits);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    const leave = () => {
      const run = runRef.current;
      if (!run || run.terminal) return;
      run.controller.abort();
      void cancelRequest(run).catch(() => {});
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      leave();
      runRef.current = null;
    };
  }, []);
  const reset = useCallback(() => {
    const run = runRef.current;
    if (run) {
      run.controller.abort();
      const pending = cancelRequest(run);
      pendingCancellation.current = run;
      // Observe background cancellation; a new start confirms it again before posting.
      void pending.catch(() => {});
    }
    runRef.current = null;
    setView(idle);
  }, []);
  const cancel = useCallback(async () => {
    const run = runRef.current;
    if (!run || run.terminal) return;
    run.controller.abort();
    setView((value) => ({ ...value, phase: "cancelling", message: "" }));
    const pending = cancelRequest(run);
    pendingCancellation.current = run;
    try {
      await pending;
      if (runRef.current === run) {
        run.terminal = true;
        setView({
          ...idle,
          phase: "cancelled",
          message: "Конвертация отменена.",
        });
      }
    } catch (error) {
      if (runRef.current === run)
        setView({
          ...idle,
          phase: "error",
          message:
            error instanceof Error
              ? error.message
              : "Не удалось подтвердить отмену. Повторите.",
        });
    }
  }, []);
  const start = useCallback(async (file: File, format: string) => {
    if (
      runRef.current &&
      !runRef.current.terminal &&
      !runRef.current.controller.signal.aborted
    )
      return;
    const run: Run = {
      requestId: crypto.randomUUID().replaceAll("-", ""),
      controller: new AbortController(),
      posted: false,
      terminal: false,
    };
    runRef.current = run;
    const signal = run.controller.signal;
    const current = () => runRef.current === run && !signal.aborted;
    setView({ ...idle, phase: "working" });
    try {
      if (pendingCancellation.current) {
        await cancelRequest(pendingCancellation.current);
        pendingCancellation.current = null;
      }
      if (!current()) return;
      const session = await getConverterSession();
      if (!current()) return;
      setLimits(session.limits);
      if (!session.available)
        throw new ConverterError(
          "Конвертер недоступен. Установите FFmpeg через pnpm youtube:setup-ffmpeg и перезапустите pnpm api.",
        );
      if (!file.size || file.size > session.limits.inputBytes)
        throw new ConverterError("Файл пуст или превышает допустимый размер.");
      if (
        !formatForName(file.name) ||
        !targetsForName(file.name).some((target) => target.id === format)
      )
        throw new ConverterError("Выберите совместимый формат результата.");
      run.posted = true;
      let job = await converterRequest<ConverterJob>("jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: run.requestId,
          name: file.name,
          bytes: file.size,
          format,
        }),
        signal,
      });
      if (!current()) return;
      setView({ phase: "working", job, upload: 0, message: "" });
      await uploadConverterFile(
        job.id,
        file,
        signal,
        session.limits.uploadTimeoutMs,
        (upload) => {
          if (current()) setView((value) => ({ ...value, upload }));
        },
      );
      const deadline = Date.now() + session.limits.jobTimeoutMs + 15000;
      while (current()) {
        if (Date.now() > deadline)
          throw new ConverterError(
            "Истекло время ожидания. Повторите конвертацию.",
          );
        job = await converterRequest<ConverterJob>("jobs/" + job.id, {
          signal,
        });
        if (!current()) return;
        setView({ phase: "working", job, upload: null, message: "" });
        if (job.status === "ready" && job.result) {
          run.terminal = true;
          setView({
            phase: "ready",
            job,
            upload: null,
            message:
              job.result.format + ": файл готов. Скачивание передано браузеру.",
          });
          saveConverterFile(job);
          return;
        }
        if (["failed", "cancelled", "expired"].includes(job.status))
          throw new ConverterError(
            job.error?.message ||
              "Задание завершено. Запустите конвертацию заново.",
          );
        await wait(1000, signal);
      }
    } catch (error) {
      if (!current()) return;
      run.terminal = true;
      const pending = cancelRequest(run);
      pendingCancellation.current = run;
      void pending.catch(() => {});
      setView({
        ...idle,
        phase: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось выполнить конвертацию.",
      });
    }
  }, []);
  const download = useCallback(async () => {
    if (saving.current || !view.job || view.phase !== "ready") return;
    const run = runRef.current;
    saving.current = true;
    try {
      const job = await converterRequest<ConverterJob>("jobs/" + view.job.id);
      if (runRef.current !== run) return;
      if (job.status !== "ready" || !job.result)
        throw new ConverterError(
          "Срок хранения файла истёк. Запустите конвертацию заново.",
        );
      saveConverterFile(job);
    } catch (error) {
      if (runRef.current === run)
        setView({
          ...idle,
          phase: "error",
          message:
            error instanceof Error
              ? error.message
              : "Не удалось получить файл.",
        });
    } finally {
      saving.current = false;
    }
  }, [view.job, view.phase]);
  return { ...view, limits, start, cancel, reset, download };
}
