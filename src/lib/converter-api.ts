export type ConverterPhase =
  | "awaiting-upload"
  | "uploading"
  | "analysing"
  | "converting"
  | "checking"
  | "cancelling"
  | "cancelled"
  | "failed"
  | "ready"
  | "expired";
export interface ConverterLimits {
  inputBytes: number;
  outputBytes: number;
  durationSeconds: number;
  imagePixels: number;
  uploadTimeoutMs: number;
  jobTimeoutMs: number;
  ttlMs: number;
}
export const defaultConverterLimits: ConverterLimits = {
  inputBytes: 104857600,
  outputBytes: 536870912,
  durationSeconds: 1800,
  imagePixels: 25000000,
  uploadTimeoutMs: 120000,
  jobTimeoutMs: 300000,
  ttlMs: 900000,
};
export type ConverterMedia =
  | {
      category: "audio";
      format: string;
      codec: string;
      duration: number;
      sampleRate: number;
      channels: number;
    }
  | { category: "image"; format: string; width: number; height: number };
export interface ConverterJob {
  id: string;
  requestId: string;
  status: ConverterPhase;
  expiresAt: number | null;
  source: (ConverterMedia & { bytes: number }) | null;
  progress: { seconds: number; percent: number } | null;
  result: (ConverterMedia & { filename: string; bytes: number }) | null;
  error: { code: string; message: string } | null;
}
export class ConverterError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}
export async function converterRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch("/api/converter/" + path, {
      ...options,
      credentials: "same-origin",
      signal: AbortSignal.any([
        ...(options.signal ? [options.signal] : []),
        AbortSignal.timeout(12000),
      ]),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok)
      throw new ConverterError(
        body?.error?.message ||
          "API конвертера недоступно. Перезапустите pnpm api.",
        response.status,
      );
    if (body?.apiVersion !== 1)
      throw new ConverterError(
        "Обновите и перезапустите локальный API конвертера.",
      );
    return body as T;
  } catch (error) {
    if (options.signal?.aborted) throw options.signal.reason;
    if (error instanceof ConverterError) throw error;
    throw new ConverterError(
      "Нет связи с конвертером. Запустите pnpm api и повторите.",
    );
  }
}
export function uploadConverterFile(
  id: string,
  file: File,
  signal: AbortSignal,
  timeout: number,
  progress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = (error?: Error) => {
      signal.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve();
    };
    xhr.open("PUT", "/api/converter/jobs/" + id + "/input");
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.timeout = timeout + 10000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* A proxy may return a non-JSON error. */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.apiVersion === 1)
        finish();
      else
        finish(
          new ConverterError(
            body?.error?.message ||
              "Не удалось загрузить файл. Повторите конвертацию.",
            xhr.status,
          ),
        );
    };
    xhr.onerror = () =>
      finish(
        new ConverterError(
          "Загрузка прервана. Проверьте подключение к локальному API.",
        ),
      );
    xhr.ontimeout = () =>
      finish(new ConverterError("Превышено время загрузки файла."));
    xhr.onabort = () => finish(new DOMException("Отменено", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      signal.removeEventListener("abort", abort);
      reject(signal.reason);
      return;
    }
    xhr.send(file);
  });
}
export function saveConverterFile(job: ConverterJob) {
  const anchor = document.createElement("a");
  anchor.href = "/api/converter/jobs/" + job.id + "/file";
  anchor.download = job.result?.filename || "LePear-file";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export interface ConverterSession {
  apiVersion: 1;
  available: boolean;
  limits: ConverterLimits;
}
// Share an in-flight bootstrap so a quick click cannot race two new session cookies.
let sessionRequest: Promise<ConverterSession> | null = null;
export function getConverterSession() {
  sessionRequest ??= converterRequest<ConverterSession>("session")
    .then((session) => {
      if (!Number.isFinite(session.limits?.imagePixels))
        throw new ConverterError(
          "Перезапустите pnpm api: запущена предыдущая версия конвертера.",
        );
      return session;
    })
    .finally(() => {
      sessionRequest = null;
    });
  return sessionRequest;
}
