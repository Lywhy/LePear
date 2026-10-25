import { spawn } from "node:child_process";
import { config, root, ApiError } from "./config.mjs";

export function stopTree(child) {
  if (!child.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      shell: false,
      windowsHide: true,
      stdio: "ignore",
    });
    killer.on("error", () => child.kill("SIGKILL"));
  } else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}
export function extractMetadata(video, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new ApiError(499, "CANCELLED", "Запрос отменён."));
      return;
    }
    const args = [
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
      "--skip-download",
      "--simulate",
      "--dump-single-json",
      "--no-progress",
      "--no-colors",
      "--socket-timeout",
      "12",
      "--retries",
      "1",
      "--extractor-retries",
      "1",
      "--",
      video.url,
    ];
    let child;
    try {
      child = spawn(config.ytDlp, args, {
        cwd: root,
        shell: false,
        windowsHide: true,
        detached: process.platform !== "win32",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      reject(
        new ApiError(
          503,
          "EXTRACTOR_MISSING",
          "Не удалось запустить сервис получения данных. Проверьте установку yt-dlp.",
        ),
      );
      return;
    }
    const chunks = [];
    let size = 0,
      stderr = "",
      failure = null,
      finished = false;
    const terminate = (error) => {
      if (!failure) failure = error;
      stopTree(child);
    };
    const onAbort = () =>
      terminate(new ApiError(499, "CANCELLED", "Запрос отменён."));
    signal.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(
      () =>
        terminate(
          new ApiError(
            504,
            "EXTRACTOR_TIMEOUT",
            "YouTube не ответил вовремя. Попробуйте повторить запрос.",
          ),
        ),
      config.timeoutMs,
    );
    child.stdout.on("data", (chunk) => {
      size += chunk.length;
      if (size > config.maxOutputBytes)
        terminate(
          new ApiError(
            502,
            "METADATA_TOO_LARGE",
            "Ответ YouTube слишком большой. Выберите другой ролик.",
          ),
        );
      else chunks.push(chunk);
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length < 65536)
        stderr += chunk.toString("utf8").slice(0, 65536 - stderr.length);
    });
    function finish(error, data) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      if (error) reject(error);
      else resolve(data);
    }
    child.on("error", () =>
      finish(
        new ApiError(
          503,
          "EXTRACTOR_MISSING",
          "Сервис yt-dlp недоступен. Установите его по инструкции запуска.",
        ),
      ),
    );
    child.on("close", (code) => {
      if (failure) {
        finish(failure);
        return;
      }
      if (code !== 0) {
        const restricted =
          /sign in|cookies|age.restrict|not available in your country|geo.restrict|members.only|premium|private video/i.test(
            stderr,
          );
        const unavailable =
          /unavailable|removed|not found|does not exist|copyright/i.test(
            stderr,
          );
        finish(
          new ApiError(
            restricted ? 403 : unavailable ? 422 : 502,
            restricted
              ? "ACCESS_RESTRICTED"
              : unavailable
                ? "VIDEO_UNAVAILABLE"
                : "EXTRACTOR_FAILED",
            restricted
              ? "Ролик требует авторизации или недоступен из-за ограничений YouTube."
              : unavailable
                ? "Ролик удалён или недоступен."
                : "Не удалось получить данные YouTube. Повторите позже; если ошибка сохраняется, обновите yt-dlp.",
          ),
        );
        return;
      }
      try {
        const info = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        finish(null, {
          info,
          incomplete:
            /challenge|js runtime|javascript|formats.*missing|missing.*formats|SABR/i.test(
              stderr,
            ),
        });
      } catch {
        finish(
          new ApiError(
            502,
            "EXTRACTOR_RESPONSE",
            "Сервис вернул некорректные данные ролика.",
          ),
        );
      }
    });
    if (signal.aborted) onAbort();
  });
}
