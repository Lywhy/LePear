import { AccentText } from "@/components/landing/marketing-text";
import { EditorLink } from "@/components/landing/shared";
import { Reveal } from "@/components/motion/reveal";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";
import TiltedCard from "@/components/react-bits/tilted-card";
import { ArrowDown, Check } from "lucide-react";
import { lazy, Suspense, useRef } from "react";

const Aurora = lazy(() => import("@/components/react-bits/aurora"));

export function LandingHero() {
  const scope = useRef<HTMLElement>(null);
  const animateBackground = useDecorativeMotion(scope);
  return (
    <section
      ref={scope}
      aria-labelledby="hero-title"
      className="relative isolate mx-2 overflow-hidden rounded-b-3xl bg-[#14241d] px-4 pt-10 pb-44 sm:mx-4 sm:px-8 sm:pt-14 sm:pb-52 lg:pt-16 lg:pb-56"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 bg-[url('/assets/lepear-landscape.webp')] bg-cover bg-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-85"
      >
        {animateBackground && (
          <Suspense fallback={null}>
            <Aurora
              colorStops={["#729b68", "#d3ed9a", "#72bca8"]}
              speed={0.35}
              amplitude={0.8}
              blend={0.7}
              height={0.6}
              brightness={1}
              layers={1}
              intro={false}
              mouseInteraction={false}
              dpr={1}
            />
          </Suspense>
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-linear-to-b from-[#07110d]/75 via-[#10231a]/65 to-[#0e100f]/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-5] bg-[radial-gradient(ellipse_at_50%_45%,rgba(7,17,13,0.8)_0%,rgba(7,17,13,0.35)_48%,transparent_75%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-3 text-sm leading-6 tracking-wide text-[#d5dfcb]">
            <span className="h-px w-8 bg-[#d3ed9a]" aria-hidden="true" />
            LEPEAR / ВАША ТЕМА
          </p>
          <Reveal>
            <h1
              id="hero-title"
              className="mt-6 font-[family-name:Arial_Black,Arial,sans-serif] text-[clamp(2.75rem,7.3vw,6.5rem)] leading-[1.02] font-black tracking-[-0.065em] text-[#f2f3ed] wrap-anywhere"
            >
              Ваш сайт.
              <br />
              Ваш
              <br />
              <AccentText text="характер." />
            </h1>
          </Reveal>
          <p className="mt-6 max-w-md text-base leading-8 text-[#e1e8d9] sm:text-lg">
            Цвет, шрифт и форма — не мелочи. Соберите из них свой визуальный
            язык и примерьте его на настоящие компоненты.
          </p>
          <Reveal className="mt-7 flex flex-wrap items-center gap-3">
            <EditorLink className="min-h-12 gap-2 rounded-lg px-5 text-base">
              Создать тему
            </EditorLink>
            <a
              href="#how-it-works"
              className={
                "inline-flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-base text-[#edf1e7] hover:text-[#d3ed9a] " +
                ui.focus
              }
            >
              Как это работает
              <ArrowDown size={18} aria-hidden="true" />
            </a>
          </Reveal>
          <ul
            aria-label="Возможности LePear"
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-[#d5dfcb]"
          >
            {["Без регистрации", "Локальные темы", "CSS и JSON"].map(
              (label) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Check
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-[#d3ed9a]"
                  />
                  {label}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="min-w-0 lg:pt-10">
          <TiltedCard
            effectsEnabled={animateBackground}
            className="relative rounded-2xl border border-[#d3ed9a]/30 bg-[#101810]/95 p-5 shadow-2xl shadow-black/30 sm:p-7"
          >
            <div className="flex flex-wrap justify-between gap-2 border-b border-white/15 pb-4 text-sm leading-6 text-[#b5c6a5]">
              <span>ЭТЮД № 01</span>
              <span>Forest / Dark</span>
            </div>
            <p
              aria-hidden="true"
              className="mt-6 font-[family-name:Arial_Black,Arial,sans-serif] text-[clamp(4.5rem,12vw,9rem)] leading-none font-black tracking-[-0.08em] text-[#edf1e7]"
            >
              Aa<span className="text-[#d3ed9a]">.</span>
            </p>
            <p className="mt-3 max-w-xs text-base leading-7 text-[#c5d1b9]">
              Знакомые компоненты.
              <br />
              Ваш собственный характер.
            </p>
            <div
              className="mt-7 grid grid-cols-4 gap-2"
              aria-label="Образец палитры: лесной, лаймовый, небесный и лавандовый"
            >
              {["#263720", "#d3ed9a", "#9fd6ef", "#c2b4ef"].map(
                (color, index) => (
                  <div key={color} className="min-w-0">
                    <span
                      className="block h-16 rounded-lg border border-white/15 sm:h-20"
                      style={{ backgroundColor: color }}
                    />
                    <span className="mt-2 block font-mono text-sm text-[#a8b69c]">
                      0{index + 1}
                    </span>
                  </div>
                ),
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-sm leading-6 text-[#b5c6a5]">
              <span>Цвет / Типографика / Форма</span>
              <span className="rounded-full border border-[#d3ed9a]/30 px-3 py-1 text-[#d3ed9a]">
                shadcn/ui
              </span>
            </div>
          </TiltedCard>
          <p className="mt-4 text-sm leading-6 text-[#d5dfcb]">
            Визуальный образец. Рабочие настройки — в редакторе.
          </p>
        </div>
      </div>
    </section>
  );
}
