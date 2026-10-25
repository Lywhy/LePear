import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config, ApiError, integer } from "./config.mjs";
const pauseMs = integer("YOUTUBE_SUBTITLE_COOLDOWN_MS", 300000, 60000, 3600000);
const path = join(config.store, ".subtitle-cooldown.json");
let until = 0,
  loading = null;
export async function assertSubtitleCooldown() {
  loading ??= readFile(path, "utf8")
    .then((content) => {
      const saved = JSON.parse(content);
      if (Number.isFinite(saved.until))
        until = Math.max(until, Math.min(saved.until, Date.now() + 86400000));
    })
    .catch(() => {});
  await loading;
  if (until > Date.now()) {
    const error = new ApiError(
      429,
      "SUBTITLE_RATE_LIMIT",
      "Пауза после HTTP 429 от YouTube. Дождитесь окончания таймера перед повторным скачиванием субтитров.",
    );
    error.retryAt = until;
    throw error;
  }
}
export async function noteSubtitleRateLimit(error) {
  until = Math.max(
    until,
    Date.now() + pauseMs,
    Number.isFinite(error.retryAt)
      ? Math.min(error.retryAt, Date.now() + 86400000)
      : 0,
  );
  error.retryAt = until;
  error.message =
    "YouTube ограничил запросы субтитров (HTTP 429). Дождитесь окончания таймера. Пауза учитывает Retry-After, если сервер его прислал; ограничение YouTube может сохраняться дольше.";
  try {
    await writeFile(path, JSON.stringify({ until }), { mode: 0o600 });
  } catch {
    console.error("[youtube] subtitle cooldown persistence failed");
  }
}
