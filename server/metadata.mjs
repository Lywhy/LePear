import { ApiError, config } from "./config.mjs";
const number = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
const text = (value, max = 500) =>
  typeof value === "string" ? value.slice(0, max) : "";
function sizeOf(format) {
  const exact = number(format.filesize),
    approximate = number(format.filesize_approx);
  return exact !== null
    ? { bytes: exact, approximate: false }
    : approximate !== null
      ? { bytes: approximate, approximate: true }
      : null;
}
export function normalizeMetadata({ info, incomplete }, requested) {
  if (
    !info ||
    info.id !== requested.id ||
    (info._type && info._type !== "video") ||
    (info.extractor_key && info.extractor_key !== "Youtube")
  )
    throw new ApiError(
      502,
      "WRONG_VIDEO",
      "YouTube вернул данные другого материала.",
    );
  if (
    info.is_live ||
    ["is_live", "is_upcoming", "post_live"].includes(info.live_status)
  )
    throw new ApiError(
      422,
      "LIVE_UNSUPPORTED",
      "Прямые эфиры и ожидающие обработки трансляции пока не поддерживаются.",
    );
  if (
    number(info.age_limit) >= 18 ||
    (info.availability && !["public", "unlisted"].includes(info.availability))
  )
    throw new ApiError(
      403,
      "ACCESS_RESTRICTED",
      "Этот ролик недоступен без дополнительных разрешений YouTube.",
    );
  const duration = number(info.duration);
  if (duration !== null && duration > config.maxDuration)
    throw new ApiError(
      422,
      "DURATION_LIMIT",
      "Ролик превышает лимит длительности: " +
        Math.floor(config.maxDuration / 60) +
        " мин.",
    );
  const video = [],
    audio = [];
  const seen = new Set();
  for (const f of Array.isArray(info.formats) ? info.formats : []) {
    if (
      !f ||
      typeof f !== "object" ||
      f.has_drm ||
      typeof f.format_id !== "string" ||
      !f.format_id.length ||
      f.format_id.length > 100 ||
      !/^https?:\/\//.test(f.url || "") ||
      seen.has(f.format_id)
    )
      continue;
    seen.add(f.format_id);
    const common = {
      id: text(f.format_id, 100),
      ext: text(f.ext, 20),
      size: sizeOf(f),
    };
    if (f.vcodec && f.vcodec !== "none")
      video.push({
        ...common,
        width: number(f.width),
        height: number(f.height),
        fps: number(f.fps),
        codec: text(f.vcodec, 100),
        hasAudio: !!f.acodec && f.acodec !== "none",
      });
    else if (f.acodec && f.acodec !== "none")
      audio.push({
        ...common,
        bitrate: number(f.abr),
        codec: text(f.acodec, 100),
        language: text(f.language, 80) || null,
      });
  }
  video.sort(
    (a, b) => (b.height || 0) - (a.height || 0) || (b.fps || 0) - (a.fps || 0),
  );
  audio.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
  if (!video.length && !audio.length)
    throw new ApiError(
      502,
      "NO_FORMATS",
      "YouTube не вернул доступных медиадорожек. Попробуйте обновить yt-dlp или выбрать другой ролик.",
    );
  const subtitles = [];
  for (const [source, tracks] of [
    ["manual", info.subtitles],
    ["automatic", info.automatic_captions],
  ]) {
    if (!tracks || typeof tracks !== "object" || Array.isArray(tracks))
      continue;
    for (const [language, files] of Object.entries(tracks)) {
      if (!Array.isArray(files) || !files.length) continue;
      const valid = files.filter(
        (file) =>
          file &&
          /^https?:\/\//.test(file.url || "") &&
          typeof file.ext === "string",
      );
      if (!valid.length) continue;
      subtitles.push({
        id: source + ":" + language,
        language: text(language, 80),
        name: text(valid.find((file) => file.name)?.name || language, 200),
        source,
        formats: [...new Set(valid.map((file) => text(file.ext, 20)))],
      });
    }
  }
  return {
    apiVersion: 1,
    video: {
      id: requested.id,
      url: requested.url,
      title: text(info.title, 1000) || "Без названия",
      channel: text(info.channel || info.uploader, 300) || "Канал не указан",
      duration,
      thumbnail: "https://i.ytimg.com/vi/" + requested.id + "/hqdefault.jpg",
    },
    formats: { video, audio },
    subtitles,
    warnings: incomplete
      ? [
          "YouTube сообщил об ограничении извлечения. Список дорожек может быть неполным; обновите yt-dlp при необходимости.",
        ]
      : [],
    capabilities: { downloads: false },
  };
}
