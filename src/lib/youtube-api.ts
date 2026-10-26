import { apiErrorMessage } from "@/lib/api-error-message";
export type MediaSize = { bytes: number; approximate: boolean } | null;
export type VideoFormat = {
  id: string;
  ext: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  codec: string;
  hasAudio: boolean;
  size: MediaSize;
};
export type AudioFormat = {
  id: string;
  ext: string;
  bitrate: number | null;
  codec: string;
  language: string | null;
  size: MediaSize;
};
export type SubtitleTrack = {
  id: string;
  language: string;
  name: string;
  source: "manual" | "automatic";
  formats: string[];
};
export type YouTubeMetadata = {
  apiVersion: 1;
  video: {
    id: string;
    url: string;
    title: string;
    channel: string;
    duration: number | null;
    thumbnail: string;
  };
  formats: { video: VideoFormat[]; audio: AudioFormat[] };
  subtitles: SubtitleTrack[];
  warnings: string[];
  capabilities: { downloads: boolean };
};
export async function fetchYouTubeMetadata(
  url: string,
  signal: AbortSignal,
): Promise<YouTubeMetadata> {
  let response: Response;
  try {
    response = await fetch("/api/youtube/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(
      "Нет связи с сервисом YouTube. Запустите локальный API и повторите запрос.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Сервис YouTube недоступен или вернул непонятный ответ. Проверьте, что API запущен.",
    );
  }
  if (!response.ok)
    throw new Error(
      apiErrorMessage(
        data,
        "Не удалось получить данные ролика. Повторите запрос позже.",
      ),
    );
  if (
    data?.apiVersion !== 1 ||
    typeof data?.video?.id !== "string" ||
    typeof data?.video?.title !== "string" ||
    !Array.isArray(data?.formats?.video) ||
    !Array.isArray(data?.formats?.audio) ||
    !Array.isArray(data?.subtitles) ||
    !Array.isArray(data?.warnings)
  )
    throw new Error("Сервис вернул некорректные данные ролика.");
  return data as YouTubeMetadata;
}
export function mediaSizeLabel(size: MediaSize) {
  if (!size) return "Размер неизвестен";
  const value = size.bytes / 1024 / 1024;
  return (
    (size.approximate ? "≈ " : "") +
    (value < 1 ? value.toFixed(2) : value.toFixed(1)) +
    " МБ"
  );
}
export function durationLabel(seconds: number | null) {
  if (seconds === null) return "Не указана";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600),
    m = Math.floor((total % 3600) / 60),
    s = total % 60;
  return h
    ? h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
    : m + ":" + String(s).padStart(2, "0");
}
