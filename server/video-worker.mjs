import { youtubeDownloadFilename } from "./download-filename.mjs";
import { stat, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { config, ApiError } from "./config.mjs";
import { parseVideoUrl } from "./youtube-url.mjs";
import { extractMetadata } from "./extractor.mjs";
import { normalizeMetadata } from "./metadata.mjs";
import { runTool, downloadArgs } from "./job-process.mjs";

const emptyProgress = () => ({
  downloadedBytes: 0,
  totalBytes: null,
  approximate: false,
  percent: null,
});
export async function directoryBytes(folder) {
  let size = 0;
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (entry.isFile()) {
      try {
        size += (await stat(join(folder, entry.name))).size;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  return size;
}
export async function probe(path, signal) {
  const output = await runTool(
    config.ffprobe,
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_type,codec_name,width,height:format=duration,size",
      "-of",
      "json",
      path,
    ],
    { signal },
  );
  try {
    return JSON.parse(output);
  } catch {
    throw new ApiError(
      502,
      "INVALID_MEDIA",
      "Не удалось прочитать структуру скачанного файла.",
    );
  }
}
export function progressLine(job, line) {
  const index = line.indexOf("LEPEAR_PROGRESS:");
  if (index < 0) return;
  const [downloaded, total, estimate] = line
    .slice(index + "LEPEAR_PROGRESS:".length)
    .split("|")
    .map(Number);
  const valid = (value) => Number.isFinite(value) && value >= 0;
  const actualTotal = valid(total) && total > 0 ? total : null;
  const guessed =
    !actualTotal && valid(estimate) && estimate > 0 ? estimate : null;
  const bytes = valid(downloaded) ? downloaded : 0;
  job.progress = {
    downloadedBytes: bytes,
    totalBytes: actualTotal || guessed,
    approximate: !!guessed,
    percent:
      actualTotal || guessed
        ? Math.min(100, Math.max(0, (bytes / (actualTotal || guessed)) * 100))
        : null,
  };
  if (bytes > config.maxJobBytes)
    job.controller.abort(
      new ApiError(413, "FILE_LIMIT", "Задание превысило лимит размера файла."),
    );
}
export async function runVideoJob(job) {
  const { signal } = job.controller;
  const video = parseVideoUrl("https://www.youtube.com/watch?v=" + job.videoId);
  const extracted = await extractMetadata(video, signal);
  const data = normalizeMetadata(extracted, video);
  if (data.video.duration === null)
    throw new ApiError(
      422,
      "UNKNOWN_DURATION",
      "Не удалось определить длительность ролика. Загрузка без проверки лимита недоступна.",
    );
  const selected = data.formats.video.find(
    (format) =>
      format.id === job.formatId && ["mp4", "webm"].includes(format.ext),
  );
  if (!selected || !/^[A-Za-z0-9_.-]{1,100}$/.test(selected.id))
    throw new ApiError(
      422,
      "FORMAT_CHANGED",
      "Выбранный формат больше не доступен. Обновите данные ролика.",
    );
  let audio = null;
  if (!selected.hasAudio) {
    audio = data.formats.audio.find(
      (format) =>
        /^[A-Za-z0-9_.-]{1,100}$/.test(format.id) &&
        (selected.ext === "mp4"
          ? format.ext === "m4a" && /^(mp4a|aac)/i.test(format.codec)
          : ["webm", "opus"].includes(format.ext) &&
            /^(opus|vorbis)/i.test(format.codec)),
    );
    if (!audio)
      throw new ApiError(
        422,
        "NO_COMPATIBLE_AUDIO",
        "Для этого видео нет совместимой звуковой дорожки. Выберите другой формат.",
      );
  }
  const sizes = [selected.size, audio?.size].filter(Boolean);
  if (sizes.reduce((sum, size) => sum + size.bytes, 0) > config.maxJobBytes)
    throw new ApiError(
      413,
      "FILE_LIMIT",
      "Выбранные потоки превышают лимит размера. Выберите меньшее качество.",
    );
  job.title = data.video.title;
  job.ext = selected.ext;
  job.height = selected.height;
  const videoPath = join(job.directory, "video." + selected.ext);
  const audioPath = audio ? join(job.directory, "audio." + audio.ext) : null;
  const output = join(job.directory, "result." + selected.ext);
  let watching = false,
    monitoring = true;
  const watcher = setInterval(async () => {
    if (watching || !monitoring || signal.aborted) return;
    watching = true;
    try {
      const bytes = await directoryBytes(job.directory);
      const limit =
        job.status === "downloading"
          ? config.maxJobBytes
          : config.maxJobBytes * 2 + 16777216;
      let resultSize = 0;
      try {
        resultSize = (await stat(output)).size;
      } catch {
        /* Output not created yet. */
      }
      if (bytes > limit || resultSize > config.maxJobBytes)
        job.controller.abort(
          new ApiError(
            413,
            "FILE_LIMIT",
            "Превышен лимит объёма задания. Выберите меньшее качество.",
          ),
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
    job.step = "video";
    job.progress = emptyProgress();
    await runTool(
      config.ytDlp,
      [
        ...downloadArgs(
          video.url,
          selected.id,
          videoPath,
          config.maxJobBytes,
        ).slice(0, -2),
        "--ffmpeg-location",
        config.ffmpeg,
        "--",
        video.url,
      ],
      { signal, onLine: (line) => progressLine(job, line) },
    );
    const videoInfo = await probe(videoPath, signal);
    const videoStream = videoInfo.streams?.find(
      (stream) => stream.codec_type === "video",
    );
    if (
      !videoStream ||
      (selected.height !== null && videoStream.height !== selected.height)
    )
      throw new ApiError(
        502,
        "FORMAT_CHANGED",
        "Полученный видеопоток отличается от выбранного. Обновите данные ролика.",
      );
    if (audio && audioPath) {
      job.step = "audio";
      job.progress = emptyProgress();
      await runTool(
        config.ytDlp,
        [
          ...downloadArgs(
            video.url,
            audio.id,
            audioPath,
            config.maxJobBytes,
          ).slice(0, -2),
          "--ffmpeg-location",
          config.ffmpeg,
          "--",
          video.url,
        ],
        { signal, onLine: (line) => progressLine(job, line) },
      );
    }
    if (signal.aborted) throw signal.reason;
    job.status = "processing";
    job.step = "merging";
    job.progress = emptyProgress();
    const args = [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      videoPath,
    ];
    if (audioPath) args.push("-i", audioPath);
    args.push(
      "-map",
      "0:v:0",
      "-map",
      audioPath ? "1:a:0" : "0:a:0",
      "-c",
      "copy",
    );
    if (selected.ext === "mp4") args.push("-movflags", "+faststart");
    args.push("-progress", "pipe:1", output);
    await runTool(config.ffmpeg, args, { signal });
    job.step = "checking";
    const finalInfo = await probe(output, signal);
    const streams = finalInfo.streams || [];
    if (
      !streams.some((stream) => stream.codec_type === "video") ||
      !streams.some((stream) => stream.codec_type === "audio")
    )
      throw new ApiError(
        502,
        "MISSING_TRACK",
        "В готовом файле нет видео или звука. Файл не будет выдан.",
      );
    const actualDuration = Number(finalInfo.format?.duration);
    if (
      !Number.isFinite(actualDuration) ||
      actualDuration <= 0 ||
      actualDuration > config.maxDuration + 1
    )
      throw new ApiError(
        422,
        "DURATION_LIMIT",
        "Готовый файл не прошёл проверку длительности.",
      );
    const file = await stat(output);
    if (!file.size || file.size > config.maxJobBytes)
      throw new ApiError(
        413,
        "FILE_LIMIT",
        "Готовый файл превышает лимит размера.",
      );
    if (signal.aborted) throw signal.reason;
    monitoring = false;
    clearInterval(watcher);
    for (const entry of await readdir(job.directory))
      if (entry !== "result." + selected.ext)
        await rm(join(job.directory, entry), { force: true });
    job.file = output;
    job.bytes = file.size;
    job.filename = youtubeDownloadFilename(
      job.videoId,
      data.video.title,
      selected.ext,
    );
  } finally {
    monitoring = false;
    clearInterval(watcher);
  }
}
