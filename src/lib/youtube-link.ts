export type YouTubeLinkResult =
  | { success: true; videoId: string; url: string; hasPlaylist: boolean }
  | { success: false; message: string };

const hosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/** Client-side parsing only. The API must validate its own input before any request. */
export function parseYouTubeLink(input: string): YouTubeLinkResult {
  const text = input.trim();
  if (!text)
    return { success: false, message: "Вставьте ссылку на ролик YouTube." };
  if (text.length > 2048)
    return {
      success: false,
      message:
        "Ссылка слишком длинная. Используйте обычную ссылку на один ролик.",
    };
  const candidate =
    /^(?:(?:www|m|music)\.)?youtube\.com\/|^(?:www\.)?youtu\.be\//i.test(text)
      ? "https://" + text
      : text;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      success: false,
      message:
        "Не удалось прочитать ссылку. Подойдут youtube.com/watch, youtu.be и YouTube Shorts.",
    };
  }
  if (
    !["https:", "http:"].includes(parsed.protocol) ||
    !hosts.has(parsed.hostname.toLowerCase()) ||
    parsed.username ||
    parsed.password ||
    parsed.port
  ) {
    return {
      success: false,
      message:
        "Нужна прямая ссылка YouTube по HTTP или HTTPS, без логина и нестандартного порта.",
    };
  }
  const path = parsed.pathname.replace(/\/+$/, "");
  let videoId: string | null = null;
  if (parsed.hostname.toLowerCase().endsWith("youtu.be")) {
    const match = /^\/([A-Za-z0-9_-]{11})$/.exec(path);
    videoId = match?.[1] ?? null;
  } else if (
    path === "/watch" &&
    parsed.searchParams.getAll("v").length === 1
  ) {
    videoId = parsed.searchParams.get("v");
  } else {
    const match = /^\/shorts\/([A-Za-z0-9_-]{11})$/.exec(path);
    videoId = match?.[1] ?? null;
  }
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return {
      success: false,
      message:
        "В ссылке нет корректного ID ролика. Скопируйте ссылку на конкретное видео или Shorts, а не на канал или плейлист.",
    };
  }
  return {
    success: true,
    videoId,
    url: "https://www.youtube.com/watch?v=" + videoId,
    hasPlaylist: parsed.searchParams.has("list"),
  };
}
