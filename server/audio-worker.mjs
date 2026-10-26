import { youtubeDownloadFilename } from "./download-filename.mjs";
import { stat, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { config, ApiError } from "./config.mjs";
import { parseVideoUrl } from "./youtube-url.mjs";
import { extractMetadata } from "./extractor.mjs";
import { normalizeMetadata } from "./metadata.mjs";
import { runTool, downloadArgs } from "./job-process.mjs";
import { directoryBytes, probe, progressLine } from "./video-worker.mjs";

export async function runAudioJob(job) {
  const { signal } = job.controller;
  const video = parseVideoUrl("https://www.youtube.com/watch?v=" + job.videoId);
  const data = normalizeMetadata(await extractMetadata(video, signal), video);
  if (data.video.duration === null)
    throw new ApiError(
      422,
      "UNKNOWN_DURATION",
      "Не удалось определить длительность ролика.",
    );
  if (!data.formats.audio.length)
    throw new ApiError(
      422,
      "NO_AUDIO",
      "Отдельная аудиодорожка недоступна. Выберите другой ролик.",
    );
  const selected = data.formats.audio.find(
    (format) =>
      format.id === job.formatId &&
      ["m4a", "webm", "opus", "mp3"].includes(format.ext),
  );
  if (!selected)
    throw new ApiError(
      422,
      "FORMAT_CHANGED",
      "Выбранная аудиодорожка больше не доступна. Обновите данные ролика.",
    );
  const originalExt =
    selected.ext === "m4a" && /^(mp4a|aac)/i.test(selected.codec)
      ? "m4a"
      : /^opus/i.test(selected.codec)
        ? "opus"
        : null;
  if (job.outputFormat === "original" && !originalExt)
    throw new ApiError(
      422,
      "AUDIO_FORMAT_UNSUPPORTED",
      "Для этой дорожки доступна только конвертация в MP3.",
    );
  if (selected.size && selected.size.bytes > config.maxJobBytes)
    throw new ApiError(
      413,
      "FILE_LIMIT",
      "Аудиодорожка превышает лимит размера.",
    );
  job.ext = job.outputFormat === "mp3" ? "mp3" : originalExt;
  job.height = null;
  const input = join(job.directory, "source." + selected.ext);
  const output = join(job.directory, "result." + job.ext);
  let monitoring = true,
    watching = false;
  const watcher = setInterval(async () => {
    if (!monitoring || watching || signal.aborted) return;
    watching = true;
    try {
      const bytes = await directoryBytes(job.directory);
      let resultSize = 0;
      try {
        resultSize = (await stat(output)).size;
      } catch {
        /* Output not created yet. */
      }
      const limit =
        job.status === "downloading"
          ? config.maxJobBytes
          : config.maxJobBytes * 2 + 16777216;
      if (bytes > limit || resultSize > config.maxJobBytes)
        job.controller.abort(
          new ApiError(413, "FILE_LIMIT", "Превышен лимит размера аудио."),
        );
    } catch {
      if (monitoring)
        job.controller.abort(
          new ApiError(500, "STORAGE_ERROR", "Временное хранилище недоступно."),
        );
    } finally {
      watching = false;
    }
  }, 400);
  try {
    job.status = "downloading";
    job.step = "audio";
    await runTool(
      config.ytDlp,
      [
        ...downloadArgs(
          video.url,
          selected.id,
          input,
          config.maxJobBytes,
        ).slice(0, -2),
        "--ffmpeg-location",
        config.ffmpeg,
        "--",
        video.url,
      ],
      { signal, onLine: (line) => progressLine(job, line) },
    );
    const source = await probe(input, signal);
    if (
      !source.streams?.some((stream) => stream.codec_type === "audio") ||
      source.streams.some((stream) => stream.codec_type === "video")
    )
      throw new ApiError(
        502,
        "INVALID_AUDIO",
        "Источник не является отдельной аудиодорожкой.",
      );
    job.status = "processing";
    job.step = job.outputFormat === "mp3" ? "converting" : "packaging";
    job.progress = {
      downloadedBytes: 0,
      totalBytes: null,
      approximate: false,
      percent: null,
    };
    const args = [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      input,
      "-map",
      "0:a:0",
      "-vn",
      "-sn",
      "-dn",
      "-map_metadata",
      "-1",
    ];
    if (job.outputFormat === "mp3")
      args.push("-c:a", "libmp3lame", "-q:a", "2");
    else args.push("-c:a", "copy");
    if (job.ext === "m4a") args.push("-movflags", "+faststart");
    args.push("-progress", "pipe:1", output);
    try {
      await runTool(config.ffmpeg, args, { signal });
    } catch (error) {
      if (error instanceof ApiError && error.code === "PROCESSING_FAILED") {
        throw new ApiError(
          502,
          "AUDIO_PROCESSING_FAILED",
          job.outputFormat === "mp3"
            ? "Не удалось преобразовать дорожку в MP3. Проверьте поддержку libmp3lame в FFmpeg или выберите исходный формат."
            : "Не удалось сохранить исходную аудиодорожку. Выберите MP3 или обновите данные ролика.",
        );
      }
      throw error;
    }
    job.step = "checking";
    const result = await probe(output, signal);
    const streams = result.streams || [];
    const audio = streams.find((stream) => stream.codec_type === "audio");
    const expected = { m4a: "aac", opus: "opus", mp3: "mp3" }[job.ext];
    if (
      !audio ||
      audio.codec_name !== expected ||
      streams.some((stream) => stream.codec_type !== "audio")
    )
      throw new ApiError(
        502,
        "INVALID_AUDIO",
        "Готовый файл не прошёл проверку аудиодорожки.",
      );
    const duration = Number(result.format?.duration);
    if (
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > config.maxDuration + 1
    )
      throw new ApiError(
        422,
        "DURATION_LIMIT",
        "Аудиофайл не прошёл проверку длительности.",
      );
    const file = await stat(output);
    if (!file.size || file.size > config.maxJobBytes)
      throw new ApiError(
        413,
        "FILE_LIMIT",
        "Готовый аудиофайл превышает лимит размера.",
      );
    if (signal.aborted) throw signal.reason;
    monitoring = false;
    clearInterval(watcher);
    for (const entry of await readdir(job.directory))
      if (entry !== "result." + job.ext)
        await rm(join(job.directory, entry), { force: true });
    job.file = output;
    job.bytes = file.size;
    job.filename = youtubeDownloadFilename(
      job.videoId,
      data.video.title,
      job.ext,
    );
  } finally {
    monitoring = false;
    clearInterval(watcher);
  }
}
