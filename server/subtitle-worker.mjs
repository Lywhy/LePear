import {
  assertSubtitleCooldown,
  noteSubtitleRateLimit,
} from "./subtitle-rate-limit.mjs";
import { stat, readdir, readFile, copyFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { config, ApiError } from "./config.mjs";
import { parseVideoUrl } from "./youtube-url.mjs";
import { extractMetadata } from "./extractor.mjs";
import { normalizeMetadata } from "./metadata.mjs";
import { runTool } from "./job-process.mjs";
import { downloadSubtitleFile } from "./subtitle-download.mjs";
import { directoryBytes } from "./video-worker.mjs";

const maxSubtitleBytes = () => Math.min(config.maxJobBytes, 16 * 1024 * 1024);
async function validateSubtitles(path, ext) {
  const file = await stat(path);
  if (!file.isFile() || !file.size || file.size > maxSubtitleBytes())
    throw new ApiError(
      413,
      "SUBTITLE_SIZE",
      "Файл субтитров пуст или превышает лимит 16 МиБ.",
    );
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true })
      .decode(await readFile(path))
      .replace(/^\uFEFF/, "");
  } catch {
    throw new ApiError(
      502,
      "SUBTITLE_ENCODING",
      "Не удалось прочитать субтитры в UTF-8.",
    );
  }
  if (ext === "vtt" && !/^WEBVTT(?:[ \t\r\n]|$)/.test(text))
    throw new ApiError(
      502,
      "INVALID_SUBTITLES",
      "YouTube вернул некорректные VTT-субтитры.",
    );
  const timestamp =
    /^((?:\d{2,}:)?\d{2}:\d{2}[.,]\d{3})\s+-->\s+((?:\d{2,}:)?\d{2}:\d{2}[.,]\d{3})(?:\s.*)?$/;
  const seconds = (value) => {
    const parts = value.replace(",", ".").split(":").map(Number);
    const s = parts.pop(),
      m = parts.pop(),
      h = parts.pop() ?? 0;
    return m < 60 && s < 60 ? h * 3600 + m * 60 + s : NaN;
  };
  let cues = 0,
    textCues = 0;
  for (const block of text.replace(/\r\n?/g, "\n").split(/\n[ \t]*\n/)) {
    if (/^(NOTE|STYLE|REGION)(?:\s|$)/.test(block.trim())) continue;
    const lines = block.split("\n");
    // A timing line can follow a cue identifier. Text containing an arrow is not a timing line.
    const index = lines.findIndex((line) =>
      /^\s*\d[\d:.,]*[ \t]+-->/.test(line),
    );
    if (index < 0) continue;
    const match = timestamp.exec(lines[index].trim());
    if (!match)
      throw new ApiError(
        502,
        "INVALID_SUBTITLE_TIMING",
        "Некорректная запись таймкодов в субтитрах (фрагмент " +
          (cues + 1) +
          ").",
      );
    const start = seconds(match[1]),
      end = seconds(match[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start)
      throw new ApiError(
        502,
        "INVALID_SUBTITLE_INTERVAL",
        "Некорректный временной интервал субтитров (фрагмент " +
          (cues + 1) +
          ").",
      );
    cues++;
    // Empty WebVTT cues are valid. Do not reject an entire track because of a clearing cue.
    const payload = lines
      .slice(index + 1)
      .join("\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&(?:nbsp|#160|#x0*a0);/gi, " ")
      .trim();
    if (payload) textCues++;
  }
  if (!cues || !textCues)
    throw new ApiError(
      422,
      "EMPTY_SUBTITLES",
      "В выбранной дорожке нет текста с таймкодами.",
    );
  return file.size;
}
export async function runSubtitleJob(job) {
  const { signal } = job.controller;
  const video = parseVideoUrl("https://www.youtube.com/watch?v=" + job.videoId);
  await assertSubtitleCooldown();
  const extracted = await extractMetadata(video, signal);
  const data = normalizeMetadata(extracted, video);
  const track = data.subtitles.find((item) => item.id === job.subtitleTrackId);
  if (!track || !/^[A-Za-z0-9_-]{1,80}$/.test(track.language))
    throw new ApiError(
      422,
      "SUBTITLE_CHANGED",
      "Выбранная дорожка субтитров больше не доступна. Обновите данные по ссылке.",
    );
  const sourceExt = track.formats.includes(job.formatId)
    ? job.formatId
    : track.formats.includes("vtt")
      ? "vtt"
      : track.formats.includes("srt")
        ? "srt"
        : null;
  if (!sourceExt)
    throw new ApiError(
      422,
      "SUBTITLE_FORMAT_UNSUPPORTED",
      "Для этой дорожки недоступны VTT/SRT и их конвертация.",
    );
  job.ext = job.formatId;
  job.height = null;
  const output = join(job.directory, "result." + job.ext);
  let watching = false,
    monitoring = true;
  const watcher = setInterval(async () => {
    if (watching || !monitoring || signal.aborted) return;
    watching = true;
    try {
      if (
        (await directoryBytes(job.directory)) >
        maxSubtitleBytes() * 2 + 1048576
      )
        job.controller.abort(
          new ApiError(
            413,
            "SUBTITLE_SIZE",
            "Превышен лимит размера субтитров.",
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
    job.step = "subtitles";
    const rawTracks =
      track.source === "manual"
        ? extracted.info.subtitles
        : extracted.info.automatic_captions;
    const entries = rawTracks?.[track.language]?.filter(
      (entry) => entry.ext === sourceExt && typeof entry.url === "string",
    );
    if (!entries?.length)
      throw new ApiError(
        422,
        "SUBTITLE_CHANGED",
        "Выбранный формат субтитров больше не доступен.",
      );
    const input = join(job.directory, "source." + sourceExt);
    try {
      await downloadSubtitleFile(entries[0], input, {
        signal,
        maxBytes: maxSubtitleBytes(),
        watchUrl: video.url,
        headers: extracted.info.http_headers,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "SUBTITLE_RATE_LIMIT")
          await noteSubtitleRateLimit(error);
        console.error("[youtube] subtitle-download", job.id, error.code);
      }
      throw error;
    }
    await validateSubtitles(input, sourceExt);
    job.status = "processing";
    if (sourceExt === job.ext) {
      job.step = "checking";
      await copyFile(input, output);
    } else {
      job.step = "converting-subtitles";
      try {
        await runTool(
          config.ffmpeg,
          [
            "-nostdin",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-protocol_whitelist",
            "file,pipe",
            "-f",
            sourceExt === "vtt" ? "webvtt" : "srt",
            "-i",
            input,
            "-map",
            "0:s:0",
            "-c:s",
            job.ext === "vtt" ? "webvtt" : "srt",
            "-f",
            job.ext === "vtt" ? "webvtt" : "srt",
            output,
          ],
          { signal },
        );
      } catch (error) {
        if (error instanceof ApiError && error.code === "PROCESSING_FAILED")
          throw new ApiError(
            502,
            "SUBTITLE_CONVERSION_FAILED",
            "Не удалось преобразовать субтитры. Попробуйте исходный формат.",
          );
        throw error;
      }
    }
    job.step = "checking";
    job.bytes = await validateSubtitles(output, job.ext);
    if (signal.aborted) throw signal.reason;
    monitoring = false;
    clearInterval(watcher);
    for (const entry of await readdir(job.directory))
      if (entry !== "result." + job.ext)
        await rm(join(job.directory, entry), { force: true });
    job.file = output;
    job.filename =
      (
        "LePear-" +
        job.videoId +
        "-" +
        data.video.title
          .normalize("NFC")
          .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "")
          .replace(/^\.+|[.\s]+$/g, "")
          .slice(0, 65)
          .toWellFormed()
      ).trim() +
      "-" +
      track.language +
      "-" +
      (track.source === "manual" ? "author" : "auto") +
      "." +
      job.ext;
  } finally {
    monitoring = false;
    clearInterval(watcher);
  }
}
