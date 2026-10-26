import { MotionIcon } from "@/components/motion/motion-icon";
import { ToolPageHeader } from "@/components/layout/tool-page-header";
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ArrowRight, CircleCheck, LoaderCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { controlClasses as controls } from "@/components/editor/control-classes";
import { designClasses as ui } from "@/lib/design-system";
import { useConverter } from "@/lib/use-converter";
import {
  converterAccept,
  converterFormats,
  formatForName,
  targetsForName,
} from "@/lib/converter-formats";
import { durationLabel, mediaSizeLabel } from "@/lib/youtube-api";
const stages: Record<string, string> = {
  "awaiting-upload": "Подготовка загрузки",
  uploading: "Загрузка файла",
  analysing: "Проверка файла",
  converting: "Конвертация",
  checking: "Проверка результата",
  cancelling: "Отмена",
  ready: "Файл готов",
};
function size(bytes: number) {
  return mediaSizeLabel({ bytes, approximate: false });
}
export default function ConverterPage() {
  const id = useId();
  const picker = useRef<HTMLInputElement>(null);
  const pickerButton = useRef<HTMLButtonElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("");
  const [fileError, setFileError] = useState("");
  const conversion = useConverter();
  const busy =
    conversion.phase === "working" || conversion.phase === "cancelling";
  const result = conversion.job?.result;
  const source = conversion.job?.source;
  const inputFormat = file ? formatForName(file.name) : undefined;
  const targets = file ? targetsForName(file.name) : [];
  const selected = targets.find((target) => target.id === format);
  const isImage = inputFormat?.category === "image";
  const percent =
    conversion.upload ??
    (conversion.job?.status === "converting"
      ? conversion.job.progress?.percent
      : null);
  function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen || busy) return;
    conversion.reset();
    setFile(null);
    setFormat("");
    const recognized = formatForName(chosen.name);
    if (!recognized) {
      setFileError(
        "Выберите поддерживаемое аудио или изображение. Список форматов указан справа.",
      );
      return;
    }
    if (!chosen.size || chosen.size > conversion.limits.inputBytes) {
      setFileError(
        "Файл пуст или больше " + size(conversion.limits.inputBytes) + ".",
      );
      return;
    }
    const available = targetsForName(chosen.name);
    const preferred = recognized.category === "audio" ? "wav" : "png";
    setFormat(
      available.find((target) => target.id === preferred)?.id ??
        available[0]?.id ??
        "",
    );
    setFileError("");
    setFile(chosen);
  }
  function clear() {
    if (busy) return;
    conversion.reset();
    setFile(null);
    setFormat("");
    setFileError("");
    pickerButton.current?.focus();
  }
  function changeFormat(value: string | null) {
    if (
      busy ||
      !value ||
      value === format ||
      !targets.some((target) => target.id === value)
    )
      return;
    conversion.reset();
    setFormat(value);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy || !selected) return;
    if (conversion.phase === "ready") void conversion.download();
    else void conversion.start(file, selected.id);
  }
  const status =
    conversion.phase === "cancelling"
      ? "Отменяем конвертацию…"
      : stages[conversion.job?.status ?? ""] || "Подключение к конвертеру";
  return (
    <main className={ui.container + " py-8 sm:py-12 lg:py-16"}>
      <ToolPageHeader
        eyebrow="LEPEAR / КОНВЕРТЕР"
        title="Ваш файл."
        accent="Новый формат."
        description="Музыка и изображения — в формате, который нужен вам. Выберите файл, и мы покажем подходящие варианты."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)] lg:items-start">
        <ScrollReveal
          className={ui.surface + " relative overflow-hidden sm:p-8"}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-shell-accent/8 blur-3xl"
          />
          <form
            onSubmit={submit}
            className="relative space-y-6"
            aria-busy={busy}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={ui.eyebrow}>01 / ИСХОДНИК</p>
                <h2 className={ui.cardTitle + " mt-2"}>Начнём с файла</h2>
              </div>
            </div>
            <input
              ref={picker}
              id={id + "-file"}
              type="file"
              accept={converterAccept}
              onChange={choose}
              disabled={busy}
              className="sr-only"
              tabIndex={-1}
              aria-label="Выбрать аудио или изображение"
            />
            <div className="rounded-xl border border-dashed border-shell-accent/30 bg-shell-deep p-5 sm:p-6">
              <p className="text-base leading-7 font-medium break-all">
                {file?.name || "Выберите музыку или изображение"}
              </p>
              <p id={id + "-file-help"} className={ui.caption + " mt-1"}>
                {file
                  ? size(file.size) +
                    (source
                      ? " · Формат подтверждён: " + source.format
                      : " · " +
                        inputFormat?.label +
                        " по расширению; содержимое проверим после загрузки")
                  : "Один файл до " +
                    size(conversion.limits.inputBytes) +
                    ". Без автоматической загрузки."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  ref={pickerButton}
                  type="button"
                  variant="outline"
                  className={ui.secondaryAction}
                  onClick={() => picker.current?.click()}
                  disabled={busy}
                  aria-describedby={id + "-file-help"}
                >
                  <Upload aria-hidden="true" className="size-4" />
                  {file ? "Выбрать другой" : "Выбрать файл"}
                </Button>
                {file && (
                  <Button
                    type="button"
                    variant="ghost"
                    className={ui.quietAction}
                    onClick={clear}
                    disabled={busy}
                    aria-label={"Убрать файл " + file.name}
                  >
                    <MotionIcon
                      icon={X}
                      effect="close"
                      size={16}
                      className=""
                    />
                    Убрать
                  </Button>
                )}
              </div>
            </div>
            {fileError && (
              <p role="alert" className="text-base leading-7 text-shell-danger">
                {fileError}
              </p>
            )}
            <div>
              <Label
                htmlFor={id + "-format"}
                className="mb-2 block text-base text-shell-text"
              >
                Формат результата
              </Label>
              <Select
                items={targets.map((target) => ({
                  value: target.id,
                  label: target.label,
                }))}
                value={format || null}
                onValueChange={changeFormat}
                disabled={busy || !file}
              >
                <SelectTrigger
                  id={id + "-format"}
                  className={controls.trigger}
                  aria-describedby={id + "-format-help"}
                >
                  <SelectValue placeholder="Сначала выберите файл" />
                </SelectTrigger>
                <SelectContent className={controls.popup}>
                  {targets.map((target) => (
                    <SelectItem
                      key={target.id}
                      value={target.id}
                      className={controls.option}
                    >
                      {target.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id={id + "-format-help"} className={ui.caption + " mt-2"}>
                {!file
                  ? "Для музыки предложим аудиоформаты, для картинки — форматы изображений."
                  : isImage
                    ? ["jpg", "bmp"].includes(format)
                      ? "JPEG и BMP не сохраняют прозрачность: заменим её белым фоном. Размер изображения сохраним с учётом ориентации."
                      : "PNG и WebP сохраняют прозрачность. Размер изображения сохраним с учётом ориентации; анимация пока не поддерживается."
                    : ["wav", "flac"].includes(format)
                      ? "WAV и FLAC — 16 бит. Сохраним частоту и число каналов; размер может вырасти. Качество исходной записи не повышается."
                      : "Сжатие с потерями: MP3 VBR, OGG Vorbis или AAC 192 кбит/с в M4A/AAC. Каналы сохраним, частоту при необходимости приведём к совместимой."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-shell-divider/10 pt-5">
              <Button
                type="submit"
                className={ui.primaryAction}
                disabled={!file || !selected || busy}
              >
                {busy ? (
                  <MotionIcon icon={LoaderCircle} size={16} state="loading" />
                ) : (
                  <MotionIcon
                    icon={ArrowRight}
                    effect="nudge"
                    size={16}
                    className=""
                  />
                )}
                {conversion.phase === "ready"
                  ? "Скачать " + result?.format
                  : "Конвертировать"}
              </Button>
              {busy && (
                <Button
                  type="button"
                  variant="outline"
                  className={ui.secondaryAction}
                  onClick={() => void conversion.cancel()}
                  disabled={conversion.phase === "cancelling"}
                >
                  Отменить
                </Button>
              )}
            </div>
            {conversion.phase !== "idle" && (
              <div
                className={ui.inset + " space-y-3"}
                aria-live="polite"
                aria-atomic="true"
              >
                {busy ? (
                  <>
                    <div className="flex items-center justify-between gap-3 text-base">
                      <span>{status}</span>
                      {percent != null && (
                        <span className="font-mono text-shell-accent">
                          {Math.round(percent)}%
                        </span>
                      )}
                    </div>
                    {percent != null ? (
                      <div
                        role="progressbar"
                        aria-label={
                          conversion.upload != null
                            ? "Загрузка файла"
                            : "Конвертация аудио"
                        }
                        aria-valuenow={Math.round(percent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="flex h-2.5 gap-1"
                      >
                        {Array.from({ length: 24 }, (_, index) => (
                          <span
                            key={index}
                            className={
                              "h-full min-w-0 flex-1 rounded-sm transition-colors motion-reduce:transition-none " +
                              (index < Math.ceil((percent / 100) * 24)
                                ? "bg-shell-accent"
                                : "bg-shell-divider/8")
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <p className={ui.caption}>
                        Этот этап без точного процента — дождитесь завершения.
                      </p>
                    )}
                    {conversion.job?.progress &&
                      conversion.job.status === "converting" &&
                      source?.category === "audio" && (
                        <p className={ui.caption}>
                          Обработано аудио:{" "}
                          {durationLabel(conversion.job.progress.seconds)} из{" "}
                          {durationLabel(source.duration)}.
                        </p>
                      )}
                  </>
                ) : (
                  <>
                    <p
                      role={conversion.phase === "error" ? "alert" : "status"}
                      className={
                        "text-base leading-7 " +
                        (conversion.phase === "error"
                          ? "text-shell-danger"
                          : "text-shell-soft")
                      }
                    >
                      {conversion.message}
                    </p>
                    {conversion.phase === "ready" && result && (
                      <>
                        <p className="flex items-start gap-2 text-base leading-7 break-all">
                          <MotionIcon
                            icon={CircleCheck}
                            size={20}
                            state="success"
                            className="mt-1 text-shell-accent"
                          />
                          {result.filename}
                        </p>
                        <p className={ui.caption}>
                          {size(result.bytes)} ·{" "}
                          {result.category === "audio"
                            ? durationLabel(result.duration) +
                              " · " +
                              result.sampleRate / 1000 +
                              " кГц · " +
                              (result.channels === 1 ? "моно" : "стерео") +
                              " · " +
                              result.codec
                            : result.width +
                              " × " +
                              result.height +
                              " пикс. · " +
                              result.format}
                        </p>
                        <p className={ui.caption}>
                          Файл доступен{" "}
                          {Math.round(conversion.limits.ttlMs / 60000)} минут.
                          Если скачивание не началось, нажмите «Скачать{" "}
                          {result.format}».
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </form>
        </ScrollReveal>
        <ScrollReveal
          as="aside"
          delay={0.12}
          className={ui.surface + " space-y-6 sm:p-8"}
        >
          <div
            aria-hidden="true"
            className="flex items-center justify-between gap-3 rounded-xl border border-shell-accent/20 bg-shell-deep px-5 py-6"
          >
            <span className="font-mono text-xl text-shell-muted">
              {inputFormat?.label ?? "ФАЙЛ"}
            </span>
            <MotionIcon
              icon={ArrowRight}
              effect="nudge"
              size={24}
              className="shrink-0 text-shell-accent"
            />
            <span className="font-mono text-xl text-shell-accent">
              {selected?.label ?? "ФОРМАТ"}
            </span>
          </div>
          <div>
            <p className={ui.eyebrow}>02 / ВОЗМОЖНОСТИ</p>
            <h2 className={ui.cardTitle + " mt-2"}>Под задачу, под ваш файл</h2>
            <p className={ui.body + " mt-3"}>
              Форматы из одной категории совместимы между собой. Исходный формат
              не дублируется в списке.
            </p>
          </div>
          <div className="space-y-4">
            <div className={ui.inset}>
              <h3 className="flex items-center gap-2 text-base font-medium">
                Музыка
              </h3>
              <p className={ui.body + " mt-2"}>
                {converterFormats
                  .filter((item) => item.category === "audio")
                  .map((item) => item.label)
                  .join(" · ")}
              </p>
              <p className={ui.caption + " mt-1"}>
                До {Math.round(conversion.limits.durationSeconds / 60)} минут,
                моно/стерео, исходная частота 8–96 кГц.
              </p>
            </div>
            <div className={ui.inset}>
              <h3 className="flex items-center gap-2 text-base font-medium">
                Изображения
              </h3>
              <p className={ui.body + " mt-2"}>
                {converterFormats
                  .filter((item) => item.category === "image")
                  .map((item) => item.label)
                  .join(" · ")}
              </p>
              <p className={ui.caption + " mt-1"}>
                Статичные изображения до{" "}
                {Math.round(conversion.limits.imagePixels / 1000000)} Мп. Для
                WebP — не более 16383 пикселей по каждой стороне.
              </p>
            </div>
          </div>
          <div className="border-t border-shell-divider/10 pt-5">
            <h3 className="text-base font-medium">Файлы временные</h3>
            <p className={ui.caption + " mt-2"}>
              Один файл за раз, результат до{" "}
              {size(conversion.limits.outputBytes)}. Конвертация работает через
              локальный API. Исходник удаляется после обработки, результат —
              через {Math.round(conversion.limits.ttlMs / 60000)} минут.
            </p>
            <p className={ui.caption + " mt-2"}>
              При уходе со страницы отправляем отмену. Если связь прервётся,
              задание остановит серверный таймер. Автоматического возобновления
              нет.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
