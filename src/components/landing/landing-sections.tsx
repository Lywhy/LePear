import { TextReveal } from "@/components/motion/text-reveal";
import { shellSwatches } from "@/lib/shell-palette";
import { useShellPalette } from "@/lib/shell-settings";
import { AccentText, RevealText } from "@/components/landing/marketing-text";
import { Kicker } from "@/components/landing/shared";
import CountUp from "@/components/react-bits/count-up";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { designClasses as ui } from "@/lib/design-system";
import { converterFormats } from "@/lib/converter-formats";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const section = ui.container + " scroll-mt-8 py-16 sm:py-20 lg:py-24";
const tools = [
  {
    id: "theme",
    number: "01",
    label: "СТИЛЬ",
    title: "Сайт с вашим характером",
    text: "Соберите палитру, подберите шрифт и настройте форму компонентов. Примерьте тему в редакторе, сохраните её и заберите CSS или JSON.",
    action: "Открыть редактор",
    to: "/editor",
    detail: "Цвета · Типографика · Размеры",
  },
  {
    id: "youtube",
    number: "02",
    label: "МЕДИА",
    title: "Из ссылки — в ваш файл",
    text: "Вставьте ссылку на YouTube. Выберите видео со звуком, только аудио или доступные субтитры — и скачайте то, что нужно.",
    action: "Перейти к YouTube",
    to: "/youtube",
    detail: "Видео · Аудио · Субтитры",
  },
  {
    id: "converter",
    number: "03",
    label: "ФОРМАТЫ",
    title: "Тот же файл. Новые возможности",
    text: "Преобразуйте музыку или изображение. Список форматов подстроится под исходник: от MP3 и FLAC до PNG, JPEG и WebP.",
    action: "Открыть конвертер",
    to: "/converter",
    detail: "Музыка · Изображения",
  },
];
const steps = [
  {
    number: "01",
    title: "Выберите задачу",
    text: "Откройте редактор для оформления сайта, YouTube для скачивания или конвертер для смены формата файла.",
  },
  {
    number: "02",
    title: "Задайте нужный результат",
    text: "Настройте тему, вставьте ссылку или выберите файл. Инструмент покажет доступные параметры — работа начнётся по вашей команде.",
  },
  {
    number: "03",
    title: "Заберите и используйте",
    text: "Экспортируйте тему в CSS/JSON или скачайте готовый файл. Темы можно сохранить в браузере, а медиафайлы доступны ограниченное время.",
  },
];
const faqs = [
  {
    id: "product",
    question: "Что можно делать в LePear?",
    answer:
      "Здесь три инструмента: редактор оформления сайта на shadcn/ui, скачивание видео, аудио и субтитров YouTube и конвертер музыки и изображений. Каждый работает на своей странице. На главной показаны только статичные примеры.",
  },
  {
    id: "formats",
    question: "Какие файлы можно конвертировать?",
    answer:
      "Аудио: MP3, WAV, FLAC, OGG, M4A и AAC. Статичные изображения: PNG, JPEG, WebP и BMP. После выбора файла появятся выходные форматы из его категории. Документы, видео и анимированные изображения в конвертере пока не поддерживаются. Лимиты размера, длительности и разрешения указаны на его странице.",
  },
  {
    id: "quality",
    question: "Конвертация улучшает качество?",
    answer:
      "Нет: переход из MP3 в WAV не восстановит потерянные детали. WAV может быть значительно больше исходника; MP3, OGG и AAC используют сжатие с потерями. PNG и WebP сохраняют прозрачность, а при переводе в JPEG или BMP она заменяется белым фоном.",
  },
  {
    id: "youtube",
    question: "Что доступно по ссылке YouTube?",
    answer:
      "Видео со звуком, отдельная аудиодорожка, в том числе MP3, и субтитры VTT/SRT, если они есть у ролика. Доступные качество, языки и дорожки появятся после получения данных. YouTube может ограничивать доступ или частоту запросов — в таком случае инструмент покажет объяснение.",
  },
  {
    id: "storage",
    question: "Где хранятся темы и файлы?",
    answer:
      "Рабочая тема и до 20 именованных копий хранятся в этом браузере. Для резервной копии и переноса скачайте JSON. Файлы YouTube и конвертера хранятся временно в локальном сервисе обработки, а затем удаляются. Срок доступности указан в инструменте; важные результаты сохраните на устройство.",
  },
  {
    id: "server",
    question: "Нужна ли регистрация и что требуется для работы?",
    answer:
      "Аккаунт LePear не нужен. Редактор работает в браузере. Для YouTube и конвертации нужен запущенный локальный сервис обработки с установленными инструментами. Если он недоступен, страница объяснит, что делать. Активные задания при уходе со страницы отменяются; автоматического возобновления нет.",
  },
  {
    id: "theme",
    question: "Как использовать созданную тему на сайте?",
    answer:
      "В редакторе скачайте CSS для shadcn/ui и Tailwind CSS v4 и подключите его по инструкции экспорта. Для продолжения работы в LePear используйте JSON. Светлая и тёмная палитры независимы; шрифты и размещение порталов меню/диалогов подключаются в вашем проекте отдельно.",
  },
];
function FeatureVisual({ kind }: { kind: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-64 flex-col justify-center bg-shell-deep/60 p-6 sm:p-7"
    >
      {kind === "theme" ? (
        <>
          <p className="font-[family-name:Arial_Black,Arial,sans-serif] text-6xl leading-none font-black tracking-[-0.06em] text-shell-text">
            Aa<span className="text-shell-accent">.</span>
          </p>
          <div className="mt-5 flex gap-2">
            {shellSwatches.map((color) => (
              <span
                key={color.name}
                className={
                  "h-10 min-w-0 flex-1 rounded-lg border border-shell-divider/15 " +
                  color.className
                }
              />
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-shell-muted">
            Палитра + шрифт + форма
          </p>
        </>
      ) : kind === "youtube" ? (
        <>
          <div className="flex h-24 items-center justify-center rounded-xl border border-shell-accent/25 bg-linear-to-br from-shell-hover to-shell-surface">
            <span className="font-mono text-sm tracking-[0.2em] text-shell-accent">
              YOUTUBE
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm leading-6">
            {["Видео", "Аудио", "Субтитры"].map((label) => (
              <span
                key={label}
                className="min-w-0 rounded-lg border border-shell-divider/15 bg-shell-raised px-1 py-2 text-center break-words text-shell-soft"
              >
                {label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            {[
              { from: "MP3", to: "WAV" },
              { from: "PNG", to: "WebP" },
            ].map((sample) => (
              <div
                key={sample.from}
                className="grid grid-cols-3 items-center justify-items-center gap-3 rounded-xl border border-shell-divider/10 bg-shell-raised px-4 py-4 font-mono text-lg"
              >
                <span className="text-shell-muted">{sample.from}</span>
                <ArrowRight className="size-5 text-shell-dim" />
                <span className="text-shell-accent">{sample.to}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-shell-muted">
            Форматы под выбранный файл
          </p>
        </>
      )}
    </div>
  );
}
export function LandingFeatures() {
  const shellColors = useShellPalette();
  const reduced = useReducedMotion();
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className={"scroll-mt-24 " + section}
    >
      <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <Kicker>ОДНО МЕСТО ДЛЯ РАЗНЫХ ЗАДАЧ</Kicker>
          <h2 id="features-title" className={"mt-4 " + ui.sectionTitle}>
            <RevealText text="Что сделаем" />
            <br />
            <span className="text-shell-dim">
              <RevealText text="сегодня?" />
            </span>
          </h2>
        </div>
        <TextReveal className={ui.body + " max-w-lg"}>
          Оформить сайт, сохранить медиа или подготовить файл к следующему
          проекту. Выберите свой инструмент — всё остальное уже под рукой.
        </TextReveal>
      </div>
      <div className={ui.grid + " lg:grid-cols-3"}>
        {tools.map((tool, index) => (
          <ScrollReveal
            key={tool.id}
            delay={index * 0.08}
            className="h-full min-w-0"
          >
            <SpotlightCard
              role="article"
              aria-labelledby={"feature-" + tool.id}
              effectsEnabled={reduced === false}
              spotlightColor={shellColors["accent"]}
              intensity={0.2}
              borderGlow={0.8}
              proximity={48}
              smoothing={0.2}
              ambient={false}
              flare={false}
              className="grid h-full min-w-0 grid-rows-[16rem_1fr] p-0 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-shell-accent"
              style={
                {
                  "--spotlight-card-surface": shellColors["surface"],
                  "--spotlight-card-border": shellColors["spotlight-border"],
                } as CSSProperties
              }
            >
              <FeatureVisual kind={tool.id} />
              <div className="flex flex-col p-6 sm:p-7">
                <p className="flex items-center justify-between gap-3 text-sm leading-6 text-shell-muted">
                  <span>
                    {tool.number} / {tool.label}
                  </span>
                </p>
                <TextReveal
                  as="h3"
                  id={"feature-" + tool.id}
                  className={"mt-4 " + ui.cardTitle}
                >
                  {tool.title}
                </TextReveal>
                <TextReveal className={"mt-3 flex-1 " + ui.body}>
                  {tool.text}
                </TextReveal>
                <p className={"mt-4 " + ui.caption}>{tool.detail}</p>
                <Link
                  to={tool.to}
                  className={
                    "mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded text-base text-shell-accent hover:text-shell-accent-hover " +
                    ui.focus
                  }
                >
                  {tool.action}
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-shell-divider/10 bg-shell-deep px-5 py-4 text-sm leading-6 text-shell-muted">
        {[
          "Без аккаунта LePear",
          "Отдельная страница для каждой задачи",
          "Темы в браузере, медиа — через локальный сервис",
        ].map((text) => (
          <p key={text} className="flex items-start gap-2">
            {text}
          </p>
        ))}
      </ScrollReveal>
    </section>
  );
}
export function LandingWorkflow() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="workflow-title"
      className={section + " scroll-mt-24"}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Kicker>ОТ ЗАДАЧИ К РЕЗУЛЬТАТУ</Kicker>
          <TextReveal
            as="h2"
            id="workflow-title"
            className={"mt-4 " + ui.sectionTitle}
          >
            Выберите.
            <br />
            <span className="text-shell-dim">Сделайте. Заберите.</span>
          </TextReveal>
          <TextReveal className={"mt-5 max-w-md " + ui.body}>
            Без единого сложного рабочего окна. У каждого инструмента свой
            понятный сценарий и нужные именно ему настройки.
          </TextReveal>
          <Link
            to="/#features"
            className={
              "mt-6 inline-flex min-h-12 items-center gap-3 rounded-lg bg-shell-accent px-5 py-3 text-base font-medium text-shell-accent-ink hover:bg-shell-accent-hover " +
              ui.focus
            }
          >
            К инструментам
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ol className="min-w-0">
          {steps.map((step, index) => (
            <li key={step.number} className="min-w-0">
              <ScrollReveal
                delay={index * 0.05}
                className="grid grid-cols-[3rem_1fr] gap-4 py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
              >
                <span className="font-[family-name:Arial_Black,Arial,sans-serif] text-4xl leading-none font-black tracking-tight text-shell-accent/65 sm:text-5xl">
                  {step.number}
                </span>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <TextReveal
                      as="h3"
                      className="text-xl leading-7 font-medium text-shell-text"
                    >
                      {step.title}
                    </TextReveal>
                  </div>
                  <TextReveal className={"mt-3 max-w-lg " + ui.body}>
                    {step.text}
                  </TextReveal>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
export function LandingFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className={
        section +
        " scroll-mt-24 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
      }
    >
      <div>
        <Kicker>ХОРОШИЙ ВОПРОС</Kicker>
        <TextReveal
          as="h2"
          id="faq-title"
          className={"mt-4 " + ui.sectionTitle}
        >
          Немного ясности
          <br />
          <span className="text-shell-dim">перед началом.</span>
        </TextReveal>
        <TextReveal className={"mt-5 max-w-md " + ui.body}>
          Что умеют инструменты, как сохраняются результаты и какие есть
          ограничения.
        </TextReveal>
        <Link
          to="/contact"
          className={
            "mt-4 inline-flex min-h-11 items-center gap-2 rounded text-sm text-shell-accent hover:text-shell-accent-hover " +
            ui.focus
          }
        >
          <MessageCircle size={17} aria-hidden="true" />
          Есть другой вопрос?
        </Link>
      </div>
      <ScrollReveal>
        <Accordion
          multiple
          className="rounded-2xl border border-shell-divider/10 bg-shell-surface px-4 sm:px-6 motion-reduce:**:data-[slot=accordion-content]:animate-none motion-reduce:**:data-[slot=accordion-trigger]:transition-none"
        >
          {faqs.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-0">
              <AccordionTrigger className="min-h-16 items-center gap-5 rounded-md py-5 text-base leading-7 text-shell-text hover:no-underline focus-visible:border-shell-accent focus-visible:ring-shell-accent/30 **:data-[slot=accordion-trigger-icon]:text-shell-sand">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 text-base leading-7 text-shell-muted">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </section>
  );
}
export function LandingCta() {
  return (
    <section aria-labelledby="cta-title" className={ui.container + " pb-8"}>
      <ScrollReveal className="relative isolate overflow-hidden rounded-3xl border border-shell-accent/25 bg-shell-surface px-5 py-12 text-left sm:px-10 sm:py-16 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,var(--shell-glow-amber),transparent_70%)]"
        />
        <p className="text-sm leading-6 font-medium tracking-wide text-shell-soft">
          ВАША СЛЕДУЮЩАЯ ЗАДАЧА
        </p>
        <TextReveal as="h2" id="cta-title" className={"mt-4 " + ui.heroTitle}>
          Меньше поисков.
          <br />
          <AccentText text="Больше готового." />
        </TextReveal>
        <TextReveal className={"mt-5 max-w-lg " + ui.body}>
          Тема для сайта, медиа по ссылке или файл в другом формате — начните с
          того, что нужно сейчас.
        </TextReveal>
        <div className="mt-7 flex flex-wrap gap-3">
          {tools.map((tool, index) => (
            <Link
              key={tool.id}
              to={tool.to}
              className={
                "inline-flex min-h-12 items-center gap-2 rounded-lg border px-5 py-3 text-base font-medium " +
                ui.focus +
                (index === 0
                  ? " border-transparent bg-shell-accent text-shell-accent-ink hover:bg-shell-accent-hover"
                  : " border-shell-divider/20 bg-shell-deep text-shell-soft hover:bg-shell-raised")
              }
            >
              {tool.id === "theme"
                ? "Редактор тем"
                : tool.id === "youtube"
                  ? "YouTube"
                  : "Конвертер"}
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
export function LandingNumbers() {
  return (
    <section
      className={ui.container + " pb-12 sm:pb-16"}
      aria-label="Возможности LePear в цифрах"
    >
      <div className="grid gap-6 py-7 sm:grid-cols-3 sm:gap-8 sm:py-9">
        {[
          {
            to: tools.length,
            label: "инструмента",
            detail: "Оформление, YouTube и конвертация",
          },
          { to: 3, label: "режима YouTube", detail: "Видео, аудио и субтитры" },
          {
            to: converterFormats.length,
            label: "форматов конвертера",
            detail: "Музыка и статичные изображения",
          },
        ].map((item, index) => (
          <ScrollReveal
            key={item.label}
            className="flex items-start gap-4"
            delay={index * 0.08}
          >
            <CountUp
              to={item.to}
              className="font-[family-name:Arial_Black,Arial,sans-serif] text-6xl leading-none font-black tracking-tight text-shell-accent"
            />
            <div className="min-w-0 pt-1">
              <p className="text-base leading-7 text-shell-text">
                {item.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-shell-muted">
                {item.detail}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
