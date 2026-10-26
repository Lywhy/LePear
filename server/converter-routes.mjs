import { converterFormats } from "./converter-formats.mjs";
import { ApiError } from "./config.mjs";
import { converterConfig } from "./converter-config.mjs";
import {
  converterAvailable,
  converterOwner,
  converterDto,
  converterJob,
  cancelConverter,
  createConverterJob,
  receiveConverterInput,
  streamConverterFile,
} from "./converter-jobs.mjs";
const windows = new Map();
export async function converterRoutes(req, res, { json, bodyOf }) {
  if (!req.url.startsWith("/api/converter/")) return false;
  if (req.url === "/api/converter/session" && req.method === "GET") {
    converterOwner(req, res, true);
    json(res, 200, {
      apiVersion: 1,
      available: converterAvailable(),
      formats: converterFormats,
      limits: {
        imagePixels: converterConfig.maxPixels,
        inputBytes: converterConfig.maxInputBytes,
        outputBytes: converterConfig.maxOutputBytes,
        durationSeconds: converterConfig.maxDuration,
        uploadTimeoutMs: converterConfig.uploadTimeoutMs,
        jobTimeoutMs: converterConfig.timeoutMs,
        ttlMs: converterConfig.ttlMs,
      },
    });
    return true;
  }
  const owner = converterOwner(req, res);
  const cancellation = /^\/api\/converter\/jobs\/request\/([a-f0-9]{32})$/.exec(
    req.url,
  );
  if (cancellation && req.method === "DELETE") {
    json(res, 200, cancelConverter(owner, cancellation[1]));
    return true;
  }
  if (req.url === "/api/converter/jobs" && req.method === "POST") {
    if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] ?? ""))
      throw new ApiError(415, "CONTENT_TYPE", "Ожидается JSON.");
    const now = Date.now();
    for (const [key, value] of windows)
      if (value.until < now) windows.delete(key);
    const address = req.socket.remoteAddress || "local";
    const window = windows.get(address) ?? { count: 0, until: now + 60000 };
    windows.set(address, window);
    if (++window.count > 10)
      throw new ApiError(
        429,
        "RATE_LIMIT",
        "Слишком много запросов. Подождите минуту.",
      );
    const body = await bodyOf(req);
    const disconnect = () => {
      if (!res.writableEnded && /^[a-f0-9]{32}$/.test(body.requestId ?? ""))
        cancelConverter(owner, body.requestId);
    };
    res.on("close", disconnect);
    try {
      if (res.destroyed || req.aborted) {
        disconnect();
        return true;
      }
      const job = await createConverterJob(owner, body);
      if (res.destroyed) {
        cancelConverter(owner, body.requestId);
        return true;
      }
      json(res, 202, job);
    } finally {
      res.removeListener("close", disconnect);
    }
    return true;
  }
  const resource =
    /^\/api\/converter\/jobs\/([a-f0-9-]{36})(\/input|\/file)?$/.exec(req.url);
  if (resource) {
    if (req.method === "GET" && resource[2] === "/file")
      await streamConverterFile(owner, resource[1], res);
    else if (req.method === "GET" && !resource[2])
      json(res, 200, converterDto(converterJob(owner, resource[1])));
    else if (req.method === "PUT" && resource[2] === "/input") {
      const job = converterJob(owner, resource[1]);
      const disconnect = () => {
        if (!res.writableEnded) cancelConverter(owner, job.requestId);
      };
      res.on("close", disconnect);
      try {
        json(res, 202, await receiveConverterInput(owner, resource[1], req));
      } catch (error) {
        if (job.status === "awaiting-upload")
          cancelConverter(owner, job.requestId);
        throw error;
      } finally {
        res.removeListener("close", disconnect);
      }
    } else
      throw new ApiError(405, "METHOD_NOT_ALLOWED", "Метод не поддерживается.");
    return true;
  }
  throw new ApiError(404, "NOT_FOUND", "Такого метода конвертера нет.");
}
