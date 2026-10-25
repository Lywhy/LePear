import { mkdir, readdir, copyFile, writeFile, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { resolve, sep } from "node:path";
import { spawn } from "node:child_process";
const directory = fileURLToPath(new URL("../.tools/youtube/", import.meta.url));
const assetName =
  process.platform === "win32" && process.arch === "x64"
    ? "ffmpeg-master-latest-win64-gpl.zip"
    : null;
if (!assetName)
  throw new Error(
    "Install FFmpeg/ffprobe for this platform and set YOUTUBE_FFMPEG_PATH / YOUTUBE_FFPROBE_PATH. This installer supports Windows x64.",
  );
async function get(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(180000),
    headers: { "User-Agent": "LePear-local-setup" },
  });
  if (!response.ok) throw new Error("Download failed: HTTP " + response.status);
  return response;
}
const release = await (
  await get("https://api.github.com/repos/yt-dlp/FFmpeg-Builds/releases/latest")
).json();
const asset = release.assets.find((item) => item.name === assetName);
const sumsAsset = release.assets.find(
  (item) => item.name === "checksums.sha256",
);
if (!asset || !sumsAsset)
  throw new Error("Official FFmpeg build assets are missing.");
const sums = await (await get(sumsAsset.browser_download_url)).text();
const line = sums
  .split(/\r?\n/)
  .find(
    (item) => item.trim().split(/\s+/).at(-1)?.replace(/^\*/, "") === assetName,
  );
const expected = line?.trim().split(/\s+/)[0]?.toLowerCase();
if (!expected || !/^[a-f0-9]{64}$/.test(expected))
  throw new Error("Official SHA256 not found.");
await mkdir(directory, { recursive: true });
const archive = resolve(directory, "ffmpeg.download.zip");
const staging = resolve(directory, "ffmpeg-install");
if (
  !staging.startsWith(resolve(directory) + sep) ||
  staging === resolve(directory)
)
  throw new Error("Unsafe staging path.");
try {
  const hash = createHash("sha256");
  let bytes = 0;
  await pipeline(
    Readable.fromWeb((await get(asset.browser_download_url)).body),
    new Transform({
      transform(chunk, _encoding, callback) {
        bytes += chunk.length;
        if (bytes > 512 * 1024 * 1024) {
          callback(new Error("Unexpected archive size."));
          return;
        }
        hash.update(chunk);
        callback(null, chunk);
      },
    }),
    createWriteStream(archive),
  );
  if (hash.digest("hex") !== expected) throw new Error("SHA256 mismatch.");
  const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
  await new Promise((accept, reject) => {
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-Command",
        "Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory(" +
          quote(archive) +
          ", " +
          quote(staging) +
          ")",
      ],
      { shell: false, windowsHide: true, stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("close", (code) =>
      code === 0
        ? accept()
        : reject(new Error("Cannot unpack FFmpeg archive.")),
    );
  });
  async function find(folder, name) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = resolve(folder, entry.name);
      if (entry.isFile() && entry.name === name) return path;
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        const result = await find(path, name);
        if (result) return result;
      }
    }
    return null;
  }
  for (const name of ["ffmpeg.exe", "ffprobe.exe"]) {
    const source = await find(staging, name);
    if (!source) throw new Error(name + " missing from archive.");
    await copyFile(source, resolve(directory, name));
  }
  await writeFile(
    resolve(directory, "ffmpeg-release.json"),
    JSON.stringify(
      {
        release: release.tag_name,
        asset: assetName,
        sha256: expected,
        source: asset.browser_download_url,
      },
      null,
      2,
    ),
  );
  console.log(
    "FFmpeg and ffprobe installed with SHA256 verification. Binaries not executed.",
  );
} finally {
  await rm(archive, { force: true });
  // Resolved absolute staging was checked to remain inside .tools/youtube.
  await rm(staging, { recursive: true, force: true });
}
