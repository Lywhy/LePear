import { open, stat, rm } from "node:fs/promises";
import { join } from "node:path";
import { ApiError } from "./config.mjs";
import { converterConfig as config } from "./converter-config.mjs";
import { runTool } from "./job-process.mjs";

const audioFormats = {
  mp3: {
    containers: ["mp3"],
    codecs: ["mp3"],
    encoder: ["-c:a", "libmp3lame", "-q:a", "2"],
    muxer: "mp3",
    codec: "mp3",
    label: "MP3 VBR",
  },
  wav: {
    containers: ["wav"],
    codecs: null,
    encoder: ["-c:a", "pcm_s16le"],
    muxer: "wav",
    codec: "pcm_s16le",
    label: "PCM 16 бит",
  },
  flac: {
    containers: ["flac"],
    codecs: ["flac"],
    encoder: ["-c:a", "flac", "-sample_fmt", "s16"],
    muxer: "flac",
    codec: "flac",
    label: "FLAC 16 бит",
  },
  ogg: {
    containers: ["ogg"],
    codecs: ["vorbis", "opus"],
    encoder: ["-c:a", "libvorbis", "-q:a", "5"],
    muxer: "ogg",
    codec: "vorbis",
    label: "Vorbis",
  },
  m4a: {
    containers: ["mov"],
    codecs: ["aac", "alac"],
    encoder: ["-c:a", "aac", "-b:a", "192k"],
    muxer: "ipod",
    codec: "aac",
    label: "AAC 192 кбит/с",
  },
  aac: {
    containers: ["aac"],
    codecs: ["aac"],
    encoder: ["-c:a", "aac", "-b:a", "192k"],
    muxer: "adts",
    codec: "aac",
    label: "AAC 192 кбит/с",
  },
};
const imageFormats = {
  png: {
    demuxer: "png_pipe",
    codec: "png",
    encoder: ["-c:v", "png", "-pix_fmt", "rgba"],
  },
  jpg: {
    demuxer: "jpeg_pipe",
    codec: "mjpeg",
    encoder: ["-c:v", "mjpeg", "-q:v", "2", "-pix_fmt", "yuvj444p"],
  },
  webp: {
    demuxer: "webp_pipe",
    codec: "webp",
    encoder: ["-c:v", "libwebp", "-lossless", "1", "-pix_fmt", "bgra"],
  },
  bmp: {
    demuxer: "bmp_pipe",
    codec: "bmp",
    encoder: ["-c:v", "bmp", "-pix_fmt", "bgr24"],
  },
};
const invalid = (
  message = "Файл повреждён или его содержимое не соответствует выбранному формату.",
) => new ApiError(422, "INVALID_INPUT", message);
async function probe(path, signal) {
  const raw = await runTool(
    config.ffprobe,
    [
      "-v",
      "error",
      "-max_alloc",
      "268435456",
      "-protocol_whitelist",
      "file,pipe",
      "-format_whitelist",
      "mp3,wav,flac,ogg,mov,aac,png_pipe,jpeg_pipe,webp_pipe,bmp_pipe",
      "-show_entries",
      "stream=codec_type,codec_name,sample_rate,channels,width,height,duration:stream_disposition=attached_pic:format=format_name,duration",
      "-of",
      "json",
      path,
    ],
    { signal },
  );
  try {
    return JSON.parse(raw);
  } catch {
    throw invalid("Не удалось прочитать сведения о файле.");
  }
}
function audioInfo(data, format) {
  const spec = audioFormats[format];
  const streams = data.streams ?? [];
  const audio = streams.filter((stream) => stream.codec_type === "audio");
  const containers = (data.format?.format_name ?? "").split(",");
  if (
    !spec ||
    !spec.containers.some((name) => containers.includes(name)) ||
    audio.length !== 1 ||
    (spec.codecs
      ? !spec.codecs.includes(audio[0].codec_name)
      : !audio[0].codec_name?.startsWith("pcm_")) ||
    streams.some(
      (stream) =>
        stream.codec_type !== "audio" &&
        !(
          stream.codec_type === "video" &&
          stream.disposition?.attached_pic === 1
        ),
    )
  )
    throw invalid(
      "Содержимое не соответствует формату " +
        format.toUpperCase() +
        " или содержит неподдерживаемые дорожки.",
    );
  const duration = Number(data.format?.duration ?? audio[0].duration);
  const sampleRate = Number(audio[0].sample_rate),
    channels = Number(audio[0].channels);
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > config.maxDuration + 1
  )
    throw new ApiError(
      422,
      "DURATION_LIMIT",
      "Не удалось определить длительность либо превышен лимит " +
        Math.floor(config.maxDuration / 60) +
        " мин.",
    );
  if (
    !Number.isInteger(sampleRate) ||
    sampleRate < 8000 ||
    sampleRate > 96000 ||
    ![1, 2].includes(channels)
  )
    throw invalid("Поддерживается моно/стерео с частотой 8–96 кГц.");
  return { duration, sampleRate, channels, codec: audio[0].codec_name };
}
function imageInfo(data, format) {
  const spec = imageFormats[format],
    streams = data.streams ?? [];
  if (
    !spec ||
    streams.length !== 1 ||
    streams[0].codec_type !== "video" ||
    streams[0].codec_name !== spec.codec
  )
    throw invalid(
      "Содержимое не соответствует изображению " + format.toUpperCase() + ".",
    );
  const width = Number(streams[0].width),
    height = Number(streams[0].height);
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    width * height > config.maxPixels ||
    Math.max(width, height) > 32768
  )
    throw new ApiError(
      413,
      "IMAGE_LIMIT",
      "Изображение превышает лимит " +
        Math.round(config.maxPixels / 1000000) +
        " Мп или допустимые размеры.",
    );
  return { width, height };
}
// Seek past image payloads rather than reading an entire file into memory.
async function requireStaticImage(path, format, signal) {
  const handle = await open(path, "r");
  try {
    const bytes = (await handle.stat()).size;
    async function read(position, length) {
      signal.throwIfAborted();
      const buffer = Buffer.alloc(length);
      if ((await handle.read(buffer, 0, length, position)).bytesRead !== length)
        throw invalid();
      return buffer;
    }
    const head = await read(0, Math.min(bytes, 16));
    if (format === "png") {
      if (
        head.length < 8 ||
        !head
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        throw invalid();
      let position = 8;
      for (let count = 0; count < 10000 && position + 12 <= bytes; count++) {
        const chunk = await read(position, 8);
        const length = chunk.readUInt32BE(0),
          type = chunk.toString("ascii", 4, 8);
        if (position + length + 12 > bytes) throw invalid();
        if (type === "acTL")
          throw invalid(
            "Анимированный PNG пока не поддерживается. Выберите статичное изображение.",
          );
        if (type === "IEND") return;
        position += length + 12;
      }
      throw invalid(
        "PNG повреждён или содержит слишком много служебных блоков.",
      );
    }
    if (format === "webp") {
      if (
        head.toString("ascii", 0, 4) !== "RIFF" ||
        head.toString("ascii", 8, 12) !== "WEBP"
      )
        throw invalid();
      let position = 12;
      for (let count = 0; count < 10000 && position + 8 <= bytes; count++) {
        const chunk = await read(position, 8);
        const type = chunk.toString("ascii", 0, 4),
          length = chunk.readUInt32LE(4);
        if (position + length + 8 > bytes) throw invalid();
        if (
          type === "ANIM" ||
          type === "ANMF" ||
          (type === "VP8X" && length && (await read(position + 8, 1))[0] & 2)
        )
          throw invalid(
            "Анимированный WebP пока не поддерживается. Выберите статичное изображение.",
          );
        position += 8 + length + (length % 2);
      }
      if (position !== bytes) throw invalid();
    }
    if (
      format === "jpg" &&
      (head[0] !== 255 || head[1] !== 216 || head[2] !== 255)
    )
      throw invalid();
    if (format === "bmp" && head.toString("ascii", 0, 2) !== "BM")
      throw invalid();
  } finally {
    await handle.close();
  }
}
async function audioConversion(job, input, output, data) {
  const info = audioInfo(data, job.inputFormat.id);
  if (info.duration > config.maxDuration)
    throw new ApiError(
      422,
      "DURATION_LIMIT",
      "Превышена допустимая длительность аудио.",
    );
  const spec = audioFormats[job.target.id];
  let sampleRate = info.sampleRate;
  if (["mp3", "m4a", "aac"].includes(job.target.id)) {
    const rates = [
      8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000,
    ];
    sampleRate = rates.reduce((best, rate) =>
      Math.abs(rate - info.sampleRate) < Math.abs(best - info.sampleRate)
        ? rate
        : best,
    );
  } else if (job.target.id === "ogg") sampleRate = Math.min(sampleRate, 48000);
  if (
    ["wav", "flac"].includes(job.target.id) &&
    Math.ceil(info.duration * sampleRate * info.channels * 2) + 1048576 >
      config.maxOutputBytes
  )
    throw new ApiError(
      413,
      "OUTPUT_LIMIT",
      "Ожидаемый результат превышает лимит размера. Выберите более короткое аудио.",
    );
  job.source = {
    category: "audio",
    format: job.inputFormat.label,
    ...info,
    bytes: job.inputBytes,
  };
  job.status = "converting";
  job.step = "converting";
  job.progress = { seconds: 0, percent: 0 };
  await runTool(
    config.ffmpeg,
    [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-xerror",
      "-y",
      "-max_alloc",
      "268435456",
      "-protocol_whitelist",
      "file,pipe",
      "-i",
      input,
      "-map",
      "0:a:0",
      "-vn",
      "-sn",
      "-dn",
      "-map_metadata",
      "-1",
      ...spec.encoder,
      "-ar",
      String(sampleRate),
      "-ac",
      String(info.channels),
      "-threads",
      "1",
      "-fs",
      String(config.maxOutputBytes - 4096),
      "-f",
      spec.muxer,
      ...(job.target.id === "wav" ? ["-rf64", "never"] : []),
      "-progress",
      "pipe:1",
      output,
    ],
    {
      signal: job.controller.signal,
      onLine: (line) => {
        if (!line.startsWith("out_time_us=")) return;
        const seconds = Number(line.slice("out_time_us=".length)) / 1000000;
        if (!Number.isFinite(seconds) || seconds < 0) return;
        if (seconds > config.maxDuration + 1)
          job.controller.abort(
            new ApiError(
              422,
              "DURATION_LIMIT",
              "Фактическая длительность превысила лимит.",
            ),
          );
        job.progress = {
          seconds,
          percent: Math.min(100, Math.max(0, (seconds / info.duration) * 100)),
        };
      },
    },
  );
  job.status = "checking";
  job.step = "checking";
  const result = audioInfo(
    await probe(output, job.controller.signal),
    job.target.id,
  );
  if (
    result.codec !== spec.codec ||
    result.sampleRate !== sampleRate ||
    result.channels !== info.channels ||
    Math.abs(result.duration - info.duration) > 1
  )
    throw new ApiError(
      502,
      "INVALID_RESULT",
      "Результат не прошёл проверку аудиодорожки и длительности.",
    );
  return {
    category: "audio",
    format: job.target.label,
    codec: spec.label,
    duration: result.duration,
    sampleRate,
    channels: result.channels,
  };
}
async function imageConversion(job, input, output, data) {
  const info = imageInfo(data, job.inputFormat.id);
  if (job.target.id === "webp" && Math.max(info.width, info.height) > 16383)
    throw new ApiError(
      413,
      "IMAGE_DIMENSIONS",
      "Для WebP каждая сторона должна быть не больше 16383 пикселей.",
    );

  job.source = {
    category: "image",
    format: job.inputFormat.label,
    ...info,
    bytes: job.inputBytes,
  };
  job.status = "converting";
  job.step = "converting";
  job.progress = null;
  const estimatedBytes = info.width * info.height * 6 + 65536;
  if (estimatedBytes > config.maxOutputBytes)
    throw new ApiError(
      413,
      "OUTPUT_LIMIT",
      "Для этого изображения недостаточен лимит выходного файла. Выберите меньшую картинку или увеличьте CONVERTER_MAX_OUTPUT_BYTES.",
    );
  const opaque = ["jpg", "bmp"].includes(job.target.id);
  // Composite transparency onto white before encoding an opaque format.
  const filter = opaque
    ? [
        "-filter_complex",
        "[0:v:0]format=rgba,split[image][base];[base]lutrgb=r=255:g=255:b=255:a=255[white];[white][image]overlay=shortest=1:format=auto,format=rgb24[out]",
        "-map",
        "[out]",
      ]
    : ["-map", "0:v:0"];
  await runTool(
    config.ffmpeg,
    [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-xerror",
      "-y",
      "-max_alloc",
      "268435456",
      "-threads",
      "1",
      "-protocol_whitelist",
      "file,pipe",
      "-f",
      imageFormats[job.inputFormat.id].demuxer,
      "-i",
      input,
      "-filter_threads",
      "1",
      "-filter_complex_threads",
      "1",
      ...filter,
      "-an",
      "-sn",
      "-dn",
      "-map_metadata",
      "-1",
      "-frames:v",
      "1",
      ...imageFormats[job.target.id].encoder,
      "-threads",
      "1",
      "-fs",
      String(config.maxOutputBytes - 4096),
      "-f",
      "image2",
      "-update",
      "1",
      output,
    ],
    { signal: job.controller.signal },
  );
  job.status = "checking";
  job.step = "checking";
  const result = imageInfo(
    await probe(output, job.controller.signal),
    job.target.id,
  );
  const same = result.width === info.width && result.height === info.height;
  const rotated = result.width === info.height && result.height === info.width;
  if (!same && !rotated)
    throw new ApiError(
      502,
      "INVALID_RESULT",
      "Размеры изображения после обработки не прошли проверку.",
    );
  return { category: "image", format: job.target.label, ...result };
}
export async function convertFile(job) {
  const { signal } = job.controller;
  const input = join(job.directory, "source." + job.inputFormat.id);
  const output = join(job.directory, "result." + job.target.id);
  job.status = "analysing";
  job.step = "analysing";
  let monitoring = true,
    checking = false;
  const watcher = setInterval(async () => {
    if (!monitoring || checking || signal.aborted) return;
    checking = true;
    try {
      const file = await stat(output).catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
      if (monitoring && file && file.size > config.maxOutputBytes)
        job.controller.abort(
          new ApiError(
            413,
            "OUTPUT_LIMIT",
            "Результат превысил допустимый размер.",
          ),
        );
    } catch {
      if (monitoring)
        job.controller.abort(
          new ApiError(
            500,
            "STORAGE_ERROR",
            "Не удалось обратиться к временному хранилищу.",
          ),
        );
    } finally {
      checking = false;
    }
  }, 250);
  try {
    if (job.inputFormat.category === "image")
      await requireStaticImage(input, job.inputFormat.id, signal);
    const data = await probe(input, signal);
    const details = await (job.inputFormat.category === "audio"
      ? audioConversion(job, input, output, data)
      : imageConversion(job, input, output, data));
    const bytes = (await stat(output)).size;
    if (!bytes || bytes > config.maxOutputBytes)
      throw new ApiError(
        413,
        "OUTPUT_LIMIT",
        "Результат пуст или превышает допустимый размер.",
      );
    signal.throwIfAborted();
    monitoring = false;
    clearInterval(watcher);
    await rm(input, { force: true });
    const name = job.inputName
      .replace(/\.[^.]*$/, "")
      .normalize("NFC")
      .split("")
      .filter((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join("")
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/^\.+|[.\s]+$/g, "")
      .slice(0, 90)
      .toWellFormed()
      .trim();
    job.result = {
      filename: "LePear-" + (name || "file") + "." + job.target.id,
      bytes,
      ...details,
    };
    job.file = output;
  } catch (error) {
    if (error.code === "PROCESSING_FAILED")
      throw new ApiError(
        422,
        "CONVERSION_FAILED",
        "Не удалось обработать файл. Он может быть повреждён или иметь неподдерживаемое кодирование. Для дополнительных форматов используйте актуальную установку FFmpeg.",
      );
    if (error.code === "TOOL_MISSING")
      throw new ApiError(
        503,
        "TOOLS_MISSING",
        "FFmpeg/ffprobe недоступны. Установите инструменты и перезапустите API.",
      );
    throw error;
  } finally {
    monitoring = false;
    clearInterval(watcher);
  }
}
