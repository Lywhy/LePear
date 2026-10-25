import { mkdir, rename, writeFile, chmod, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../.tools/youtube/", import.meta.url));
const names = {
  "win32:x64": "yt-dlp.exe",
  "win32:arm64": "yt-dlp_arm64.exe",
  "linux:x64": "yt-dlp_linux",
  "linux:arm64": "yt-dlp_linux_aarch64",
  "darwin:x64": "yt-dlp_macos",
  "darwin:arm64": "yt-dlp_macos",
};
const assetName = names[process.platform + ":" + process.arch];
if (!assetName)
  throw new Error(
    "Unsupported platform. Install yt-dlp manually and set YOUTUBE_YTDLP_PATH.",
  );
async function get(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(120000),
    headers: { "User-Agent": "LePear-local-setup" },
  });
  if (!response.ok) throw new Error("Download failed: HTTP " + response.status);
  return response;
}
const release = await (
  await get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
).json();
const binary = release.assets.find((asset) => asset.name === assetName);
const checksum = release.assets.find((asset) => asset.name === "SHA2-256SUMS");
if (!binary || !checksum)
  throw new Error("Official release assets are missing.");
const sums = await (await get(checksum.browser_download_url)).text();
const line = sums
  .split(/\r?\n/)
  .find(
    (value) =>
      value.trim().split(/\s+/).at(-1)?.replace(/^\*/, "") === assetName,
  );
const expected = line?.trim().split(/\s+/)[0]?.toLowerCase();
if (!expected || !/^[a-f0-9]{64}$/.test(expected))
  throw new Error("Official SHA256 checksum not found.");
await mkdir(directory, { recursive: true });
const target =
  directory + (process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
const temporary = target + ".download";
try {
  const hash = createHash("sha256");
  let size = 0;
  const response = await get(binary.browser_download_url);
  await pipeline(
    Readable.fromWeb(response.body),
    new Transform({
      transform(chunk, _encoding, callback) {
        size += chunk.length;
        if (size > 256 * 1024 * 1024) {
          callback(new Error("Unexpected binary size."));
          return;
        }
        hash.update(chunk);
        callback(null, chunk);
      },
    }),
    createWriteStream(temporary),
  );
  if (hash.digest("hex") !== expected)
    throw new Error("SHA256 mismatch. Binary was not installed.");
  await rename(temporary, target);
  if (process.platform !== "win32") await chmod(target, 0o700);
  await writeFile(
    directory + "release.json",
    JSON.stringify(
      {
        version: release.tag_name,
        sha256: expected,
        source: binary.browser_download_url,
      },
      null,
      2,
    ),
  );
  console.log(
    "Installed yt-dlp " +
      release.tag_name +
      " in .tools/youtube. No media downloaded; binary not executed.",
  );
} finally {
  await rm(temporary, { force: true });
}
