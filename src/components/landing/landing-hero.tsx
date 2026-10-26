import { Link } from "react-router-dom";
import { DecorativeBoundary } from "@/components/motion/decorative-boundary";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { shellColors } from "@/lib/shell-palette";
import { AccentText } from "@/components/landing/marketing-text";
import { Reveal } from "@/components/motion/reveal";
import { useDecorativeMotionState } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";
import TiltedCard from "@/components/react-bits/tilted-card";
import { ArrowDown, Check, Palette, Video, RefreshCw } from "lucide-react";
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
            LEPEAR / ВАШИ ИНСТРУМЕНТЫ
          </p>
          <TextReveal
            as="h1"
            id="hero-title"
            className="mt-6 font-[Arial_Black,Arial,sans-serif] text-[clamp(2.75rem,7.3vw,6.5rem)] leading-[1.02] font-black tracking-[-0.065em] text-shell-text wrap-anywhere"
          >
            Для идей.
            <br />
            Для файлов.
            <br />
            <AccentText text="Для вас." />
          </TextReveal>
          <TextReveal className="mt-6 max-w-md text-base leading-8 text-shell-soft sm:text-lg">
            Оформите сайт, скачайте видео с YouTube или измените формат музыки и
            изображений. Нужные инструменты — в одном месте.
          </TextReveal>
          <Reveal className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/#features"
              className={
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-shell-accent px-5 py-3 text-base font-medium text-shell-accent-ink transition-colors hover:bg-shell-accent-hover motion-reduce:transition-none " +
                ui.focus
              }
            >
              Выбрать инструмент
            </Link>
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
            {["Редактор тем", "YouTube", "Конвертер"].map((label) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Check
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 text-shell-accent"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <ScrollReveal className="min-w-0 lg:pt-10" delay={0.12}>
          <TiltedCard
            effectsEnabled={animateBackground}
            className="relative rounded-2xl border border-shell-accent/30 bg-shell-deep/95 p-5 shadow-2xl shadow-black/30 sm:p-7"
          >
            <div className="flex flex-wrap justify-between gap-2 pb-4 text-sm leading-6 text-shell-muted">
              <span>ВАШ РАБОЧИЙ НАБОР</span>
              <span>LePear / 01—03</span>
            </div>
            <TextReveal
              as="h2"
              className="mt-6 font-[Arial_Black,Arial,sans-serif] text-3xl leading-tight font-black tracking-tight sm:text-4xl"
            >
              Один сайт.
              <br />
              <span className="text-shell-accent">Разные задачи.</span>
            </TextReveal>
            <div className="mt-6 space-y-3">
              {[
                {
                  Icon: Palette,
                  name: "Редактор тем",
                  detail: "Цвет · Шрифт · Форма",
                  index: "01",
                },
                {
                  Icon: Video,
                  name: "YouTube",
                  detail: "Видео · Аудио · Субтитры",
                  index: "02",
                },
                {
                  Icon: RefreshCw,
                  name: "Конвертер",
                  detail: "Музыка · Изображения",
                  index: "03",
                },
              ].map((tool) => (
                <div
                  key={tool.index}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-shell-raised/60 p-4"
                >
                  <tool.Icon
                    className="size-5 shrink-0 text-shell-accent"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-shell-text">
                      {tool.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-shell-muted">
                      {tool.detail}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-shell-dim">
                    {tool.index}
                  </span>
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="mt-6 flex gap-2">
              {[
                shellColors["raised"],
                shellColors["accent"],
                shellColors["teal"],
                shellColors["sand"],
              ].map((color) => (
                <span
                  key={color}
                  className="h-3 min-w-0 flex-1 rounded-full border border-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-shell-muted">
              Оформляйте. Скачивайте. Преобразуйте.
            </p>
          </TiltedCard>
          <TextReveal className="mt-4 text-sm leading-6 text-shell-soft">
            Выберите задачу — у каждого инструмента своя страница.
          </TextReveal>
        </ScrollReveal>
      </div>
    </section>
  );
}
