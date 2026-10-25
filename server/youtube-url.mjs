import { ApiError } from "./config.mjs";

const hosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);
export function parseVideoUrl(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 2048)
    throw new ApiError(
      400,
      "INVALID_URL",
      "Вставьте корректную ссылку на один ролик YouTube.",
    );
  const input = value.trim();
  let url;
  try {
    url = new URL(
      /^(?:(?:www|m|music)\.)?youtube\.com\/|^(?:www\.)?youtu\.be\//i.test(
        input,
      )
        ? "https://" + input
        : input,
    );
  } catch {
    throw new ApiError(
      400,
      "INVALID_URL",
      "Не удалось прочитать ссылку YouTube.",
    );
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    !hosts.has(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new ApiError(
      400,
      "INVALID_URL",
      "Допустима только прямая ссылка YouTube без логина и нестандартного порта.",
    );
  const path = url.pathname.replace(/\/+$/, "");
  let id;
  if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be")
    id = /^\/([A-Za-z0-9_-]{11})$/.exec(path)?.[1];
  else if (path === "/watch" && url.searchParams.getAll("v").length === 1)
    id = url.searchParams.get("v");
  else id = /^\/shorts\/([A-Za-z0-9_-]{11})$/.exec(path)?.[1];
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id))
    throw new ApiError(
      400,
      "INVALID_URL",
      "Нужна ссылка на конкретное видео или Shorts, а не на канал или плейлист.",
    );
  // Only this generated URL reaches the extractor, never the user-supplied location.
  return {
    id,
    url: "https://www.youtube.com/watch?v=" + id,
    hasPlaylist: url.searchParams.has("list"),
  };
}
