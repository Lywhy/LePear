import { landingPreviewTheme } from "@/lib/landing-preview-theme";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

import {
  Check,
  Code2,
  Moon,
  Palette,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { ThemePreview } from "@/components/theme-preview";
import { shellSwatches as themeColors } from "@/lib/shell-palette";

/** Illustration only: no focusable controls or editor state on the landing page. */
export function LandingPreview() {
  return (
    <ScrollReveal
      as="section"
      className="relative z-10 mx-auto -mt-28 w-[calc(100%-2rem)] max-w-290 sm:-mt-36 sm:w-[calc(100%-4rem)]"
      aria-label="Внешний вид редактора LePear"
    >
      <div
        role="img"
        aria-label="Макет редактора LePear: тёмная тема с янтарным акцентом, настройками цвета, шрифта и закругления"
        className="overflow-hidden rounded-lg border border-shell-line bg-shell-surface shadow-2xl shadow-black/40"
      >
        <div aria-hidden="true">
          <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 bg-shell-surface px-4 py-2 font-mono text-sm text-shell-muted">
            <span className="flex gap-1.5">
              <span className="size-1.5 rounded-full bg-shell-accent" />
              <span className="size-1.5 rounded-full bg-shell-dim" />
              <span className="size-1.5 rounded-full bg-shell-dim" />
            </span>
            <span className="flex items-center gap-2">
              <Palette size={14} />
              lepear / editor
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="size-1.5 rounded-full bg-shell-accent" />
              ПРЕДПРОСМОТР
            </span>
          </div>
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="grid gap-6 border-b border-white/10 p-5 text-sm text-shell-muted sm:grid-cols-2 lg:flex lg:flex-col lg:border-r lg:border-b-0">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4 font-medium text-shell-text sm:col-span-2">
                <SlidersHorizontal size={16} />
                Настройки темы
              </div>
              <div>
                <p className="mb-3">Режим</p>
                <div className="flex items-center rounded bg-shell-raised p-1">
                  <span className="flex flex-1 items-center justify-center gap-2 rounded bg-shell-hover px-2 py-2 text-shell-text">
                    <Moon size={14} />
                    Тёмный
                  </span>
                  <span className="flex flex-1 items-center justify-center gap-2 px-2 py-2">
                    <Sun size={14} />
                    Светлый
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-3">Акцентный цвет</p>
                <div className="flex flex-wrap gap-2.5">
                  {themeColors.map((color, i) => (
                    <span
                      key={color.name}
                      className={`grid size-7 place-items-center rounded-full text-shell-accent-ink ${color.className} ${i === 0 ? "outline outline-offset-3 outline-shell-accent" : ""}`}
                    >
                      {i === 0 && <Check size={17} />}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3">Шрифт</p>
                <div className="rounded border border-white/15 bg-shell-raised px-3 py-2.5 text-shell-text">
                  Geist
                </div>
              </div>
              <div>
                <p className="mb-3 flex justify-between">
                  Закругление<span>10 px</span>
                </p>
                <div className="relative my-5 h-1 rounded-full bg-shell-line">
                  <span className="absolute top-1/2 left-[42%] size-3 -translate-y-1/2 rounded-full bg-shell-accent" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Строго</span>
                  <span>Мягко</span>
                </div>
              </div>
            </div>
            <ThemePreview staticView theme={landingPreviewTheme} />
          </div>
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2 font-mono text-sm text-shell-muted">
            <span className="flex items-center gap-2">
              <Code2 size={14} />
              CSS variables
            </span>
            <span>Ваш стиль начинается с деталей.</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-shell-dim">
        Пример интерфейса. Все настройки доступны на отдельной странице
        редактора.
      </p>
    </ScrollReveal>
  );
}
