import { useId, useState } from "react";
import { Download, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { controlClasses as controls } from "@/components/editor/control-classes";
import { designClasses as ui } from "@/lib/design-system";
import { mediaSizeLabel, type YouTubeMetadata } from "@/lib/youtube-api";
import { useVideoDownload } from "@/lib/use-video-download";

const stages: Record<string, string> = {
  preparing: "Проверяем ролик и выбранный формат…",
  video: "Скачиваем видеопоток",
  audio: "Скачиваем звуковую дорожку",
  merging: "Объединяем видео и звук…",
  converting: "Конвертируем в MP3…",
  packaging: "Сохраняем исходную аудиодорожку…",
  checking: "Проверяем готовый файл…",
  cancelling: "Останавливаем обработку…",
  ready: "Видео со звуком готово",
  cancelled: "Задание отменено",
  expired: "Срок хранения файла истёк. Нажмите «Скачать» ещё раз.",
  failed: "Не удалось скачать файл",
};
export function VideoDownload({
  data,
  kind = "video",
}: {
  data: YouTubeMetadata;
  kind?: "video" | "audio";
}) {
  const id = useId();
  const audioMode = kind === "audio";
  const videoFormats = data.formats.video.filter((item) =>
    ["mp4", "webm"].includes(item.ext),
  );
  const audioFormats = data.formats.audio.filter((item) =>
    ["m4a", "webm", "opus", "mp3"].includes(item.ext),
  );
  const bestVideo =
    [...videoFormats]
      .sort(
        (a, b) =>
          (b.height ?? 0) - (a.height ?? 0) ||
          (b.fps ?? 0) - (a.fps ?? 0) ||
          Number(b.ext === "mp4") - Number(a.ext === "mp4"),
      )
      .find(
        (format) =>
          format.hasAudio ||
          data.formats.audio.some((audio) =>
            format.ext === "mp4"
              ? audio.ext === "m4a" && /^(mp4a|aac)/i.test(audio.codec)
              : ["webm", "opus"].includes(audio.ext) &&
                /^(opus|vorbis)/i.test(audio.codec),
          ),
      ) ?? videoFormats[0];
  const bestAudio = [...audioFormats].sort(
    (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0),
  )[0];
  const [selected, setSelected] = useState<string | null>("best");
  const selectedFormatId =
    selected === "best"
      ? ((audioMode ? bestAudio?.id : bestVideo?.id) ?? null)
      : selected;
  const [audioOutput, setAudioOutput] = useState<"original" | "mp3">(
    "original",
  );
  const sourceAudio = audioFormats.find((item) => item.id === selectedFormatId);
  const originalExt =
    sourceAudio?.ext === "m4a" && /^(mp4a|aac)/i.test(sourceAudio.codec)
      ? "M4A"
      : /^opus/i.test(sourceAudio?.codec ?? "")
        ? "Opus"
        : null;
  const outputFormat = originalExt ? audioOutput : "mp3";
  const outputOptions = [
    ...(originalExt
      ? [{ value: "original", label: originalExt + " · без перекодирования" }]
      : []),
    { value: "mp3", label: "MP3 · конвертация" },
  ];
  const download = useVideoDownload(data.video.id, kind);
  const formatOptions = audioMode
    ? audioFormats.map((format) => ({
        value: format.id,
        label:
          format.ext.toUpperCase() +
          " · " +
          format.codec +
          (format.bitrate
            ? " · " + Math.round(format.bitrate) + " кбит/с"
            : "") +
          (format.language ? " · " + format.language : "") +
          " · " +
          mediaSizeLabel(format.size),
      }))
    : videoFormats.map((format) => ({
        value: format.id,
        label:
          (format.height ? format.height + "p" : "Разрешение не указано") +
          (format.fps ? " · " + format.fps + " fps" : "") +
          " · " +
          format.ext.toUpperCase() +
          " · " +
          format.codec +
          " · " +
          mediaSizeLabel(format.size),
      }));
  const options = formatOptions.length
    ? [{ value: "best", label: "Лучшее качество" }, ...formatOptions]
    : [];
  const resolvedOption = formatOptions.find(
    (option) => option.value === selectedFormatId,
  );
  const job = download.job;
  const progress = job?.progress;
  const hasProgress =
    job?.status === "downloading" &&
    progress?.percent !== null &&
    progress?.percent !== undefined;
  return (
    <div
      className="mt-5 min-w-0 space-y-4"
      aria-busy={download.busy || download.checkingFile}
    >
      {!!options.length && (
        <div>
          <Label htmlFor={id} className="mb-2 text-sm leading-6">
            {audioMode ? "Исходная аудиодорожка" : "Качество и контейнер"}
          </Label>
          <Select
            items={options}
            value={selected}
            disabled={download.busy || download.checkingFile}
            onValueChange={(value) => {
              if (typeof value === "string") setSelected(value);
            }}
          >
            <SelectTrigger id={id} className={controls.trigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className={controls.popup}
            >
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={controls.option}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {selected === "best" && resolvedOption && (
        <p className={ui.caption}>
          Автоматически выбрано: {resolvedOption.label}
        </p>
      )}
      {audioMode && !!options.length && (
        <div>
          <Label htmlFor={id + "-output"} className="mb-2 text-sm leading-6">
            Формат файла
          </Label>
          <Select
            items={outputOptions}
            value={outputFormat}
            disabled={download.busy || download.checkingFile}
            onValueChange={(value) => {
              if (value === "original" || value === "mp3")
                setAudioOutput(value);
            }}
          >
            <SelectTrigger id={id + "-output"} className={controls.trigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className={controls.popup}
            >
              {outputOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={controls.option}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <p className={ui.caption}>
        {audioMode
          ? "Исходные M4A и Opus сохраняются без перекодирования. MP3 создаётся конвертацией и не улучшает качество источника. Размер в списке относится к исходной дорожке; размер MP3 станет известен после обработки."
          : "MP4 удобнее для большинства устройств; WebM доступен как альтернатива. Размер в списке относится к исходному видеопотоку. При необходимости звук добавится отдельно без перекодирования."}
      </p>
      {!options.length && (
        <p className={ui.caption}>
          {audioMode
            ? data.formats.video.some((format) => format.hasAudio)
              ? "Отдельная аудиодорожка недоступна. Звук есть только в составе видео; выберите другой ролик."
              : "Подходящих аудиодорожек нет."
            : "Подходящих форматов MP4 или WebM нет."}
        </p>
      )}
      {!data.capabilities.downloads && (
        <p
          role="status"
          className="rounded-xl border border-shell-warning/25 p-4 text-sm leading-6 text-shell-warning"
        >
          Скачивание недоступно. Установите FFmpeg и ffprobe, затем
          перезапустите API и обновите данные ролика.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={
            download.busy ||
            download.checkingFile ||
            !selectedFormatId ||
            !options.length ||
            !data.capabilities.downloads
          }
          className={ui.primaryAction + " w-full disabled:opacity-40 sm:w-auto"}
          onClick={() => {
            if (selectedFormatId) {
              if (
                job?.status === "ready" &&
                job.formatId === selectedFormatId &&
                (!audioMode || job.outputFormat === outputFormat)
              ) {
                void download.saveReady();
              } else {
                void download.start(
                  selectedFormatId,
                  audioMode ? outputFormat : undefined,
                );
              }
            }
          }}
        >
          {download.busy ? (
            <LoaderCircle
              size={18}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Download size={18} aria-hidden="true" />
          )}
          {download.busy ? "Скачивание…" : "Скачать"}
        </Button>
        {(download.busy || download.phase === "error") && (
          <Button
            type="button"
            variant="outline"
            className={ui.secondaryAction}
            onClick={download.cancel}
            disabled={download.cancelling}
          >
            <X size={16} aria-hidden="true" />
            {download.cancelling ? "Отменяем…" : "Отменить"}
          </Button>
        )}
      </div>
      {(job || download.phase === "cancelled" || download.cancelling) && (
        <div className="space-y-3 rounded-xl border border-shell-accent/20 bg-shell-deep p-4">
          <p
            role="status"
            aria-atomic="true"
            className="text-base leading-7 text-shell-accent"
          >
            {job
              ? audioMode && job.step === "ready"
                ? "Аудиофайл готов"
                : (stages[job.step] ?? "Обрабатываем…")
              : "Запрошена отмена. Сервер останавливает обработку и удаляет временные файлы."}
          </p>
          {job?.status === "downloading" && progress && (
            <div>
              {hasProgress && (
                <progress
                  className="my-3 block h-2 w-full appearance-none overflow-hidden rounded-full border border-shell-accent/10 bg-shell-raised [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-shell-raised [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-shell-accent [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-500 [&::-webkit-progress-value]:ease-out [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-shell-accent motion-reduce:[&::-webkit-progress-value]:transition-none"
                  value={progress.percent ?? 0}
                  max={100}
                  aria-label={
                    job.step === "audio" ? "Звуковая дорожка" : "Видеопоток"
                  }
                />
              )}
              <p className={ui.caption}>
                {mediaSizeLabel({
                  bytes: progress.downloadedBytes,
                  approximate: false,
                })}
                {progress.totalBytes
                  ? " из " +
                    mediaSizeLabel({
                      bytes: progress.totalBytes,
                      approximate: progress.approximate,
                    })
                  : " · Общий размер пока неизвестен"}
                {hasProgress
                  ? " · " +
                    (progress.approximate ? "≈ " : "") +
                    Math.floor(progress.percent ?? 0) +
                    "%"
                  : ""}
              </p>
              <p className={ui.caption}>
                {audioMode
                  ? "Прогресс скачивания исходной аудиодорожки."
                  : "Прогресс текущей дорожки; при переходе к звуку отсчёт начинается заново."}
              </p>
            </div>
          )}
          {job?.error && (
            <p role="alert" className="text-sm leading-6 text-shell-danger">
              {job.error.message}
            </p>
          )}
          {job?.status === "ready" && job.result && (
            <>
              <p className="text-sm leading-6 wrap-anywhere">
                {job.result.filename}
                <br />
                {mediaSizeLabel({
                  bytes: job.result.bytes,
                  approximate: false,
                })}{" "}
                · {job.result.ext.toUpperCase()}
                {job.result.height ? " · " + job.result.height + "p" : ""}
              </p>
              <p className={ui.caption}>
                Доступно до{" "}
                {job.expiresAt
                  ? new Date(job.expiresAt).toLocaleTimeString("ru-RU")
                  : "истечения срока хранения"}
                . Можно скачать повторно.
              </p>
              <p role="status" className={ui.caption}>
                Файл передан браузеру. Ход скачивания смотрите в загрузках
                браузера. Если скачивание не началось, нажмите «Скачать» ещё
                раз.
              </p>
            </>
          )}
        </div>
      )}
      {download.error && (
        <p
          role="alert"
          className="rounded-xl border border-shell-danger/25 p-4 text-sm leading-6 text-shell-danger"
        >
          {download.error}
        </p>
      )}
      <p className={ui.caption}>
        Нажмите «Скачать» — готовый файл автоматически передаётся браузеру. Для
        текста с таймкодами выберите вкладку «Субтитры».
      </p>
    </div>
  );
}
