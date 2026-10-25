import { createWriteStream } from "node:fs";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { setTimeout as pause } from "node:timers/promises";
import { ApiError } from "./config.mjs";

function checkedUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ApiError(
      502,
      "SUBTITLE_URL_INVALID",
      "YouTube вернул некорректный адрес субтитров.",
    );
  }
  const valid =
    (["youtube.com", "www.youtube.com"].includes(url.hostname) &&
      url.pathname === "/api/timedtext") ||
    (url.hostname === "video.google.com" && url.pathname === "/timedtext");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !valid
  )
    throw new ApiError(
      502,
      "SUBTITLE_URL_INVALID",
      "YouTube вернул неподдерживаемый адрес субтитров.",
    );
  return url;
}
function requestHeaders(headers, watchUrl) {
  const result = new Headers({
    Accept: "text/vtt,text/plain,application/octet-stream;q=0.8",
    Referer: watchUrl,
  });
  const allowed = new Set([
    "user-agent",
    "accept",
    "accept-language",
    "referer",
    "origin",
    "x-youtube-client-name",
    "x-youtube-client-version",
  ]);
  for (const source of headers)
    for (const [key, value] of Object.entries(source ?? {})) {
      if (
        allowed.has(key.toLowerCase()) &&
        typeof value === "string" &&
        !/[\r\n]/.test(value)
      )
        result.set(key, value);
    }
  return result;
}
export async function downloadSubtitleFile(
  entry,
  output,
  { signal, maxBytes, watchUrl, headers },
) {
  const url = checkedUrl(entry.url);
  await pause(5000, undefined, { signal });
  const timeout = AbortSignal.timeout(30000);
  const requestSignal = AbortSignal.any([signal, timeout]);
  let response;
  try {
    response = await fetch(url, {
      headers: requestHeaders([headers, entry.http_headers], watchUrl),
      redirect: "manual",
      signal: requestSignal,
    });
    if (!response.ok) {
      await response.body?.cancel();
      if (response.status === 429) {
        const error = new ApiError(
          429,
          "SUBTITLE_RATE_LIMIT",
          "YouTube ограничил запросы субтитров (HTTP 429).",
        );
        const retry = response.headers.get("retry-after");
        const seconds =
          retry && /^\d+$/.test(retry.trim()) ? Number(retry.trim()) : NaN;
        const retryAt = Number.isFinite(seconds)
          ? Date.now() + seconds * 1000
          : Date.parse(retry ?? "");
        if (Number.isFinite(retryAt) && retryAt > Date.now())
          error.retryAt = Math.min(retryAt, Date.now() + 86400000);
        throw error;
      }
      if (response.status === 403)
        throw new ApiError(
          403,
          "SUBTITLE_FORBIDDEN",
          "YouTube отказал в доступе к выбранным субтитрам (HTTP 403). Получите данные по ссылке заново и повторите позже.",
        );
      if (response.status === 404 || response.status === 410)
        throw new ApiError(
          422,
          "SUBTITLE_NOT_FOUND",
          "Выбранная дорожка больше не доступна. Обновите данные по ссылке.",
        );
      if (response.status >= 300 && response.status < 400)
        throw new ApiError(
          502,
          "SUBTITLE_REDIRECT",
          "Сервер субтитров вернул перенаправление. Обновите данные по ссылке.",
        );
      throw new ApiError(
        502,
        "SUBTITLE_HTTP_ERROR",
        "Сервер субтитров ответил HTTP " +
          response.status +
          ". Повторите позже.",
      );
    }
    if (!response.body)
      throw new ApiError(
        502,
        "EMPTY_SUBTITLES",
        "Сервер вернул пустой ответ субтитров.",
      );
    const announced = Number(response.headers.get("content-length"));
    if (Number.isFinite(announced) && announced > maxBytes) {
      await response.body.cancel();
      throw new ApiError(
        413,
        "SUBTITLE_SIZE",
        "Файл субтитров превышает допустимый размер.",
      );
    }
    let size = 0;
    await pipeline(
      Readable.fromWeb(response.body),
      new Transform({
        transform(chunk, _encoding, callback) {
          size += chunk.length;
          if (size > maxBytes)
            callback(
              new ApiError(
                413,
                "SUBTITLE_SIZE",
                "Файл субтитров превышает допустимый размер.",
              ),
            );
          else callback(null, chunk);
        },
      }),
      createWriteStream(output, { flags: "wx" }),
      { signal: requestSignal },
    );
    if (!size)
      throw new ApiError(
        422,
        "EMPTY_SUBTITLES",
        "YouTube вернул пустые субтитры для выбранной дорожки.",
      );
  } catch (error) {
    if (signal.aborted) throw signal.reason;
    if (timeout.aborted)
      throw new ApiError(
        504,
        "SUBTITLE_TIMEOUT",
        "Сервер субтитров не ответил за 30 секунд. Повторите позже.",
      );
    if (error instanceof ApiError) throw error;
    if (["ENOSPC", "EACCES", "EPERM", "EROFS"].includes(error.code))
      throw new ApiError(
        507,
        "SUBTITLE_STORAGE_ERROR",
        "Не удалось записать субтитры. Проверьте свободное место и доступ к папке проекта.",
      );
    throw new ApiError(
      502,
      "SUBTITLE_NETWORK_ERROR",
      "Не удалось загрузить субтитры из-за ошибки соединения. Проверьте сеть и повторите позже.",
    );
  }
}
