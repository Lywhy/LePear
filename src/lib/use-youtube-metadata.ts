import { useEffect, useRef, useState } from "react";
import { fetchYouTubeMetadata, type YouTubeMetadata } from "@/lib/youtube-api";

type RequestState = {
  phase: "idle" | "loading" | "ready" | "error" | "cancelled";
  data: YouTubeMetadata | null;
  error: string;
};
const idle: RequestState = { phase: "idle", data: null, error: "" };
export function useYouTubeMetadata() {
  const [state, setState] = useState<RequestState>(idle);
  const serial = useRef(0);
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    function dispose() {
      const wasActive = active.current !== null;
      serial.current++;
      active.current?.abort();
      active.current = null;
      return wasActive;
    }
    function onPageHide() {
      if (dispose()) setState({ phase: "cancelled", data: null, error: "" });
    }
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      dispose();
    };
  }, []);
  function reset() {
    serial.current++;
    active.current?.abort();
    active.current = null;
    setState(idle);
  }
  function cancel() {
    serial.current++;
    active.current?.abort();
    active.current = null;
    setState({ phase: "cancelled", data: null, error: "" });
  }
  async function load(url: string) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const token = ++serial.current;
    setState({ phase: "loading", data: null, error: "" });
    const timer = window.setTimeout(() => controller.abort("timeout"), 55000);
    try {
      const data = await fetchYouTubeMetadata(url, controller.signal);
      if (serial.current === token)
        setState({ phase: "ready", data, error: "" });
    } catch (error) {
      if (serial.current === token)
        setState({
          phase: "error",
          data: null,
          error:
            controller.signal.reason === "timeout"
              ? "Превышено время ожидания сервиса. Повторите запрос."
              : error instanceof Error
                ? error.message
                : "Не удалось получить данные ролика.",
        });
    } finally {
      window.clearTimeout(timer);
      if (serial.current === token) active.current = null;
    }
  }
  return { ...state, load, reset, cancel };
}
