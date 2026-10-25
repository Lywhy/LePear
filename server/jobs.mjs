import { assertSubtitleCooldown } from "./subtitle-rate-limit.mjs";
import { runSubtitleJob } from "./subtitle-worker.mjs";
import { runAudioJob } from "./audio-worker.mjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync, createReadStream } from "node:fs";
import { mkdir, readdir, rm, open, readFile, statfs } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pipeline } from "node:stream/promises";
import { config, ApiError } from "./config.mjs";
import { runVideoJob, directoryBytes } from "./video-worker.mjs";

const jobs = new Map(),
  cancellations = new Map();
const running = new Set();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const requestPattern = /^[a-f0-9]{32}$/;
const activeStates = new Set([
  "preparing",
  "downloading",
  "processing",
  "cancelling",
]);
let ready = false,
  creating = 0,
  lock = null,
  cleaner = null,
  sweeping = false;
const lockPath = resolve(config.store, ".server.lock");
const workspaceLimit = () => config.maxJobBytes * 2 + 16777216;
function folder(id) {
  const path = resolve(config.store, id);
  if (!uuid.test(id) || dirname(path) !== resolve(config.store))
    throw new Error("Unsafe job directory.");
  return path;
}
async function removeFolder(job) {
  if (job.readers) {
    job.removePending = true;
    return;
  }
  // Resolve and verify each recursive removal stays in the dedicated job root.
  await rm(folder(job.id), { recursive: true, force: true });
  job.removePending = false;
}
export function jobsAvailable() {
  return ready && existsSync(config.ffmpeg) && existsSync(config.ffprobe);
}
export function ownerFor(req, res, create = false) {
  let token = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("lepear_youtube="))
    ?.slice("lepear_youtube=".length);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create)
      throw new ApiError(
        404,
        "JOB_NOT_FOUND",
        "Задание не найдено или недоступно в этой сессии.",
      );
    token = randomBytes(32).toString("hex");
    res.setHeader(
      "Set-Cookie",
      "lepear_youtube=" +
        token +
        "; HttpOnly; SameSite=Strict; Path=/api/youtube; Max-Age=86400",
    );
  }
  return createHash("sha256").update(token).digest("hex");
}
export function jobDto(job) {
  return {
    apiVersion: 1,
    id: job.id,
    requestId: job.requestId,
    videoId: job.videoId,
    kind: job.kind,
    outputFormat: job.outputFormat,
    formatId: job.formatId,
    subtitleTrackId: job.subtitleTrackId,
    status: job.status,
    step: job.step,
    progress: job.progress,
    error: job.error,
    expiresAt: job.expiresAt,
    result:
      job.status === "ready"
        ? {
            filename: job.filename,
            bytes: job.bytes,
            ext: job.ext,
            height: job.height,
          }
        : null,
  };
}
export function ownedJob(owner, id) {
  const job = jobs.get(id);
  if (!job || job.owner !== owner)
    throw new ApiError(
      404,
      "JOB_NOT_FOUND",
      "Задание не найдено или недоступно в этой сессии.",
    );
  if (job.status === "ready" && Date.now() >= job.expiresAt) {
    job.status = "expired";
    job.expiredAt = Date.now();
    job.expiresAt = Date.now();
    void removeFolder(job).catch(() => {});
  }
  return job;
}
function requestKey(owner, id) {
  return owner + ":" + id;
}
function cancel(job) {
  if (activeStates.has(job.status)) {
    job.status = "cancelling";
    job.step = "cancelling";
    job.controller.abort(new ApiError(499, "CANCELLED", "Задание отменено."));
  } else {
    job.status = "expired";
    job.expiredAt = Date.now();
    job.expiresAt = Date.now();
    void removeFolder(job).catch(() => {});
  }
}
export function cancelByRequest(owner, requestId) {
  if (!requestPattern.test(requestId))
    throw new ApiError(
      400,
      "INVALID_JOB_REQUEST",
      "Некорректный идентификатор запроса.",
    );
  const key = requestKey(owner, requestId);
  cancellations.set(key, Date.now() + config.jobTimeoutMs + 60000);
  if (cancellations.size > 1000)
    cancellations.delete(cancellations.keys().next().value);
  const job = [...jobs.values()].find(
    (item) => item.owner === owner && item.requestId === requestId,
  );
  if (job) cancel(job);
  return job ? jobDto(job) : { apiVersion: 1, status: "cancelled" };
}
export function cancelOwned(owner, id) {
  const job = ownedJob(owner, id);
  cancel(job);
  return jobDto(job);
}
export async function createMediaJob(owner, body) {
  if (!ready)
    throw new ApiError(
      503,
      "STORE_UNAVAILABLE",
      "Хранилище заданий недоступно. Проверьте запуск API.",
    );
  if (!jobsAvailable())
    throw new ApiError(
      503,
      "TOOLS_MISSING",
      "Установите FFmpeg/ffprobe для скачивания.",
    );
  if (!["video", "audio", "subtitles"].includes(body.kind))
    throw new ApiError(
      400,
      "INVALID_MEDIA_KIND",
      "Этот режим скачивания не поддерживается. Перезапустите API и обновите страницу.",
    );
  if (
    typeof body.videoId !== "string" ||
    !/^[A-Za-z0-9_-]{11}$/.test(body.videoId)
  )
    throw new ApiError(
      400,
      "INVALID_VIDEO_ID",
      "Вставьте ссылку в общее поле и нажмите «Получить данные». Переходить во вкладку «Видео» не нужно.",
    );
  if (
    typeof body.formatId !== "string" ||
    !/^[A-Za-z0-9_.-]{1,100}$/.test(body.formatId)
  )
    throw new ApiError(
      400,
      "INVALID_FORMAT",
      "Выберите качество или обновите данные по ссылке.",
    );
  if (body.kind === "audio" && !["original", "mp3"].includes(body.outputFormat))
    throw new ApiError(
      400,
      "INVALID_AUDIO_OUTPUT",
      "Выберите исходный формат или MP3.",
    );
  if (
    typeof body.requestId !== "string" ||
    !requestPattern.test(body.requestId)
  )
    throw new ApiError(
      400,
      "INVALID_JOB_REQUEST",
      "Не удалось создать запрос скачивания. Обновите страницу.",
    );
  if (
    body.kind === "subtitles" &&
    (!["vtt", "srt"].includes(body.formatId) ||
      typeof body.subtitleTrackId !== "string" ||
      !/^(manual|automatic):[A-Za-z0-9_-]{1,80}$/.test(body.subtitleTrackId))
  )
    throw new ApiError(
      400,
      "INVALID_SUBTITLE_SELECTION",
      "Выберите дорожку субтитров и формат VTT или SRT.",
    );
  const key = requestKey(owner, body.requestId);
  if (cancellations.has(key))
    throw new ApiError(409, "CANCELLED", "Запрос уже отменён.");
  const existing = [...jobs.values()].find(
    (item) => item.owner === owner && item.requestId === body.requestId,
  );
  if (existing) return jobDto(existing);
  if (body.kind === "subtitles") await assertSubtitleCooldown();
  const active = [...jobs.values()].filter((job) =>
    activeStates.has(job.status),
  ).length;
  if (
    active + creating >= config.maxJobs ||
    jobs.size >= config.maxRetainedJobs
  )
    throw new ApiError(
      429,
      "JOB_LIMIT",
      "Достигнут лимит заданий. Дождитесь завершения или удаления результата.",
    );
  creating++;
  try {
    let stored = 0;
    for (const entry of await readdir(config.store, { withFileTypes: true }))
      if (entry.isDirectory() && uuid.test(entry.name))
        stored += await directoryBytes(folder(entry.name));
    const free = await statfs(config.store);
    if (
      stored + (active + creating) * workspaceLimit() >
        config.maxStorageBytes ||
      Number(free.bavail) * Number(free.bsize) < workspaceLimit() + 134217728
    )
      throw new ApiError(
        507,
        "STORAGE_LIMIT",
        "Недостаточно места для нового задания. Удалите предыдущий результат.",
      );
    if (cancellations.has(key))
      throw new ApiError(409, "CANCELLED", "Запрос уже отменён.");
    const duplicate = [...jobs.values()].find(
      (item) => item.owner === owner && item.requestId === body.requestId,
    );
    if (duplicate) return jobDto(duplicate);
    if (!ready) throw new ApiError(503, "STOPPING", "API останавливается.");
    const id = randomUUID();
    const job = {
      id,
      owner,
      requestId: body.requestId,
      videoId: body.videoId,
      kind: body.kind,
      outputFormat: body.kind === "audio" ? body.outputFormat : null,
      formatId: body.formatId,
      subtitleTrackId: body.kind === "subtitles" ? body.subtitleTrackId : null,
      status: "preparing",
      step: "preparing",
      progress: {
        downloadedBytes: 0,
        totalBytes: null,
        approximate: false,
        percent: null,
      },
      error: null,
      expiresAt: null,
      directory: folder(id),
      controller: new AbortController(),
      readers: 0,
      removePending: false,
    };
    await mkdir(job.directory);
    if (cancellations.has(key) || !ready) {
      await rm(folder(id), { recursive: true, force: true });
      throw new ApiError(409, "CANCELLED", "Запрос скачивания отменён.");
    }
    jobs.set(id, job);
    const task = execute(job);
    running.add(task);
    task.finally(() => running.delete(task));
    return jobDto(job);
  } finally {
    creating--;
  }
}
async function execute(job) {
  const timeout = setTimeout(
    () =>
      job.controller.abort(
        new ApiError(504, "JOB_TIMEOUT", "Превышено время обработки файла."),
      ),
    config.jobTimeoutMs,
  );
  try {
    if (job.kind === "subtitles") await runSubtitleJob(job);
    else if (job.kind === "audio") await runAudioJob(job);
    else await runVideoJob(job);
    if (job.controller.signal.aborted) throw job.controller.signal.reason;
    job.status = "ready";
    job.step = "ready";
    job.expiresAt = Date.now() + config.jobTtlMs;
  } catch (error) {
    const reason = job.controller.signal.aborted
      ? job.controller.signal.reason
      : error;
    job.status = reason?.code === "CANCELLED" ? "cancelled" : "failed";
    job.step = job.status;
    job.error = {
      code: reason?.code || "PROCESSING_FAILED",
      ...(Number.isFinite(reason?.retryAt) ? { retryAt: reason.retryAt } : {}),
      message:
        reason instanceof ApiError
          ? reason.message
          : "Ошибка обработки файла. Обновите данные и повторите.",
    };
    job.expiresAt = Date.now() + 60000;
    try {
      await removeFolder(job);
    } catch {
      job.removePending = true;
    }
  } finally {
    clearTimeout(timeout);
  }
}
export async function streamJob(owner, id, res) {
  const job = ownedJob(owner, id);
  if (job.status !== "ready")
    throw new ApiError(
      job.status === "expired" ? 410 : 409,
      "FILE_NOT_READY",
      job.status === "expired"
        ? "Срок хранения файла истёк. Создайте новое задание."
        : "Файл ещё не готов.",
    );
  job.readers++;
  const name = encodeURIComponent(job.filename).replace(
    /['()*]/g,
    (char) => "%" + char.charCodeAt(0).toString(16),
  );
  res.writeHead(200, {
    "Content-Type":
      job.kind === "subtitles"
        ? job.ext === "vtt"
          ? "text/vtt; charset=utf-8"
          : "application/x-subrip; charset=utf-8"
        : job.kind === "audio"
          ? { m4a: "audio/mp4", opus: "audio/ogg", mp3: "audio/mpeg" }[
              job.ext
            ] || "application/octet-stream"
          : job.ext === "mp4"
            ? "video/mp4"
            : "video/webm",
    "Content-Length": job.bytes,
    "Content-Disposition":
      'attachment; filename="LePear-' +
      job.videoId +
      "." +
      job.ext +
      '"; filename*=UTF-8' +
      "''" +
      name,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "none",
  });
  try {
    await pipeline(createReadStream(job.file), res);
  } catch {
    if (!res.destroyed) res.destroy();
  } finally {
    job.readers--;
    if (job.removePending) await removeFolder(job).catch(() => {});
  }
}
async function sweepJobs() {
  if (sweeping) return;
  sweeping = true;
  try {
    const now = Date.now();
    for (const [key, until] of cancellations)
      if (until < now) cancellations.delete(key);
    for (const [id, job] of jobs) {
      if (
        !activeStates.has(job.status) &&
        job.expiresAt &&
        now >= job.expiresAt
      ) {
        job.status = "expired";
        job.expiredAt ??= now;
        try {
          await removeFolder(job);
        } catch {
          job.removePending = true;
        }
        if (!job.readers && !job.removePending && now - job.expiredAt > 60000)
          jobs.delete(id);
      } else if (job.removePending && !job.readers)
        await removeFolder(job).catch(() => {});
    }
  } finally {
    sweeping = false;
  }
}
export async function initializeJobs() {
  await mkdir(config.store, { recursive: true });
  try {
    lock = await open(lockPath, "wx");
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const previous = JSON.parse(await readFile(lockPath, "utf8"));
    if (!Number.isInteger(previous.pid) || previous.pid <= 0)
      throw new Error(
        "Invalid job-store lock; inspect .youtube-downloads/.server.lock.",
      );
    let alive = true;
    try {
      process.kill(previous.pid, 0);
    } catch (problem) {
      if (problem.code === "ESRCH") alive = false;
    }
    if (alive) throw new Error("Another API process owns .youtube-downloads.");
    await rm(lockPath);
    lock = await open(lockPath, "wx");
  }
  await lock.writeFile(JSON.stringify({ pid: process.pid }));
  for (const entry of await readdir(config.store, { withFileTypes: true }))
    if (entry.isDirectory() && !entry.isSymbolicLink() && uuid.test(entry.name))
      await rm(folder(entry.name), { recursive: true, force: true });
  ready = true;
  cleaner = setInterval(() => {
    void sweepJobs().catch(() => console.error("[youtube] cleanup failed"));
  }, 10000);
  cleaner.unref();
}
export function stopJobs() {
  ready = false;
  clearInterval(cleaner);
  for (const job of jobs.values())
    if (activeStates.has(job.status))
      job.controller.abort(new ApiError(499, "CANCELLED", "API остановлен."));
}
export async function shutdownJobs() {
  stopJobs();
  await Promise.allSettled([...running]);
  for (const job of jobs.values()) await removeFolder(job).catch(() => {});
  if (lock) {
    await lock.close();
    await rm(lockPath, { force: true });
    lock = null;
  }
}
