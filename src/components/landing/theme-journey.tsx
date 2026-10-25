import { Code2, Layers3, Palette, Type, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { RevealText } from "@/components/landing/marketing-text";
import { designClasses as ui } from "@/lib/design-system";

const stages = [
  {
    Icon: Palette,
    number: "01",
    title: "Сначала — настроение.",
    text: "Две независимые палитры и собственный акцент.",
    color: "#d3ed9a",
    visual: "palette",
  },
  {
    Icon: Type,
    number: "02",
    title: "Потом — голос.",
    text: "Шрифт, насыщенность и ритм текста.",
    color: "#9fd6ef",
    visual: "type",
  },
  {
    Icon: Layers3,
    number: "03",
    title: "И всё складывается.",
    text: "Оцените сочетание на настоящих компонентах.",
    color: "#c2b4ef",
    visual: "components",
  },
  {
    Icon: Code2,
    number: "04",
    title: "Остаётся забрать.",
    text: "CSS для проекта. JSON для следующей идеи.",
    color: "#d3ed9a",
    visual: "code",
  },
];
export function ThemeJourney() {
  const reduced = useReducedMotion();
  return (
    <section
      className={ui.container + " relative py-16 sm:py-24"}
      aria-labelledby="journey-title"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <p className={ui.eyebrow}>ОДНА ИДЕЯ / ЧЕТЫРЕ ШАГА</p>
          <h2 id="journey-title" className={"mt-4 " + ui.sectionTitle}>
            <RevealText text="От ощущения —" />
            <br />
            <span className="text-[#d3ed9a]">
              <RevealText text="к целому интерфейсу." />
            </span>
          </h2>
        </div>
        <p className={"max-w-lg self-end " + ui.body}>
          Цвет подсказывает шрифт, шрифт меняет ритм, детали собираются в
          систему. В LePear эти решения видны вместе.
        </p>
      </div>
      <div className="relative mt-10 grid min-w-0 gap-6 md:mt-14 md:grid-cols-2 lg:gap-x-12 lg:gap-y-0">
        <svg
          viewBox="0 0 1000 650"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block"
        >
          <path
            d="M240 90 H490 Q520 90 520 120 V200 Q520 230 550 230 H760 M760 230 V410 Q760 440 730 440 H270 M270 440 V560 Q270 590 300 590 H760"
            fill="none"
            stroke="#41513a"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <motion.path
            d="M240 90 H490 Q520 90 520 120 V200 Q520 230 550 230 H760 M760 230 V410 Q760 440 730 440 H270 M270 440 V560 Q270 590 300 590 H760"
            fill="none"
            stroke="#d3ed9a"
            strokeWidth="2"
            strokeDasharray="24 1000"
            initial={false}
            whileInView={
              reduced !== false
                ? { strokeDashoffset: 0 }
                : { strokeDashoffset: [1000, 0] }
            }
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: reduced !== false ? 0 : 3,
              ease: "easeInOut",
            }}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {stages.map((stage, index) => (
          <ScrollReveal
            key={stage.number}
            delay={index * 0.08}
            className={
              "relative min-w-0 " + (index % 2 ? "lg:mt-24" : "lg:mb-16")
            }
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="grid size-12 place-items-center rounded-full border border-white/20 bg-[#151c14] shadow-[0_0_30px_rgba(149,180,103,0.08)]"
                style={{ color: stage.color }}
              >
                <stage.Icon size={22} aria-hidden="true" />
              </span>
              <span className="font-mono text-sm text-[#9bab90]">
                {stage.number} / LEPEAR
              </span>
            </div>
            <article className="relative isolate min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-linear-to-b from-[#293025] via-[#171d16] to-[#111610] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_60px_rgba(0,0,0,0.18)] sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-12 -z-10 size-48 rounded-full opacity-10 blur-3xl"
                style={{ background: stage.color }}
              />
              <div
                aria-hidden="true"
                className="mb-6 flex min-h-28 items-center rounded-xl border border-white/10 bg-[#0b100c]/65 p-4"
              >
                {stage.visual === "palette" && (
                  <div className="flex w-full gap-2">
                    {["#263720", "#d3ed9a", "#9fd6ef", "#c2b4ef"].map(
                      (color, i) => (
                        <motion.span
                          key={color}
                          className="block h-16 flex-1 rounded-lg border border-white/15"
                          style={{ background: color }}
                          initial={false}
                          whileInView={
                            reduced !== false ? { y: 0 } : { y: [8 + i * 3, 0] }
                          }
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.6,
                            delay: reduced !== false ? 0 : i * 0.08,
                          }}
                        />
                      ),
                    )}
                  </div>
                )}
                {stage.visual === "type" && (
                  <div className="flex w-full flex-wrap items-baseline justify-between gap-3">
                    <span className="font-[family-name:Arial_Black,Arial,sans-serif] text-5xl font-black tracking-tight text-[#e1edce]">
                      Aa
                    </span>
                    <span className="font-serif text-5xl text-[#9fd6ef]">
                      Бб
                    </span>
                    <span className="text-sm text-[#a8b69c]">16 px / 1.6</span>
                  </div>
                )}
                {stage.visual === "components" && (
                  <div className="w-full space-y-3">
                    <div className="h-2 w-2/3 rounded-full bg-[#596747]" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#c2b4ef] px-3 py-2 text-sm text-[#1b1824]">
                        <Check size={14} />
                        Свой стиль
                      </span>
                      <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-[#c5d1b9]">
                        shadcn/ui
                      </span>
                    </div>
                  </div>
                )}
                {stage.visual === "code" && (
                  <div className="w-full space-y-2 font-mono text-sm leading-6">
                    <p className="text-[#9bab90]">:root &#123;</p>
                    <p className="pl-4 text-[#d3ed9a]">--primary: #d3ed9a;</p>
                    <p className="text-[#9bab90]">
                      &#125;{" "}
                      <span className="float-right text-[#c5d1b9]">
                        CSS + JSON
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <h3 className="text-xl leading-7 font-medium text-[#edf1e7]">
                {stage.title}
              </h3>
              <p className={"mt-3 " + ui.body}>{stage.text}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
