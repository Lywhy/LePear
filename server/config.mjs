import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18))
  throw new Error("YouTube API requires Node.js 22.18 or newer.");
export const root = fileURLToPath(new URL("../", import.meta.url));
export function integer(name, fallback, min, max) {
  const value =
    process.env[name] === undefined ? fallback : Number(process.env[name]);
  if (!Number.isInteger(value) || value < min || value > max)
    throw new Error("Invalid configuration: " + name);
  return value;
}
export const config = {
  port: integer("YOUTUBE_API_PORT", 8787, 1024, 65535),
  timeoutMs: integer("YOUTUBE_METADATA_TIMEOUT_MS", 45000, 5000, 120000),
  maxDuration: integer("YOUTUBE_MAX_DURATION_SECONDS", 7200, 1, 86400),
  maxConcurrent: integer("YOUTUBE_METADATA_CONCURRENCY", 2, 1, 4),
  rateLimit: integer("YOUTUBE_METADATA_RATE_LIMIT", 10, 1, 60),
  maxOutputBytes: 8 * 1024 * 1024,
  maxBodyBytes: 4096,
  jobTimeoutMs: integer("YOUTUBE_JOB_TIMEOUT_MS", 600000, 30000, 3600000),
  jobTtlMs: integer("YOUTUBE_JOB_TTL_MS", 900000, 60000, 3600000),
  maxJobBytes: integer(
    "YOUTUBE_MAX_FILE_BYTES",
    1073741824,
    1048576,
    2147483648,
  ),
  maxStorageBytes: integer(
    "YOUTUBE_MAX_STORAGE_BYTES",
    4294967296,
    67108864,
    17179869184,
  ),
  maxJobs: integer("YOUTUBE_JOB_CONCURRENCY", 1, 1, 2),
  maxRetainedJobs: 20,
  store: resolve(root, ".youtube-downloads"),
  ffmpeg: resolve(
    root,
    process.env.YOUTUBE_FFMPEG_PATH ||
      ".tools/youtube/ffmpeg" + (process.platform === "win32" ? ".exe" : ""),
  ),
  ffprobe: resolve(
    root,
    process.env.YOUTUBE_FFPROBE_PATH ||
      ".tools/youtube/ffprobe" + (process.platform === "win32" ? ".exe" : ""),
  ),
  origins: new Set(
    (
      process.env.YOUTUBE_ALLOWED_ORIGINS ||
      "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:4173,http://127.0.0.1:4173"
    )
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ),
  ytDlp: process.env.YOUTUBE_YTDLP_PATH
    ? resolve(root, process.env.YOUTUBE_YTDLP_PATH)
    : process.platform === "win32"
      ? resolve(root, ".tools/youtube/yt-dlp.exe")
      : existsSync(resolve(root, ".tools/youtube/yt-dlp"))
        ? resolve(root, ".tools/youtube/yt-dlp")
        : "yt-dlp",
};
export const bundledToolExists = existsSync(config.ytDlp);
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
