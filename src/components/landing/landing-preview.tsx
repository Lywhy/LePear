import { ScrollReveal } from "@/components/motion/scroll-reveal";

/** Static illustrations only; all tools live on their dedicated pages. */
export function LandingPreview() {
  return (
    <ScrollReveal
      as="section"
      className="relative z-10 mx-auto -mt-28 w-[calc(100%-2rem)] max-w-290 sm:-mt-36 sm:w-[calc(100%-4rem)]"
      aria-label="Примеры трёх инструментов LePear"
    >
      <div className="overflow-hidden rounded-2xl border border-shell-line bg-shell-deep shadow-2xl shadow-black/40">
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm leading-6 text-shell-muted">
          <span className="font-mono">LEPEAR / ВОЗМОЖНОСТИ</span>
          <span>Три инструмента. Одна оболочка.</span>
        </div>
        <div className="grid divide-y divide-shell-divider/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div
            role="img"
            aria-label="Пример редактора: цветовая палитра и типографика"
            className="min-w-0 bg-shell-surface p-5 sm:p-6"
          >
            <div aria-hidden="true">
              <p className="flex items-center gap-2 text-base font-medium text-shell-soft">
                Редактор тем
              </p>
              <p className="mt-6 font-[family-name:Arial_Black,Arial,sans-serif] text-5xl font-black tracking-tight text-shell-text">
                Aa<span className="text-shell-accent">.</span>
              </p>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[
                  "bg-shell-raised",
                  "bg-shell-accent",
                  "bg-shell-teal",
                  "bg-shell-sand",
                ].map((color) => (
                  <span
                    key={color}
                    className={
                      "h-10 rounded-lg border border-shell-divider/15 " + color
                    }
                  />
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-shell-muted">
                Свой стиль → CSS и JSON
              </p>
            </div>
          </div>
          <div
            role="img"
            aria-label="Пример YouTube: выбор видео, аудио или субтитров"
            className="min-w-0 bg-shell-surface p-5 sm:p-6"
          >
            <div aria-hidden="true">
              <p className="flex items-center gap-2 text-base font-medium text-shell-soft">
                YouTube
              </p>
              <div className="mt-6 flex h-24 items-center justify-center rounded-xl border border-shell-accent/20 bg-linear-to-br from-shell-hover to-shell-deep">
                <span className="font-mono text-sm tracking-[0.2em] text-shell-accent">
                  YOUTUBE
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm leading-6">
                {["Видео", "Аудио", "Субтитры"].map((mode) => (
                  <span
                    key={mode}
                    className="min-w-0 rounded-md border border-shell-divider/10 bg-shell-raised px-1 py-2 text-center break-words text-shell-soft"
                  >
                    {mode}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-shell-muted">
                Одна ссылка → нужный формат
              </p>
            </div>
          </div>
          <div
            role="img"
            aria-label="Пример конвертера: MP3 в WAV и PNG в WebP"
            className="min-w-0 bg-shell-surface p-5 sm:p-6"
          >
            <div aria-hidden="true">
              <p className="flex items-center gap-2 text-base font-medium text-shell-soft">
                Конвертер
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { from: "MP3", to: "WAV" },
                  { from: "PNG", to: "WebP" },
                ].map((sample) => (
                  <div
                    key={sample.from}
                    className="grid grid-cols-3 items-center justify-items-center gap-2 rounded-xl border border-shell-divider/10 bg-shell-raised px-3 py-4 font-mono text-base"
                  >
                    <span className="text-shell-soft">{sample.from}</span>
                    <span aria-hidden="true" className="text-shell-dim">
                      →
                    </span>
                    <span className="text-shell-accent">{sample.to}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-shell-muted">
                Ваш файл → совместимый формат
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-shell-dim">
        Статичные примеры. Работа с темами, ссылками и файлами — на страницах
        инструментов.
      </p>
    </ScrollReveal>
  );
}
