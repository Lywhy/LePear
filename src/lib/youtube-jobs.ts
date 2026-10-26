import { apiErrorMessage } from "@/lib/api-error-message";
export class YouTubeJobError extends Error {
  readonly retryAt: number | null;
  readonly status: number;
  readonly code: string;
  constructor(message: string, retryAt: number | null, status = 0, code = "") {
    super(message);
    this.retryAt = retryAt;
    this.status = status;
    this.code = code;
  }
}
export type VideoJob = {
  apiVersion: 1;
  id: string;
  requestId: string;
  videoId: string;
  kind: "video" | "audio" | "subtitles";
  subtitleTrackId: string | null;
  outputFormat: "original" | "mp3" | null;
  formatId: string;
  status:
    | "preparing"
    | "downloading"
    | "processing"
    | "cancelling"
    | "ready"
    | "failed"
    | "cancelled"
    | "expired";
  step: string;
  progress: {
    downloadedBytes: number;
    totalBytes: number | null;
    approximate: boolean;
    percent: number | null;
  };
  error: { code: string; message: string; retryAt?: number } | null;
  expiresAt: number | null;
  result: {
    filename: string;
    bytes: number;
    ext: string;
    height: number | null;
  } | null;
};
export const terminalJob = (job: VideoJob) =>
  ["ready", "failed", "cancelled", "expired"].includes(job.status);
export async function jobRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/youtube/" + path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      signal: init.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error(
      "Нет связи с API. Проверьте, что локальный сервис запущен.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("API вернул непонятный ответ. Проверьте запуск сервиса.");
  }
  if (!response.ok)
    throw new YouTubeJobError(
      apiErrorMessage(data, "Не удалось выполнить запрос."),
      Number.isFinite(data?.error?.retryAt) ? data.error.retryAt : null,
      response.status,
      typeof data?.error?.code === "string" ? data.error.code : "",
    );
  if (data?.apiVersion !== 1)
    throw new Error("Неподдерживаемый ответ сервиса.");
  return data as T;
}
export function cancelJobRequest(requestId: string) {
  return jobRequest("jobs/request/" + requestId, {
    method: "DELETE",
    keepalive: true,
  });
}
export function fileUrl(job: VideoJob) {
  return "/api/youtube/jobs/" + encodeURIComponent(job.id) + "/file";
}
