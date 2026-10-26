import { resolve } from "node:path";
import { config, integer, root } from "./config.mjs";
export const converterConfig = {
  store: resolve(root, ".converter-files"),
  ffmpeg: resolve(root, process.env.CONVERTER_FFMPEG_PATH || config.ffmpeg),
  ffprobe: resolve(root, process.env.CONVERTER_FFPROBE_PATH || config.ffprobe),
  maxInputBytes: integer(
    "CONVERTER_MAX_INPUT_BYTES",
    104857600,
    1048576,
    536870912,
  ),
  maxOutputBytes: integer(
    "CONVERTER_MAX_OUTPUT_BYTES",
    536870912,
    1048576,
    1073741824,
  ),
  maxDuration: integer("CONVERTER_MAX_DURATION_SECONDS", 1800, 1, 7200),
  timeoutMs: integer("CONVERTER_JOB_TIMEOUT_MS", 300000, 30000, 1800000),
  uploadTimeoutMs: integer(
    "CONVERTER_UPLOAD_TIMEOUT_MS",
    120000,
    10000,
    600000,
  ),
  ttlMs: integer("CONVERTER_FILE_TTL_MS", 900000, 60000, 3600000),
  maxConcurrent: integer("CONVERTER_CONCURRENCY", 1, 1, 2),
  maxStorageBytes: integer(
    "CONVERTER_MAX_STORAGE_BYTES",
    1073741824,
    67108864,
    4294967296,
  ),
  maxPixels: integer("CONVERTER_MAX_IMAGE_PIXELS", 25000000, 1000000, 40000000),
  maxRetained: 20,
};
