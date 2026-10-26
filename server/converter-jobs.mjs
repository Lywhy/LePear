import { randomBytes, randomUUID, createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir, open, readFile, readdir, rm, statfs } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ApiError } from "./config.mjs";
import { converterConfig as config } from "./converter-config.mjs";
import { convertFile } from "./converter-worker.mjs";
import { formatForName, targetFor } from "./converter-formats.mjs";
import { directoryBytes } from "./video-worker.mjs";

const jobs = new Map(),
  cancellations = new Map(),
  tasks = new Set();
const idPattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const requestPattern = /^[a-f0-9]{32}$/;
const active = new Set([
  "awaiting-upload",
  "uploading",
  "analysing",
  "converting",
  "checking",
  "cancelling",
]);
const lockPath = join(config.store, ".server.lock");
let ready = false,
  creating = 0,
  lock = null,
  cleaner = null,
  sweeping = false;
function folder(id) {
  const path = resolve(config.store, id);
  if (!idPattern.test(id) || dirname(path) !== resolve(config.store))
    throw new Error("Unsafe converter directory.");
  return path;
}
async function removeFiles(job) {
  if (job.readers) {
    job.removePending = true;
    return;
  }
  // Every recursive deletion is a verified immediate UUID child of the dedicated store.
  await rm(folder(job.id), { recursive: true, force: true });
  job.removePending = false;
}
export function converterAvailable() {
  return ready && existsSync(config.ffmpeg) && existsSync(config.ffprobe);
}
export function converterOwner(req, res, create = false) {
  let token = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("lepear_converter="))
    ?.slice("lepear_converter=".length);
  if (!/^[a-f0-9]{64}$/.test(token ?? "")) {
    if (!create)
      throw new ApiError(
        404,
        "JOB_NOT_FOUND",
        "Задание конвертации не найдено в этой сессии.",
      );
    token = randomBytes(32).toString("hex");
    res.setHeader(
      "Set-Cookie",
      "lepear_converter=" +
        token +
        "; HttpOnly; SameSite=Strict; Path=/api/converter; Max-Age=86400",
    );
  }
  return createHash("sha256").update(token).digest("hex");
}
export function converterDto(job) {
  return {
    apiVersion: 1,
    id: job.id,
    requestId: job.requestId,
    status: job.status,
    step: job.step,
    inputName: job.inputName,
    inputBytes: job.inputBytes,
    source: job.source,
    progress: job.progress,
    error: job.error,
    expiresAt: job.expiresAt,
    result: job.status === "ready" ? job.result : null,
  };
}
export function converterJob(owner, id) {
  const job = jobs.get(id);
  if (!job || job.owner !== owner)
    throw new ApiError(
      404,
      "JOB_NOT_FOUND",
      "Задание конвертации не найдено в этой сессии.",
    );
  if (job.status === "ready" && Date.now() >= job.expiresAt) {
    job.status = "expired";
    job.step = "expired";
    job.expiresAt = Date.now();
    void removeFiles(job).catch(() => {
      job.removePending = true;
    });
  }
  return job;
}
function abortJob(job, error) {
  if (active.has(job.status)) {
    job.status = "cancelling";
    job.step = "cancelling";
    job.controller.abort(error);
    job.completeUpload(false);
  } else {
    job.status = "expired";
    job.step = "expired";
    job.expiresAt = Date.now();
    void removeFiles(job).catch(() => {
      job.removePending = true;
    });
  }
}
export function cancelConverter(owner, requestId) {
  if (!requestPattern.test(requestId))
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      "Некорректный идентификатор запроса.",
    );
  cancellations.set(
    owner + ":" + requestId,
    Date.now() + config.timeoutMs + 60000,
  );
  if (cancellations.size > 1000)
    cancellations.delete(cancellations.keys().next().value);
  const job = [...jobs.values()].find(
    (item) => item.owner === owner && item.requestId === requestId,
  );
  if (job)
    abortJob(job, new ApiError(499, "CANCELLED", "Конвертация отменена."));
  return job ? converterDto(job) : { apiVersion: 1, status: "cancelled" };
}
export async function createConverterJob(owner, body) {
  if (!converterAvailable())
    throw new ApiError(
      503,
      "CONVERTER_UNAVAILABLE",
      "Конвертер недоступен. Установите FFmpeg/ffprobe и перезапустите API.",
    );
  if (
    !requestPattern.test(body.requestId ?? "") ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    body.name.length > 255
  )
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      "Выберите поддерживаемый файл и формат результата.",
    );
  if (
    !Number.isSafeInteger(body.bytes) ||
    body.bytes <= 0 ||
    body.bytes > config.maxInputBytes
  )
    throw new ApiError(
      413,
      "INPUT_LIMIT",
      "Исходный файл пуст или превышает допустимый размер.",
    );
  const inputFormat = formatForName(body.name);
  const target = targetFor(inputFormat, body.format);
  if (!inputFormat || !target)
    throw new ApiError(
      422,
      "UNSUPPORTED_CONVERSION",
      "Для этого файла выбран неподдерживаемый формат результата.",
    );
  const key = owner + ":" + body.requestId;
  if (cancellations.has(key))
    throw new ApiError(409, "CANCELLED", "Запрос уже отменён.");
  const previous = [...jobs.values()].find(
    (item) => item.owner === owner && item.requestId === body.requestId,
  );
  if (previous) return converterDto(previous);
  const count = [...jobs.values()].filter((job) =>
    active.has(job.status),
  ).length;
  if (
    count + creating >= config.maxConcurrent ||
    jobs.size >= config.maxRetained
  )
    throw new ApiError(
      429,
      "CONVERTER_BUSY",
      "Конвертер занят. Дождитесь завершения или отмены задания.",
    );
  creating++;
  try {
    let stored = 0;
    for (const entry of await readdir(config.store, { withFileTypes: true }))
      if (
        entry.isDirectory() &&
        !entry.isSymbolicLink() &&
        idPattern.test(entry.name)
      )
        stored += await directoryBytes(folder(entry.name));
    const reserve = config.maxInputBytes + config.maxOutputBytes + 16777216;
    const free = await statfs(config.store);
    if (
      stored + (count + creating) * reserve > config.maxStorageBytes ||
      Number(free.bavail) * Number(free.bsize) < reserve + 134217728
    )
      throw new ApiError(
        507,
        "STORAGE_LIMIT",
        "Недостаточно места для конвертации. Удалите предыдущий результат или дождитесь очистки.",
      );
    if (!ready || cancellations.has(key))
      throw new ApiError(409, "CANCELLED", "Запрос отменён.");
    const duplicate = [...jobs.values()].find(
      (item) => item.owner === owner && item.requestId === body.requestId,
    );
    if (duplicate) return converterDto(duplicate);
    const id = randomUUID();
    let completeUpload;
    const uploaded = new Promise((resolveUpload) => {
      completeUpload = resolveUpload;
    });
    const job = {
      id,
      owner,
      requestId: body.requestId,
      directory: folder(id),
      inputName: body.name.toWellFormed(),
      inputBytes: body.bytes,
      inputFormat,
      target,
      status: "awaiting-upload",
      step: "awaiting-upload",
      source: null,
      progress: null,
      error: null,
      result: null,
      expiresAt: null,
      readers: 0,
      removePending: false,
      controller: new AbortController(),
      uploaded,
      completeUpload,
      uploadFinished: null,
    };
    await mkdir(job.directory);
    if (!ready || cancellations.has(key)) {
      await rm(folder(id), { recursive: true, force: true });
      throw new ApiError(409, "CANCELLED", "Запрос отменён.");
    }
    jobs.set(id, job);
    const task = execute(job);
    tasks.add(task);
    void task.finally(() => tasks.delete(task));
    return converterDto(job);
  } finally {
    creating--;
  }
}
async function execute(job) {
  const fail = (code, message) => {
    job.controller.abort(new ApiError(504, code, message));
    job.completeUpload(false);
  };
  const timeout = setTimeout(
    () => fail("CONVERTER_TIMEOUT", "Превышено время конвертации."),
    config.timeoutMs,
  );
  const uploadTimeout = setTimeout(
    () => fail("UPLOAD_TIMEOUT", "Превышено время загрузки файла."),
    config.uploadTimeoutMs,
  );
  try {
    const uploaded = await job.uploaded;
    clearTimeout(uploadTimeout);
    if (!uploaded || job.controller.signal.aborted)
      throw (
        job.controller.signal.reason ??
        new ApiError(400, "UPLOAD_FAILED", "Не удалось загрузить файл.")
      );
    await convertFile(job);
    if (job.controller.signal.aborted) throw job.controller.signal.reason;
    job.status = "ready";
    job.step = "ready";
    job.expiresAt = Date.now() + config.ttlMs;
  } catch (error) {
    if (job.uploadFinished) await job.uploadFinished;
    const reason = job.controller.signal.aborted
      ? job.controller.signal.reason
      : error;
    job.status = reason?.code === "CANCELLED" ? "cancelled" : "failed";
    job.step = job.status;
    const storage = ["ENOSPC", "EACCES", "EPERM", "EROFS"].includes(
      reason?.code,
    );
    job.error = {
      code: storage ? "STORAGE_ERROR" : reason?.code || "CONVERSION_FAILED",
      message:
        reason instanceof ApiError
          ? reason.message
          : storage
            ? "Ошибка записи файла. Проверьте место и права доступа."
            : "Не удалось обработать файл. Выберите другой файл и повторите.",
    };
    job.expiresAt = Date.now() + 60000;
    try {
      await removeFiles(job);
    } catch {
      job.removePending = true;
    }
  } finally {
    clearTimeout(timeout);
    clearTimeout(uploadTimeout);
  }
}
export async function receiveConverterInput(owner, id, req) {
  const job = converterJob(owner, id);
  if (job.status !== "awaiting-upload")
    throw new ApiError(
      409,
      "UPLOAD_STATE",
      "Файл уже загружается либо задание завершено. Создайте новое задание.",
    );
  if (
    !/^application\/octet-stream(?:;|$)/i.test(
      req.headers["content-type"] ?? "",
    )
  )
    throw new ApiError(415, "CONTENT_TYPE", "Ожидается содержимое файла.");
  if (
    req.headers["content-length"] !== undefined &&
    Number(req.headers["content-length"]) !== job.inputBytes
  )
    throw new ApiError(
      400,
      "INPUT_SIZE_MISMATCH",
      "Размер загружаемого файла не соответствует выбранному.",
    );
  job.status = "uploading";
  job.step = "uploading";
  let finishUpload;
  job.uploadFinished = new Promise((resolveFinished) => {
    finishUpload = resolveFinished;
  });
  let bytes = 0;
  try {
    await pipeline(
      req,
      new Transform({
        transform(chunk, _encoding, callback) {
          bytes += chunk.length;
          if (bytes > config.maxInputBytes || bytes > job.inputBytes)
            callback(
              new ApiError(
                413,
                "INPUT_LIMIT",
                "Превышен размер исходного файла.",
              ),
            );
          else callback(null, chunk);
        },
      }),
      createWriteStream(join(job.directory, "source." + job.inputFormat.id), {
        flags: "wx",
      }),
      { signal: job.controller.signal },
    );
    if (bytes !== job.inputBytes)
      throw new ApiError(
        400,
        "INPUT_SIZE_MISMATCH",
        "Загрузка прервана: получен неполный файл.",
      );
    job.completeUpload(true);
    return converterDto(job);
  } catch (error) {
    const reason = job.controller.signal.aborted
      ? job.controller.signal.reason
      : error instanceof ApiError
        ? error
        : new ApiError(
            400,
            "UPLOAD_FAILED",
            "Загрузка файла прервана. Повторите конвертацию.",
          );
    job.controller.abort(reason);
    job.completeUpload(false);
    throw reason;
  } finally {
    finishUpload();
  }
}
export async function streamConverterFile(owner, id, res) {
  const job = converterJob(owner, id);
  if (job.status !== "ready")
    throw new ApiError(
      job.status === "expired" ? 410 : 409,
      "FILE_NOT_READY",
      "Файл не готов или срок хранения истёк. Выполните конвертацию заново.",
    );
  job.readers++;
  const filename = encodeURIComponent(job.result.filename).replace(
    /['()*]/g,
    (char) => "%" + char.charCodeAt(0).toString(16),
  );
  res.writeHead(200, {
    "Content-Type": job.target.mime,
    "Content-Length": job.result.bytes,
    "Content-Disposition":
      'attachment; filename="LePear-file.' +
      job.target.id +
      '"; filename*=UTF-8' +
      "''" +
      filename,
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
    if (job.removePending) await removeFiles(job).catch(() => {});
  }
}
async function sweep() {
  if (sweeping) return;
  sweeping = true;
  try {
    const now = Date.now();
    for (const [key, until] of cancellations)
      if (until <= now) cancellations.delete(key);
    for (const [id, job] of jobs) {
      if (!active.has(job.status) && job.expiresAt && now >= job.expiresAt) {
        job.status = "expired";
        job.step = "expired";
        job.expiredAt ??= now;
        try {
          await removeFiles(job);
        } catch {
          job.removePending = true;
        }
        if (!job.readers && !job.removePending && now - job.expiredAt > 60000)
          jobs.delete(id);
      } else if (job.removePending && !job.readers)
        await removeFiles(job).catch(() => {});
    }
  } finally {
    sweeping = false;
  }
}
export async function initializeConverter() {
  await mkdir(config.store, { recursive: true });
  try {
    lock = await open(lockPath, "wx");
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const previous = JSON.parse(await readFile(lockPath, "utf8"));
    if (!Number.isInteger(previous.pid) || previous.pid <= 0)
      throw new Error("Invalid converter store lock.");
    let alive = true;
    try {
      process.kill(previous.pid, 0);
    } catch (problem) {
      if (problem.code === "ESRCH") alive = false;
    }
    if (alive) throw new Error("Another API process owns converter store.");
    await rm(lockPath);
    lock = await open(lockPath, "wx");
  }
  await lock.writeFile(JSON.stringify({ pid: process.pid }));
  for (const entry of await readdir(config.store, { withFileTypes: true }))
    if (
      entry.isDirectory() &&
      !entry.isSymbolicLink() &&
      idPattern.test(entry.name)
    )
      await rm(folder(entry.name), { recursive: true, force: true });
  ready = true;
  cleaner = setInterval(() => {
    void sweep().catch(() => console.error("[converter] cleanup failed"));
  }, 10000);
  cleaner.unref();
}
export function stopConverter() {
  ready = false;
  clearInterval(cleaner);
  for (const job of jobs.values())
    if (active.has(job.status))
      abortJob(job, new ApiError(499, "CANCELLED", "API остановлен."));
}
export async function shutdownConverter() {
  stopConverter();
  await Promise.allSettled([...tasks]);
  for (const job of jobs.values()) await removeFiles(job).catch(() => {});
  if (lock) {
    await lock.close();
    await rm(lockPath, { force: true });
    lock = null;
  }
}
