import { DownloadStateIcon } from "@/components/youtube/download-state-icon";
import { MotionIcon } from "@/components/motion/motion-icon";
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
  preparing: "Проверяем выбранную дорожку…",
  subtitles: "Скачиваем субтитры…",
  "converting-subtitles": "Преобразуем формат субтитров…",
  checking: "Проверяем текст и таймкоды…",
  ready: "Субтитры переданы браузеру",
  cancelling: "Отменяем скачивание…",
  cancelled: "Скачивание отменено",
  expired: "Срок хранения истёк. Нажмите «Скачать» ещё раз.",
  failed: "Не удалось скачать субтитры",
};
export function SubtitleDownload({ data }: { data: YouTubeMetadata }) {
  const id = useId();
  const tracks = data.subtitles.filter(
    (track) =>
      /^[A-Za-z0-9_-]{1,80}$/.test(track.language) &&
      track.formats.some((format) => format === "vtt" || format === "srt"),
  );
  const preferred =
    tracks.find(
      (track) =>
        track.source === "manual" && /^ru(?:-|$)/i.test(track.language),
    ) ??
    tracks.find((track) => /^ru(?:-|$)/i.test(track.language)) ??
    tracks.find((track) => track.source === "manual") ??
    tracks[0];
  const [selected, setSelected] = useState<string | null>(
    preferred?.id ?? null,
  );
  const [format, setFormat] = useState<"vtt" | "srt">("vtt");
  const track = tracks.find((item) => item.id === selected);
  const download = useVideoDownload(data.video.id, "subtitles");
  const options = tracks.map((item) => ({
    value: item.id,
    label:
      item.name +
      " [" +
      item.language +
      "] · " +
      (item.source === "manual" ? "Авторские" : "Автоматические"),
  }));
  const formatOptions = (["vtt", "srt"] as const).map((value) => ({
    value,
    label:
      value.toUpperCase() +
      (track?.formats.includes(value)
        ? " · исходный формат"
        : " · конвертация"),
  }));
  const job = download.job;
  function start() {
    if (!selected) return;
    if (
      job?.status === "ready" &&
      job.subtitleTrackId === selected &&
      job.formatId === format
    )
      void download.saveReady();
    else void download.start(format, undefined, selected);
  }
  return (
    <div
      className="mt-5 min-w-0 space-y-4"
      aria-busy={download.busy || download.checkingFile}
    >
      {!!tracks.length && (
        <>
          <div>
            <Label htmlFor={id + "-track"} className="mb-2 text-sm leading-6">
              Язык и источник субтитров
            </Label>
            <Select
              items={options}
              value={selected}
              disabled={download.busy || download.checkingFile}
              onValueChange={(value) => {
                if (typeof value === "string") setSelected(value);
              }}
            >
              <SelectTrigger id={id + "-track"} className={controls.trigger}>
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
          <div>
            <Label htmlFor={id + "-format"} className="mb-2 text-sm leading-6">
              Формат файла
            </Label>
            <Select
              items={formatOptions}
              value={format}
              disabled={download.busy || download.checkingFile}
              onValueChange={(value) => {
                if (value === "vtt" || value === "srt") setFormat(value);
              }}
            >
              <SelectTrigger id={id + "-format"} className={controls.trigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                alignItemWithTrigger={false}
                className={controls.popup}
              >
                {formatOptions.map((option) => (
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
          <p className={ui.caption}>
            Скачается только выбранная дорожка с текстом и таймкодами. Видео и
            аудио не загружаются. Если исходный формат отличается, субтитры
            будут преобразованы.
          </p>
        </>
      )}
      {!tracks.length && (
        <p
          role="status"
          className="rounded-xl border border-shell-divider/10 bg-shell-deep p-4 text-sm leading-6 text-shell-muted"
        >
          {data.subtitles.length
            ? "Для доступных дорожек пока нет поддержки VTT/SRT."
            : "Субтитры недоступны."}
        </p>
      )}
      {!data.capabilities.downloads && (
        <p className={ui.caption}>
          Скачивание недоступно. Перезапустите API и обновите данные по ссылке;
          для конвертации нужен FFmpeg.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={
            download.busy ||
            download.checkingFile ||
            download.retryAfterSeconds > 0 ||
            !track ||
            !data.capabilities.downloads
          }
          className={ui.primaryAction + " w-full disabled:opacity-40 sm:w-auto"}
          onClick={start}
        >
          {download.busy ? (
            <MotionIcon icon={LoaderCircle} size={18} state="loading" />
          ) : (
            <MotionIcon icon={Download} effect="download" size={18} />
          )}
          {download.retryAfterSeconds > 0
            ? "Повторить через " +
              Math.floor(download.retryAfterSeconds / 60) +
              ":" +
              String(download.retryAfterSeconds % 60).padStart(2, "0")
            : download.busy
              ? "Скачивание…"
              : "Скачать"}
        </Button>
        {(download.busy ||
          (download.phase === "error" && !download.retryAfterSeconds)) && (
          <Button
            type="button"
            variant="outline"
            className={ui.secondaryAction}
            onClick={download.cancel}
            disabled={download.cancelling}
          >
            <MotionIcon icon={X} effect="close" size={16} />
            {download.cancelling ? "Отменяем…" : "Отменить"}
          </Button>
        )}
      </div>
      {(job || download.phase === "cancelled" || download.cancelling) && (
        <div className="space-y-3 rounded-xl border border-shell-accent/20 bg-shell-deep p-4">
          <p
            role="status"
            aria-atomic="true"
            className="flex items-start gap-2 text-base leading-7 text-shell-accent"
          >
            <DownloadStateIcon
              status={
                download.cancelling
                  ? "cancelling"
                  : download.phase === "cancelled"
                    ? "cancelled"
                    : (job?.status ?? "cancelling")
              }
            />
            <span>
              {job
                ? (stages[job.step] ?? "Обрабатываем…")
                : "Запрошена отмена. Временные файлы будут удалены."}
            </span>
          </p>
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
              </p>
              <p className={ui.caption}>
                Ход сохранения смотрите в загрузках браузера. Если оно не
                началось, нажмите «Скачать» ещё раз. Файл доступен
                {job.expiresAt
                  ? " до " + new Date(job.expiresAt).toLocaleTimeString("ru-RU")
                  : " до истечения срока хранения"}
                .
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
        Доступны только дорожки, которые вернул YouTube. Распознавание речи и
        создание перевода не выполняются.
      </p>
    </div>
  );
}
