import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { useId, useRef, useState, type FormEvent } from "react";
import {
  CircleAlert,
  CircleCheck,
  FileText,
  Headphones,
  Link2,
  LoaderCircle,
  Play,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatOptions } from "@/components/youtube/format-options";
import { designClasses as ui } from "@/lib/design-system";
import { parseYouTubeLink, type YouTubeLinkResult } from "@/lib/youtube-link";
import { useYouTubeMetadata } from "@/lib/use-youtube-metadata";
import { durationLabel } from "@/lib/youtube-api";

const modes = [
  {
    value: "video",
    label: "Видео",
    Icon: Video,
    title: "Видео со звуком",
    description: "Посмотрите доступные разрешения, FPS и контейнеры.",
  },
  {
    value: "audio",
    label: "Аудио",
    Icon: Headphones,
    title: "Только звуковая дорожка",
    description: "Исходные M4A/Opus или MP3 с конвертацией.",
  },
  {
    value: "subtitles",
    label: "Субтитры",
    Icon: FileText,
    title: "Текст с таймкодами",
    description: "Авторские и автоматические дорожки на доступных языках.",
  },
] as const;
const fieldClass =
  "h-12 w-full min-w-0 rounded-lg border-white/20 bg-shell-deep px-3 text-base text-shell-text placeholder:text-shell-dim focus-visible:border-shell-accent focus-visible:ring-shell-accent/25 aria-invalid:border-shell-danger dark:bg-shell-deep";

export default function YouTubePage() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [result, setResult] = useState<YouTubeLinkResult | null>(null);
  const { phase, data, error, load, reset, cancel } = useYouTubeMetadata();
  const loading = phase === "loading";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const parsed = parseYouTubeLink(link);
    setResult(parsed);
    if (!parsed.success) {
      inputRef.current?.focus();
      return;
    }
    void load(parsed.url);
  }
  return (
    <main className={ui.container + " py-8 sm:py-12 lg:py-16"}>
      <header className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
        <div>
          <p className={ui.eyebrow}>LEPEAR / YOUTUBE</p>
          <TextReveal as="h1" className={"mt-4 " + ui.heroTitle}>
            Одна ссылка.
            <br />
            <span className="text-shell-accent">Три формата.</span>
          </TextReveal>
        </div>
        <TextReveal className={"max-w-lg " + ui.body}>
          Видео, звук или субтитры — выберите то, что нужно для вашей работы.
          Начните со ссылки на один ролик.
        </TextReveal>
      </header>
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-7">
        <div className="min-w-0 space-y-5">
          <ScrollReveal
            as="section"
            aria-labelledby={id + "-link-title"}
            className="min-w-0 rounded-2xl border border-white/15 bg-linear-to-b from-shell-raised to-shell-surface p-5 sm:p-7"
          >
            <TextReveal
              as="h2"
              id={id + "-link-title"}
              className="flex items-center gap-3 text-xl leading-7 font-medium"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-shell-accent/20 bg-shell-accent/10 text-shell-accent">
                <Link2 size={20} aria-hidden="true" />
              </span>
              Ссылка на ролик
            </TextReveal>
            <form noValidate onSubmit={submit} className="mt-5">
              <Label htmlFor={id + "-url"} className="mb-2 text-sm leading-6">
                YouTube URL
              </Label>
              <Input
                ref={inputRef}
                id={id + "-url"}
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={link}
                maxLength={2048}
                placeholder="https://www.youtube.com/watch?v=…"
                onChange={(event) => {
                  reset();
                  setLink(event.target.value);
                  setResult(null);
                }}
                aria-invalid={result?.success === false}
                aria-describedby={
                  id +
                  "-url-hint" +
                  (result?.success === false ? " " + id + "-error" : "")
                }
                className={fieldClass}
              />
              <p id={id + "-url-hint"} className={"mt-2 " + ui.caption}>
                Одна ссылка для видео, аудио и субтитров. Можно сразу выбрать
                вкладку «Аудио» — скачивать видео сначала не нужно. Плейлисты и
                каналы целиком не обрабатываются.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className={
                    ui.primaryAction +
                    " min-h-12 w-full disabled:opacity-50 sm:w-auto"
                  }
                >
                  {loading ? (
                    <LoaderCircle
                      size={18}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                  ) : (
                    <Link2 size={18} aria-hidden="true" />
                  )}
                  {loading
                    ? "Получаем данные…"
                    : phase === "error"
                      ? "Повторить запрос"
                      : "Получить данные"}
                </Button>
                {loading && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancel}
                    className={
                      ui.secondaryAction +
                      " w-full dark:bg-transparent sm:w-auto"
                    }
                  >
                    <X size={16} aria-hidden="true" />
                    Отменить
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading || (!link && !result)}
                  onClick={() => {
                    reset();
                    setLink("");
                    setResult(null);
                    inputRef.current?.focus();
                  }}
                  className={
                    ui.secondaryAction +
                    " w-full dark:border-white/20 dark:bg-transparent dark:hover:bg-white/5 sm:w-auto"
                  }
                >
                  Очистить
                </Button>
              </div>
            </form>
            <div className="mt-5 min-h-14">
              {result?.success === false && (
                <div
                  id={id + "-error"}
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-shell-danger/25 bg-shell-danger/5 p-3 text-sm leading-6 text-shell-danger"
                >
                  <CircleAlert
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                  />
                  <p className="min-w-0 wrap-anywhere">{result.message}</p>
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-shell-danger/25 bg-shell-danger/5 p-3 text-sm leading-6 text-shell-danger"
                >
                  <CircleAlert
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                  />
                  <p className="min-w-0 wrap-anywhere">{error}</p>
                </div>
              )}
              <p
                role="status"
                aria-atomic="true"
                className="text-sm leading-6 text-shell-soft"
              >
                {loading
                  ? "Запрашиваем сведения YouTube. Видео и аудио не скачиваются."
                  : phase === "cancelled"
                    ? "Запрос отменён. Ссылку можно изменить или отправить ещё раз."
                    : data
                      ? "Данные ролика получены. Выберите вкладку для просмотра дорожек."
                      : ""}
              </p>
              {result?.success && (
                <div className="mt-3 rounded-xl border border-white/15 bg-shell-deep p-4">
                  <p className="flex items-center gap-2 text-sm leading-6 text-shell-accent">
                    <CircleCheck size={18} aria-hidden="true" />
                    Выбранный ролик
                  </p>
                  <p className="mt-2 font-mono text-sm leading-6 text-shell-text wrap-anywhere">
                    {result.url}
                  </p>
                  {result.hasPlaylist && (
                    <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-shell-warning">
                      В ссылке есть плейлист. Обрабатывается только этот ролик.
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollReveal>
          <ScrollReveal
            as="section"
            aria-labelledby={id + "-modes-title"}
            className={ui.surface}
            aria-busy={loading}
          >
            <TextReveal
              as="h2"
              id={id + "-modes-title"}
              className="text-xl leading-7 font-medium"
            >
              Что сохранить
            </TextReveal>
            <Tabs defaultValue="video" className="mt-4 gap-5">
              <TabsList
                aria-label="Тип скачивания"
                className="h-auto min-h-12 w-full flex-wrap gap-1 rounded-xl border border-white/10 bg-shell-deep p-1 group-data-horizontal/tabs:h-auto"
              >
                {modes.map(({ value, label, Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="h-auto min-h-11 min-w-0 flex-1 gap-2 rounded-lg px-3 py-2 text-sm whitespace-normal text-shell-muted data-active:bg-shell-hover data-active:text-shell-accent dark:data-active:bg-shell-hover dark:data-active:text-shell-accent motion-reduce:transition-none"
                  >
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {modes.map((mode) => (
                <TabsContent
                  keepMounted
                  key={mode.value}
                  value={mode.value}
                  className="min-w-0"
                >
                  <TextReveal as="h3" className="text-lg leading-7 font-medium">
                    {mode.title}
                  </TextReveal>
                  <TextReveal className={"mt-2 " + ui.body}>
                    {mode.description}
                  </TextReveal>
                  <FormatOptions
                    kind={mode.value}
                    data={data}
                    loading={loading}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </ScrollReveal>
        </div>
        <ScrollReveal
          as="aside"
          delay={0.12}
          aria-labelledby={id + "-video-title"}
          aria-busy={loading}
          className="min-w-0 rounded-2xl border border-white/15 bg-shell-surface p-5 sm:p-6 lg:sticky lg:top-6"
        >
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-shell-line/30 bg-linear-to-br from-shell-raised to-shell-deep">
            <span
              className="grid size-16 place-items-center rounded-full border border-shell-accent/25 text-shell-accent/65"
              aria-hidden="true"
            >
              {loading ? (
                <LoaderCircle
                  size={26}
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Play size={26} />
              )}
            </span>
            {data && (
              <img
                key={data.video.id}
                src={data.video.thumbnail}
                alt="Обложка ролика"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            )}
          </div>
          <h2
            id={id + "-video-title"}
            className="mt-5 text-xl leading-7 font-medium wrap-anywhere"
          >
            {data?.video.title ||
              (loading ? "Получаем сведения…" : "Здесь будет ваш ролик")}
          </h2>
          {data ? (
            <>
              <dl className="mt-4 grid gap-4 border-t border-white/10 pt-4 text-sm leading-6">
                <div>
                  <dt className="text-shell-dim">Канал</dt>
                  <dd className="mt-1 text-base text-shell-text wrap-anywhere">
                    {data.video.channel}
                  </dd>
                </div>
                <div>
                  <dt className="text-shell-dim">Длительность</dt>
                  <dd className="mt-1 font-mono text-shell-text">
                    {durationLabel(data.video.duration)}
                  </dd>
                </div>
                <div>
                  <dt className="text-shell-dim">Доступные дорожки</dt>
                  <dd className="mt-1 text-shell-text">
                    Видео: {data.formats.video.length} · Аудио:{" "}
                    {data.formats.audio.length}
                    <br />
                    Субтитры: {data.subtitles.length}
                  </dd>
                </div>
              </dl>
              {data.warnings.map((warning) => (
                <p
                  key={warning}
                  className="mt-4 rounded-lg border border-shell-warning/25 bg-shell-warning/5 p-3 text-sm leading-6 text-shell-warning wrap-anywhere"
                >
                  {warning}
                </p>
              ))}
            </>
          ) : (
            <p className={"mt-3 " + ui.body}>
              Введите ссылку и нажмите «Получить данные». Здесь появятся
              название, канал, длительность и доступные дорожки.
            </p>
          )}
          <p className="mt-5 rounded-lg border border-white/10 bg-shell-deep p-3 text-sm leading-6 text-shell-muted">
            Получение данных не начинает скачивание. Во вкладке «Видео» можно
            подготовить файл со звуком. Отдельное сохранение аудио и субтитров
            появится позже.
          </p>
        </ScrollReveal>
      </div>
    </main>
  );
}
