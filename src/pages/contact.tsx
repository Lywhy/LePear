import { useRef, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Lightbulb,
  MessageCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/motion/reveal";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";

const topics = [
  {
    Icon: Lightbulb,
    title: "Новая возможность",
    text: "Что помогло бы вам быстрее собрать свою тему?",
  },
  {
    Icon: SlidersHorizontal,
    title: "Работа редактора",
    text: "Какой параметр или компонент стоит улучшить?",
  },
  {
    Icon: MessageCircle,
    title: "Вопрос о LePear",
    text: "Что осталось непонятным при знакомстве с проектом?",
  },
];

export default function ContactPage() {
  const scope = useRef<HTMLDivElement>(null);
  const effectsEnabled = useDecorativeMotion(scope);
  return (
    <main className={ui.container + " py-10 sm:py-16 lg:py-20"}>
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 xl:gap-20">
        <div ref={scope} className="min-w-0 lg:sticky lg:top-8">
          <Reveal>
            <p className={ui.eyebrow}>ЕСТЬ ИДЕЯ?</p>
            <h1 className={"mt-4 " + ui.heroTitle}>
              LePear начинается
              <br />
              <span className="text-[#d3ed9a]">с ваших идей.</span>
            </h1>
            <p className={"mt-5 max-w-lg " + ui.body}>
              Расскажите, чего вам не хватает в редакторе, задайте вопрос или
              предложите новый взгляд на привычные настройки.
            </p>
          </Reveal>
          <Reveal className="mt-7">
            <SpotlightCard
              effectsEnabled={effectsEnabled}
              spotlightColor="#d3ed9a"
              intensity={0.12}
              borderGlow={0.5}
              proximity={32}
              smoothing={0.2}
              ambient={false}
              flare={false}
              className="rounded-2xl p-5 sm:p-6"
              style={
                {
                  "--spotlight-card-surface": "#171c17",
                  "--spotlight-card-border": "rgba(211,237,154,0.16)",
                } as CSSProperties
              }
            >
              <h2 className="text-lg leading-7 font-medium">
                О чём можно рассказать
              </h2>
              <ul className="mt-5 space-y-5">
                {topics.map(({ Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#22291e] text-[#d3ed9a]">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base leading-7 font-medium">{title}</p>
                      <p className={ui.caption}>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>
          <p className={"mt-5 max-w-lg " + ui.caption}>
            Сейчас доступен предпросмотр формы. Сообщения не отправляются, канал
            обратной связи ещё не подключён.
          </p>
          <Link
            to="/editor"
            className={
              "mt-3 inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-base leading-7 text-[#d3ed9a] hover:text-[#edf1e7] " +
              ui.focus
            }
          >
            Вернуться к своей теме
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <Reveal className="min-w-0">
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
