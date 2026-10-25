import { spawn } from "node:child_process";
import { root, ApiError } from "./config.mjs";
import { stopTree } from "./extractor.mjs";

export function runTool(binary, args, { signal, onLine, maxBytes = 1048576 }) {
  return new Promise((accept, reject) => {
    if (signal.aborted) {
      reject(
        signal.reason instanceof Error
          ? signal.reason
          : new ApiError(499, "CANCELLED", "Задание отменено."),
      );
      return;
    }
    const child = spawn(binary, args, {
      cwd: root,
      shell: false,
      windowsHide: true,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "",
      pending = "",
      bytes = 0,
      problem = null,
      done = false;
    const abort = () => {
      problem =
        signal.reason instanceof Error
          ? signal.reason
          : new ApiError(499, "CANCELLED", "Задание отменено.");
      stopTree(child);
    };
    const fail = (error) => {
      problem = error;
      stopTree(child);
    };
    signal.addEventListener("abort", abort, { once: true });
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (part) => {
      bytes += Buffer.byteLength(part);
      if (bytes > maxBytes) {
        fail(
          new ApiError(
            502,
            "TOOL_OUTPUT_LIMIT",
            "Слишком большой служебный ответ обработки.",
          ),
        );
        return;
      }
      output += part;
      pending += part;
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() || "";
      for (const line of lines) {
        try {
          onLine?.(line);
        } catch (error) {
          fail(error);
        }
      }
    });
    // Drain stderr without exposing signed URLs or platform diagnostics.
    let errorPending = "",
      errorBytes = 0;
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (part) => {
      errorBytes += Buffer.byteLength(part);
      if (errorBytes > maxBytes) {
        fail(
          new ApiError(
            502,
            "TOOL_OUTPUT_LIMIT",
            "Слишком большой служебный ответ.",
          ),
        );
        return;
      }
      errorPending += part;
      const lines = errorPending.split(/\r?\n/);
      errorPending = lines.pop() || "";
      for (const line of lines) {
        try {
          onLine?.(line);
        } catch (error) {
          fail(error);
        }
      }
    });
    function finish(error) {
      if (done) return;
      done = true;
      signal.removeEventListener("abort", abort);
      if (error) reject(error);
      else accept(output);
    }
    child.once("error", () =>
      finish(
        new ApiError(
          503,
          "TOOL_MISSING",
          "Инструмент обработки недоступен. Проверьте установку yt-dlp, FFmpeg и ffprobe.",
        ),
      ),
    );
    child.once("close", (code) => {
      try {
        if (pending) onLine?.(pending);
        if (errorPending) onLine?.(errorPending);
      } catch (error) {
        problem ??= error;
      }
      finish(
        problem ||
          (code !== 0
            ? new ApiError(
                502,
                "PROCESSING_FAILED",
                "Не удалось скачать или обработать выбранный поток. Обновите данные ролика и повторите.",
              )
            : null),
      );
    });
    if (signal.aborted) abort();
  });
}
export function downloadArgs(url, formatId, output, maxBytes) {
  return [
    "--ignore-config",
    "--no-config-locations",
    "--no-plugin-dirs",
    "--no-cache-dir",
    "--no-remote-components",
    "--no-js-runtimes",
    "--js-runtimes",
    "node:" + process.execPath,
    "--use-extractors",
    "youtube",
    "--no-playlist",
    "--no-colors",
    "--socket-timeout",
    "12",
    "--retries",
    "1",
    "--fragment-retries",
    "1",
    "--extractor-retries",
    "1",
    "--concurrent-fragments",
    "1",
    "--max-filesize",
    String(maxBytes),
    "--newline",
    "--progress",
    "--progress-delta",
    "0.5",
    "--progress-template",
    "download:LEPEAR_PROGRESS:%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress.total_bytes_estimate)s",
    "--format",
    formatId,
    "--output",
    output,
    "--",
    url,
  ];
}
