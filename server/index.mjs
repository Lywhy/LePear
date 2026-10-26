import { converterConfig } from "./converter-config.mjs";
import { converterRoutes } from "./converter-routes.mjs";
import {
  initializeConverter,
  stopConverter,
  shutdownConverter,
} from "./converter-jobs.mjs";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { config, ApiError, bundledToolExists } from "./config.mjs";
import { parseVideoUrl } from "./youtube-url.mjs";
import { extractMetadata } from "./extractor.mjs";
import { normalizeMetadata } from "./metadata.mjs";

import {
  initializeJobs,
  jobsAvailable,
  ownerFor,
  jobDto,
  ownedJob,
  cancelByRequest,
  cancelOwned,
  createMediaJob,
  streamJob,
  stopJobs,
  shutdownJobs,
} from "./jobs.mjs";
let active = 0;
const windows = new Map();
const controllers = new Set();
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [key, item] of windows) if (item.until <= now) windows.delete(key);
}, 60000);
sweep.unref();

function json(res, status, body) {
  if (res.destroyed || res.writableEnded || res.headersSent) return;
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(body));
}
function bodyOf(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0,
      done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new ApiError(408, "REQUEST_TIMEOUT", "Превышено время запроса."));
    }, 10000);
    req.once("aborted", () => {
      clearTimeout(timer);
      if (!done) {
        done = true;
        reject(new ApiError(400, "REQUEST_ABORTED", "Запрос прерван."));
      }
    });
    req.on("data", (chunk) => {
      if (done) return;
      bytes += chunk.length;
      if (bytes > config.maxBodyBytes) {
        done = true;
        clearTimeout(timer);
        reject(new ApiError(413, "BODY_LIMIT", "Запрос слишком большой."));
      } else chunks.push(chunk);
    });
    req.on("end", () => {
      clearTimeout(timer);
      if (done) return;
      done = true;
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!body || typeof body !== "object" || Array.isArray(body))
          throw new Error();
        resolve(body);
      } catch {
        reject(
          new ApiError(
            400,
            "INVALID_JSON",
            "Некорректный запрос. Повторите ввод ссылки.",
          ),
        );
      }
    });
    req.on("error", () => {
      clearTimeout(timer);
      if (!done) {
        done = true;
        reject(new ApiError(400, "REQUEST_ABORTED", "Запрос прерван."));
      }
    });
  });
}
const server = createServer(
  {
    maxHeaderSize: 8192,
    requestTimeout: converterConfig.uploadTimeoutMs + 10000,
    headersTimeout: 10000,
  },
  async (req, res) => {
    const requestId = randomUUID();
    try {
      if (
        !["localhost:" + config.port, "127.0.0.1:" + config.port].includes(
          req.headers.host,
        )
      )
        throw new ApiError(403, "INVALID_HOST", "Этот адрес API не разрешён.");
      const origin = req.headers.origin;
      if (origin && !config.origins.has(origin))
        throw new ApiError(
          403,
          "INVALID_ORIGIN",
          "Запрос с этого адреса сайта не разрешён.",
        );
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      }
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
      if (await converterRoutes(req, res, { json, bodyOf })) return;
      if (req.url === "/api/health" && req.method === "GET") {
        json(res, 200, {
          apiVersion: 1,
          status: "ok",
          capabilities: { metadata: true, downloads: jobsAvailable() },
          extractorFilePresent: bundledToolExists,
          limits: {
            durationSeconds: config.maxDuration,
            fileBytes: config.maxJobBytes,
            concurrentJobs: config.maxJobs,
            jobTimeoutMs: config.jobTimeoutMs,
            fileTtlMs: config.jobTtlMs,
            concurrentMetadata: config.maxConcurrent,
            requestsPerMinute: config.rateLimit,
          },
        });
        return;
      }
      if (req.url === "/api/youtube/session" && req.method === "GET") {
        ownerFor(req, res, true);
        json(res, 200, {
          apiVersion: 1,
          capabilities: { audioDownloads: true, subtitleDownloads: true },
        });
        return;
      }
      const cancellation =
        /^\/api\/youtube\/jobs\/request\/([a-f0-9]{32})$/.exec(req.url);
      if (cancellation && req.method === "DELETE") {
        json(res, 200, cancelByRequest(ownerFor(req, res), cancellation[1]));
        return;
      }
      const resource = /^\/api\/youtube\/jobs\/([a-f0-9-]{36})(\/file)?$/.exec(
        req.url,
      );
      if (resource) {
        const owner = ownerFor(req, res);
        if (req.method === "GET" && resource[2]) {
          await streamJob(owner, resource[1], res);
          return;
        }
        if (req.method === "GET") {
          json(res, 200, jobDto(ownedJob(owner, resource[1])));
          return;
        }
        if (req.method === "DELETE" && !resource[2]) {
          json(res, 200, cancelOwned(owner, resource[1]));
          return;
        }
        throw new ApiError(
          405,
          "METHOD_NOT_ALLOWED",
          "Метод не поддерживается.",
        );
      }
      if (
        req.url !== "/api/youtube/metadata" &&
        req.url !== "/api/youtube/jobs"
      )
        throw new ApiError(404, "NOT_FOUND", "Такого метода API нет.");
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        throw new ApiError(
          405,
          "METHOD_NOT_ALLOWED",
          "Используйте POST для получения данных.",
        );
      }
      if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] || ""))
        throw new ApiError(415, "CONTENT_TYPE", "Ожидается JSON.");
      const address = req.socket.remoteAddress || "local";
      const now = Date.now();
      let window = windows.get(address);
      if (!window || window.until <= now) {
        window = { count: 0, until: now + 60000 };
        windows.set(address, window);
      }
      if (++window.count > config.rateLimit) {
        res.setHeader("Retry-After", Math.ceil((window.until - now) / 1000));
        throw new ApiError(
          429,
          "RATE_LIMIT",
          "Слишком много запросов. Подождите минуту и повторите.",
        );
      }
      const body = await bodyOf(req);
      if (req.url === "/api/youtube/jobs") {
        const owner = ownerFor(req, res, true);
        const disconnect = () => {
          if (!res.writableEnded && /^[a-f0-9]{32}$/.test(body.requestId || ""))
            cancelByRequest(owner, body.requestId);
        };
        res.on("close", disconnect);
        try {
          if (res.destroyed || req.aborted) {
            disconnect();
            return;
          }
          const job = await createMediaJob(owner, body);
          if (res.destroyed) {
            cancelByRequest(owner, body.requestId);
            return;
          }
          json(res, 202, job);
        } finally {
          res.removeListener("close", disconnect);
        }
        return;
      }
      const video = parseVideoUrl(body.url);
      if (active >= config.maxConcurrent) {
        res.setHeader("Retry-After", "3");
        throw new ApiError(
          429,
          "BUSY",
          "Сервис занят. Повторите запрос через несколько секунд.",
        );
      }
      const controller = new AbortController();
      const onDisconnect = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.on("close", onDisconnect);
      if (req.aborted || res.destroyed) return;
      active++;
      controllers.add(controller);
      try {
        const extracted = await extractMetadata(video, controller.signal);
        const result = normalizeMetadata(extracted, video);
        result.capabilities.downloads = jobsAvailable();
        json(res, 200, result);
      } finally {
        active--;
        controllers.delete(controller);
        res.removeListener("close", onDisconnect);
      }
    } catch (error) {
      const known = error instanceof ApiError;
      const status = known ? error.status : 500;
      const code = known ? error.code : "INTERNAL_ERROR";
      console.error(
        req.url.startsWith("/api/converter/") ? "[converter]" : "[youtube]",
        requestId,
        code,
      );
      if (Number.isFinite(error.retryAt))
        res.setHeader(
          "Retry-After",
          Math.max(1, Math.ceil((error.retryAt - Date.now()) / 1000)),
        );
      json(res, status, {
        apiVersion: 1,
        error: {
          code,
          ...(Number.isFinite(error.retryAt) ? { retryAt: error.retryAt } : {}),
          message: known
            ? error.message
            : "Ошибка сервиса. Повторите запрос позже.",
          requestId,
        },
      });
    }
  },
);
server.on("error", (error) => {
  console.error("YouTube API:", error.code || error.message);
  process.exitCode = 1;
});
server.listen(config.port, "127.0.0.1", async () => {
  console.log("LePear local API: http://127.0.0.1:" + config.port);
  try {
    await initializeConverter();
  } catch (error) {
    console.error("[converter] Storage unavailable:", error.message);
  }
  try {
    await initializeJobs();
  } catch (error) {
    console.error("[youtube] Job storage unavailable:", error.message);
  }
});
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  clearInterval(sweep);
  for (const controller of controllers) controller.abort();
  stopJobs();
  stopConverter();
  server.close(() => {
    void Promise.all([shutdownJobs(), shutdownConverter()]).catch(() => {
      process.exitCode = 1;
    });
  });
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
