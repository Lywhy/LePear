import { motion, useReducedMotion } from "motion/react";

import {
  Check,
  Code2,
  Moon,
  Palette,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { ThemePreview } from "@/components/theme-preview";
import { themeColors } from "@/lib/site-theme";

/** Illustration only: no focusable controls or editor state on the landing page. */
export function LandingPreview() {
  const reduced = useReducedMotion();
  return (
    <motion.section
      initial={false}
      whileInView={
        reduced !== false
          ? { y: 0, opacity: 1 }
          : { y: [24, 0], opacity: [0.82, 1] }
      }
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reduced !== false ? 0 : 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative z-10 mx-auto -mt-28 w-[calc(100%-2rem)] max-w-290 sm:-mt-36 sm:w-[calc(100%-4rem)]"
      aria-label="Внешний вид редактора LePear"
    >
      <div
        role="img"
        aria-label="Макет редактора LePear: тёмная тема с лаймовым акцентом, настройками цвета, шрифта и закругления"
        className="overflow-hidden rounded-lg border border-[#5b6e48] bg-[#141813] shadow-2xl shadow-black/40"
      >
        <div aria-hidden="true">
          <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 bg-[#191e17] px-4 py-2 font-mono text-sm text-[#b6c4a8]">
            <span className="flex gap-1.5">
              <span className="size-1.5 rounded-full bg-[#b1c789]" />
              <span className="size-1.5 rounded-full bg-[#626d56]" />
              <span className="size-1.5 rounded-full bg-[#626d56]" />
            </span>
            <span className="flex items-center gap-2">
              <Palette size={14} />
              lepear / editor
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="size-1.5 rounded-full bg-[#d3ed9a]" />
              ПРЕДПРОСМОТР
            </span>
          </div>
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="grid gap-6 border-b border-white/10 p-5 text-sm text-[#bdc9b2] sm:grid-cols-2 lg:flex lg:flex-col lg:border-r lg:border-b-0">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4 font-medium text-[#e8eedf] sm:col-span-2">
                <SlidersHorizontal size={16} />
                Настройки темы
              </div>
              <div>
                <p className="mb-3">Режим</p>
                <div className="flex items-center rounded bg-[#22291d] p-1">
                  <span className="flex flex-1 items-center justify-center gap-2 rounded bg-[#36412a] px-2 py-2 text-[#e8eedf]">
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
                      className={`grid size-7 place-items-center rounded-full text-[#1a2115] ${color.className} ${i === 0 ? "outline outline-offset-3 outline-[#d3ed9a]" : ""}`}
                    >
                      {i === 0 && <Check size={17} />}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3">Шрифт</p>
                <div className="rounded border border-white/15 bg-[#22291d] px-3 py-2.5 text-[#e8eedf]">
                  Geist
                </div>
              </div>
              <div>
                <p className="mb-3 flex justify-between">
                  Закругление<span>10 px</span>
                </p>
                <div className="relative my-5 h-1 rounded-full bg-[#546445]">
                  <span className="absolute top-1/2 left-[42%] size-3 -translate-y-1/2 rounded-full bg-[#d3ed9a]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Строго</span>
                  <span>Мягко</span>
                </div>
              </div>
            </div>
            <ThemePreview staticView />
          </div>
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2 font-mono text-sm text-[#b6c4a8]">
            <span className="flex items-center gap-2">
              <Code2 size={14} />
              CSS variables
            </span>
            <span>Ваш стиль начинается с деталей.</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#a7b69a]">
        Пример интерфейса. Все настройки доступны на отдельной странице
        редактора.
      </p>
    </motion.section>
  );
}
