import { TextReveal } from "@/components/motion/text-reveal";
import { useShellPalette } from "@/lib/shell-settings";
import { useRef, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { RevealText } from "@/components/landing/marketing-text";
import { ContactForm } from "@/components/contact-form";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";

const topics = [
  {
    title: "Новая возможность",
    text: "Что помогло бы вам быстрее собрать свою тему?",
  },
  {
    title: "Работа редактора",
    text: "Какой параметр или компонент стоит улучшить?",
  },
  {
    title: "Вопрос о LePear",
    text: "Что осталось непонятным при знакомстве с проектом?",
  },
];

export default function ContactPage() {
  const shellColors = useShellPalette();
  const scope = useRef<HTMLDivElement>(null);
  const effectsEnabled = useDecorativeMotion(scope);
  return (
    <main className={ui.container + " py-10 sm:py-16 lg:py-20"}>
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 xl:gap-20">
        <div ref={scope} className="min-w-0 lg:sticky lg:top-8">
          <div>
            <p className={ui.eyebrow}>03 / ОБРАТНАЯ СВЯЗЬ</p>
            <h1 className={"mt-4 " + ui.heroTitle}>
              <RevealText text="Ваши идеи." />
              <br />
              <span className="text-shell-accent">
                <RevealText text="Новый взгляд." />
              </span>
            </h1>
            <TextReveal className={"mt-5 max-w-lg " + ui.body}>
              Расскажите, чего вам не хватает в редакторе, задайте вопрос или
              предложите новый взгляд на привычные настройки.
            </TextReveal>
          </div>
          <ScrollReveal className="mt-7">
            <SpotlightCard
              effectsEnabled={effectsEnabled}
              spotlightColor={shellColors["accent"]}
              intensity={0.12}
              borderGlow={0.5}
              proximity={32}
              smoothing={0.2}
              ambient={false}
              flare={false}
              className="rounded-2xl p-5 sm:p-7"
              style={
                {
                  "--spotlight-card-surface": shellColors["surface"],
                  "--spotlight-card-border": shellColors["spotlight-border"],
                } as CSSProperties
              }
            >
              <TextReveal as="h2" className="text-lg leading-7 font-medium">
                О чём можно рассказать
              </TextReveal>
              <ul className="mt-5 space-y-5">
                {topics.map(({ title, text }) => (
                  <li key={title} className="flex items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-base leading-7 font-medium">{title}</p>
                      <p className={ui.caption}>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </ScrollReveal>
          <TextReveal className={"mt-5 max-w-lg " + ui.caption}>
            Сейчас доступен предпросмотр формы. Сообщения не отправляются, канал
            обратной связи ещё не подключён.
          </TextReveal>
          <Link
            to="/editor"
            className={
              "mt-3 inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-base leading-7 text-shell-accent hover:text-shell-text " +
              ui.focus
            }
          >
            Вернуться к своей теме
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ScrollReveal className="min-w-0">
          <ContactForm />
        </ScrollReveal>
      </div>
    </main>
  );
}
