import { Link } from "react-router-dom";
import { DecorativeBoundary } from "@/components/motion/decorative-boundary";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { shellColors } from "@/lib/shell-palette";
import { AccentText } from "@/components/landing/marketing-text";
import { EditorLink } from "@/components/landing/shared";
import { Reveal } from "@/components/motion/reveal";
import { useDecorativeMotionState } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";
import TiltedCard from "@/components/react-bits/tilted-card";
import { ArrowDown, Check } from "lucide-react";
import { lazy, Suspense, useRef } from "react";

const Aurora = lazy(() => import("@/components/react-bits/aurora"));

export function LandingHero() {
  const scope = useRef<HTMLElement>(null);
  const { supported: canShowAurora, active: animateBackground } =
    useDecorativeMotionState(scope);
  return (
    <section
      ref={scope}
      aria-labelledby="hero-title"
      className="relative isolate mx-2 overflow-hidden rounded-b-3xl bg-shell-surface px-4 pt-10 pb-44 sm:mx-4 sm:px-8 sm:pt-14 sm:pb-52 lg:pt-16 lg:pb-56"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 bg-[url('/assets/lepear-landscape.webp')] bg-cover bg-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-85"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,var(--shell-glow-teal),transparent_60%),radial-gradient(ellipse_at_80%_15%,var(--shell-glow-amber),transparent_65%)]" />
        {canShowAurora && (
          <DecorativeBoundary>
            <Suspense fallback={null}>
              <Aurora
                colorStops={[
                  shellColors["line"],
                  shellColors["accent"],
                  shellColors["teal"],
                ]}
                paused={!animateBackground}
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
          </DecorativeBoundary>
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-linear-to-b from-shell-deep/75 via-shell-surface/65 to-shell-background/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-5] bg-[radial-gradient(ellipse_at_50%_45%,var(--shell-hero-shade)_0%,var(--shell-hero-shade-soft)_48%,transparent_75%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-3 text-sm leading-6 tracking-wide text-shell-soft">
            <span className="h-px w-8 bg-shell-accent" aria-hidden="true" />
            LEPEAR / ВАША ТЕМА
          </p>
          <TextReveal
            as="h1"
            id="hero-title"
            className="mt-6 font-[family-name:Arial_Black,Arial,sans-serif] text-[clamp(2.75rem,7.3vw,6.5rem)] leading-[1.02] font-black tracking-[-0.065em] text-shell-text wrap-anywhere"
          >
            Ваш сайт.
            <br />
            Ваш
            <br />
            <AccentText text="характер." />
          </TextReveal>
          <TextReveal className="mt-6 max-w-md text-base leading-8 text-shell-soft sm:text-lg">
            Цвет, шрифт и форма — не мелочи. Соберите из них свой визуальный
            язык и примерьте его на настоящие компоненты.
          </TextReveal>
          <Reveal className="mt-7 flex flex-wrap items-center gap-3">
            <EditorLink className="min-h-12 gap-2 rounded-lg px-5 text-base">
              Создать тему
            </EditorLink>
            <Link
              to="/#how-it-works"
              className={
                "inline-flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-base text-shell-text hover:text-shell-accent " +
                ui.focus
              }
            >
              Как это работает
              <ArrowDown size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <ul
            aria-label="Возможности LePear"
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-shell-soft"
          >
            {["Без регистрации", "Локальные темы", "CSS и JSON"].map(
              (label) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Check
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-shell-accent"
                  />
                  {label}
                </li>
              ),
            )}
          </ul>
        </div>
        <ScrollReveal className="min-w-0 lg:pt-10" delay={0.12}>
          <TiltedCard
            effectsEnabled={animateBackground}
            className="relative rounded-2xl border border-shell-accent/30 bg-shell-deep/95 p-5 shadow-2xl shadow-black/30 sm:p-7"
          >
            <div className="flex flex-wrap justify-between gap-2 border-b border-white/15 pb-4 text-sm leading-6 text-shell-muted">
              <span>ЭТЮД № 01</span>
              <span>Sunset / Dark</span>
            </div>
            <p
              aria-hidden="true"
              className="mt-6 font-[family-name:Arial_Black,Arial,sans-serif] text-[clamp(4.5rem,12vw,9rem)] leading-none font-black tracking-[-0.08em] text-shell-text"
            >
              Aa<span className="text-shell-accent">.</span>
            </p>
            <TextReveal className="mt-3 max-w-xs text-base leading-7 text-shell-soft">
              Знакомые компоненты.
              <br />
              Ваш собственный характер.
            </TextReveal>
            <div
              className="mt-7 grid grid-cols-4 gap-2"
              aria-label="Образец палитры: тёмный коричневый, оранжевый, медный и персиковый"
            >
              {[
                shellColors["raised"],
                shellColors["accent"],
                shellColors["teal"],
                shellColors["sand"],
              ].map((color, index) => (
                <div key={color} className="min-w-0">
                  <span
                    className="block h-16 rounded-lg border border-white/15 sm:h-20"
                    style={{ backgroundColor: color }}
                  />
                  <span className="mt-2 block font-mono text-sm text-shell-dim">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-sm leading-6 text-shell-muted">
              <span>Цвет / Типографика / Форма</span>
              <span className="rounded-full border border-shell-accent/30 px-3 py-1 text-shell-accent">
                shadcn/ui
              </span>
            </div>
          </TiltedCard>
          <TextReveal className="mt-4 text-sm leading-6 text-shell-soft">
            Визуальный образец. Рабочие настройки — в редакторе.
          </TextReveal>
        </ScrollReveal>
      </div>
    </section>
  );
}
