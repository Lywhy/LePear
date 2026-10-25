import { EditorLink } from "@/components/landing/shared";
import { Reveal } from "@/components/motion/reveal";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";
import { Check } from "lucide-react";
import { lazy, Suspense, useRef } from "react";

const Aurora = lazy(() => import("@/components/react-bits/aurora"));

export function LandingHero() {
  const scope = useRef<HTMLElement>(null);
  const animateBackground = useDecorativeMotion(scope);
  return (
    <section
      ref={scope}
      aria-labelledby="hero-title"
      className="relative isolate mx-2 overflow-hidden rounded-b-3xl bg-[#14241d] px-4 pt-12 pb-48 text-center sm:mx-4 sm:px-8 sm:pt-16 sm:pb-60 lg:pt-20 lg:pb-64"
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
      <div className="mx-auto max-w-4xl">
        <p className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#d3ed9a]/25 bg-[#14241d]/80 px-4 py-2 text-sm leading-6 text-[#e1ebd4]">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-[#d3ed9a]"
          />
          Визуальный редактор тем на shadcn/ui
        </p>
        <Reveal>
          <h1
            id="hero-title"
            className="mt-6 text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.04] font-medium tracking-[-0.055em] text-[#f2f3ed] wrap-anywhere sm:mt-8"
          >
            Ваш сайт.
            <br />
            <span className="text-[#d3ed9a]">Ваш характер.</span>
          </h1>
        </Reveal>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#e1e8d9] sm:text-lg sm:leading-8">
          Подбирайте цвета, шрифты и форму компонентов.
          <br className="hidden sm:block" /> Смотрите результат сразу и
          переносите готовую тему в свой проект.
        </p>
        <Reveal className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <EditorLink className="min-h-12 gap-2 rounded-lg px-5 text-base">
            Создать тему
          </EditorLink>
          <a
            href="#how-it-works"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 bg-[#102016]/60 px-5 py-3 text-base text-[#edf1e7] hover:bg-[#182b1e]/80 ${ui.focus}`}
          >
            Как это работает
          </a>
        </Reveal>
        <ul
          aria-label="Возможности LePear"
          className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-x-5 gap-y-2 text-sm leading-6 text-[#d5dfcb]"
        >
          {[
            "Без регистрации",
            "Темы в вашем браузере",
            "Экспорт CSS и JSON",
          ].map((label) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Check
                size={14}
                aria-hidden="true"
                className="shrink-0 text-[#d3ed9a]"
              />
              {label}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-6 text-[#d5dfcb]">
          Ниже — пример оформления. Все настройки доступны в редакторе.
        </p>
      </div>
    </section>
  );
}
