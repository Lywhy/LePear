import { TextReveal } from "@/components/motion/text-reveal";
import { shellColors } from "@/lib/shell-palette";
import { AccentText, RevealText } from "@/components/landing/marketing-text";
import { EditorLink, Kicker } from "@/components/landing/shared";
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
import { shellSwatches as themeColors } from "@/lib/shell-palette";
import {
  Check,
  Code2,
  Layers3,
  MessageCircle,
  Palette,
  Save,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const section = `${ui.container} scroll-mt-8 py-16 sm:py-20 lg:py-24`;
const cards = [
  {
    id: "color",
    icon: Palette,
    number: "01",
    label: "ЦВЕТ",
    title: "Найдите свою палитру",
    text: "Четыре пресета, собственный акцент и независимые светлый и тёмный режимы. Цвета поверхностей, текста и состояний — под вашим контролем.",
    action: "Подобрать цвета",
  },
  {
    id: "type",
    icon: Type,
    number: "02",
    label: "ТИПОГРАФИКА",
    title: "Дайте сайту свой голос",
    text: "Подберите семейство, насыщенность и масштаб заголовков. Настройте интервалы и оцените длинный текст на реальных компонентах.",
    action: "Выбрать типографику",
  },
  {
    id: "shape",
    icon: SlidersHorizontal,
    number: "03",
    label: "РАЗМЕРЫ",
    title: "Соберите всё в деталях",
    text: "От строгих граней до мягких карточек. Меняйте радиусы, плотность и отступы, сохраняя удобную высоту кнопок и полей.",
    action: "Настроить размеры",
  },
];
const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Выберите основу",
    text: "Начните с пресета. Задайте свои цвета отдельно для светлого и тёмного режимов.",
  },
  {
    number: "02",
    icon: Layers3,
    title: "Доведите до своего стиля",
    text: "Настройте шрифт, размеры и отступы. Посмотрите на кнопки, формы и диалоги в широком и узком виде.",
  },
  {
    number: "03",
    icon: Save,
    title: "Сохраните удачный вариант",
    text: "Создайте именованную копию. Рабочие изменения сохраняются в браузере и восстанавливаются после перезагрузки.",
  },
  {
    number: "04",
    icon: Code2,
    title: "Перенесите тему в проект",
    text: "Скачайте CSS для shadcn/ui с Tailwind v4 и подключите его по инструкции. JSON пригодится для резервной копии и повторного импорта.",
  },
];
const faqs = [
  {
    id: "product",
    question: "Что я смогу настроить?",
    answer:
      "LePear меняет цвета, шрифты, насыщенности, интервалы, закругления и плотность компонентов. Результат виден на живом интерфейсе shadcn/ui в отдельном редакторе. Превью на главной — статичный пример оформления.",
  },
  {
    id: "save",
    question: "Сохранятся ли настройки после перезагрузки?",
    answer:
      "Да, рабочая тема и настройки панели автоматически сохраняются в этом браузере. Можно создать до 20 именованных копий. Они обновляются отдельной кнопкой; рабочие изменения не перезаписывают копию автоматически. Для важной темы скачайте JSON: очистка данных браузера удалит локальные темы.",
  },
  {
    id: "modes",
    question: "Светлый и тёмный режимы связаны?",
    answer:
      "Цвета у них независимы: пресет и ручная настройка меняют только выбранный режим. Типографика, радиусы и отступы общие. В CSS и JSON экспортируются обе палитры.",
  },
  {
    id: "integrate",
    question: "Как подключить тему к своему сайту?",
    answer:
      "CSS рассчитан на shadcn/ui и Tailwind CSS v4. Импортируйте файл в основной stylesheet, обработайте его сборкой и задайте контейнер темы по инструкции. Шрифты и размещение порталов меню/диалогов нужно подключить отдельно. Сам по себе файл не меняет внешний сайт.",
  },
  {
    id: "import",
    question: "Можно ли продолжить работу из JSON?",
    answer:
      "Да. Загрузите JSON темы LePear schema v2 или вставьте его содержимое в редактор. Перед применением показываются параметры и ошибки. Корректный импорт заменяет рабочий черновик, сохраняя библиотеку именованных копий. Максимальный размер файла — 1 МБ.",
  },
  {
    id: "account",
    question: "Нужен ли аккаунт или сервер?",
    answer:
      "Для редактора регистрация не нужна. Темы хранятся локально: синхронизации между браузерами, вкладками и устройствами нет. Для переноса используйте JSON. Контактная форма пока демонстрационная и не отправляет сообщения.",
  },
];

function FeatureVisual({ kind }: { kind: string }) {
  return (
    <div
      aria-hidden="true"
      className={
        "flex min-h-52 flex-col justify-center border-b border-white/10 bg-shell-surface/55 p-6 sm:p-7 " +
        (kind === "color" ? "lg:border-r lg:border-b-0" : "")
      }
    >
      {kind === "color" ? (
        <>
          <div className="flex h-28 gap-2 sm:h-36">
            {themeColors.map((color) => (
              <span
                key={color.name}
                className={`min-w-0 flex-1 rounded-lg ${color.className}`}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm leading-6">
            <div className="rounded-lg border border-white/10 bg-shell-raised p-3 text-shell-text">
              Тёмная основа
              <span className="mt-1 block text-shell-muted">Свой характер</span>
            </div>
            <div className="rounded-lg border border-shell-sand bg-shell-light-surface p-3 text-shell-light-ink">
              Светлая основа
              <span className="mt-1 block text-shell-line">Свои цвета</span>
            </div>
          </div>
        </>
      ) : kind === "type" ? (
        <>
          <p className="text-6xl leading-none tracking-[-0.06em] text-shell-text">
            Aa <span className="font-serif text-shell-sand">Бб</span>
          </p>
          <p className="mt-5 text-base leading-7 text-shell-soft">
            Читается. Чувствуется. Запоминается.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm leading-6 text-shell-dim">
            <span>Geist</span>
            <span>Georgia</span>
            <span>Системный</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 text-sm leading-6 text-shell-text">
            <span className="rounded-sm border border-shell-line/50 bg-shell-raised px-4 py-3">
              Строго
            </span>
            <span className="rounded-xl border border-shell-line/50 bg-shell-hover px-4 py-3">
              Мягко
            </span>
            <span className="rounded-full bg-shell-accent px-4 py-3 text-shell-accent-ink">
              Свободно
            </span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-shell-muted">Плотность</span>
            <span className="h-1 flex-1 rounded-full bg-shell-hover">
              <span className="block h-full w-2/3 rounded-full bg-shell-accent" />
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function LandingFeatures() {
  const reduced = useReducedMotion();
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className={"scroll-mt-24 " + section}
    >
      <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <Kicker>СОБСТВЕННЫЙ ВИЗУАЛЬНЫЙ ЯЗЫК</Kicker>
          <h2 id="features-title" className={`mt-4 ${ui.sectionTitle}`}>
            <RevealText text="Одна основа." />
            <br />
            <span className="text-shell-dim">
              <RevealText text="Бесконечно ваш." />
            </span>
          </h2>
        </div>
        <TextReveal className={`${ui.body} max-w-lg`}>
          Цвет, типографика и форма работают вместе. Настройте каждый слой и
          сразу посмотрите на целый интерфейс.
        </TextReveal>
      </div>
      <div className={`${ui.grid} lg:grid-cols-2`}>
        {cards.map((card, index) => (
          <ScrollReveal
            key={card.id}
            delay={index * 0.08}
            className={
              "h-full min-w-0 " + (card.id === "color" ? "lg:col-span-2" : "")
            }
          >
            <SpotlightCard
              role="article"
              aria-labelledby={`feature-${card.id}`}
              effectsEnabled={reduced === false}
              spotlightColor={shellColors["accent"]}
              intensity={0.2}
              borderGlow={0.8}
              proximity={48}
              smoothing={0.2}
              ambient={false}
              flare={false}
              className={
                "grid h-full min-w-0 p-0 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-shell-accent " +
                (card.id === "color"
                  ? "lg:col-span-2 lg:grid-cols-2"
                  : "grid-rows-[auto_1fr]")
              }
              style={
                {
                  "--spotlight-card-surface": shellColors["surface"],
                  "--spotlight-card-border": shellColors["spotlight-border"],
                } as CSSProperties
              }
            >
              <FeatureVisual kind={card.id} />
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="flex items-center justify-between gap-3 text-sm leading-6 text-shell-muted">
                  <span>
                    {card.number} / {card.label}
                  </span>
                  <card.icon size={18} aria-hidden="true" />
                </p>
                <TextReveal
                  as="h3"
                  id={`feature-${card.id}`}
                  className={`mt-4 ${ui.cardTitle}`}
                >
                  {card.title}
                </TextReveal>
                <TextReveal className={`mt-3 flex-1 ${ui.body}`}>
                  {card.text}
                </TextReveal>
                <Link
                  to="/editor"
                  className={`mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded text-sm text-shell-accent hover:text-shell-accent-hover ${ui.focus}`}
                >
                  {card.action}
                </Link>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-white/10 bg-shell-deep px-5 py-4 text-sm leading-6 text-shell-muted">
        {[
          "Два режима — независимые палитры",
          "Именованные копии в браузере",
          "JSON для переноса и резервных копий",
        ].map((text) => (
          <p key={text} className="flex items-start gap-2">
            <Check
              size={16}
              aria-hidden="true"
              className="mt-1 shrink-0 text-shell-accent"
            />
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
      className={section + " scroll-mt-24 border-t border-white/10"}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Kicker>ОТ ИДЕИ ДО ИНТЕРФЕЙСА</Kicker>
          <TextReveal
            as="h2"
            id="workflow-title"
            className={`mt-4 ${ui.sectionTitle}`}
          >
            Найдите своё.
            <br />
            <span className="text-shell-dim">Сохраните. Используйте.</span>
          </TextReveal>
          <TextReveal className={`mt-5 max-w-md ${ui.body}`}>
            От первой палитры до темы, которую можно забрать с собой. Без
            регистрации и лишних шагов.
          </TextReveal>
          <EditorLink className="mt-6 gap-2 rounded-lg">
            Начать с пресета
          </EditorLink>
        </div>
        <ol className="min-w-0 border-t border-white/20">
          {steps.map((step, index) => (
            <li key={step.number} className="min-w-0 border-b border-white/15">
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
                    <step.icon
                      size={21}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-shell-sand"
                    />
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
        " scroll-mt-24 grid gap-8 border-t border-white/10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
      }
    >
      <div>
        <Kicker>ХОРОШИЙ ВОПРОС</Kicker>
        <TextReveal
          as="h2"
          id="faq-title"
          className={`mt-4 ${ui.sectionTitle}`}
        >
          Немного ясности
          <br />
          <span className="text-shell-dim">перед первым цветом.</span>
        </TextReveal>
        <TextReveal className={`mt-5 max-w-md ${ui.body}`}>
          Что сохраняется, как перенести тему и что понадобится для подключения.
        </TextReveal>
        <Link
          to="/contact"
          className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded text-sm text-shell-accent hover:text-shell-accent-hover ${ui.focus}`}
        >
          <MessageCircle size={17} aria-hidden="true" />
          Есть другой вопрос?
        </Link>
      </div>
      <ScrollReveal>
        <Accordion
          multiple
          className="rounded-2xl border border-white/10 bg-shell-surface px-4 sm:px-6 motion-reduce:**:data-[slot=accordion-content]:animate-none motion-reduce:**:data-[slot=accordion-trigger]:transition-none"
        >
          {faqs.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-white/10"
            >
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
    <section aria-labelledby="cta-title" className={`${ui.container} pb-8`}>
      <ScrollReveal className="relative isolate overflow-hidden rounded-3xl border border-shell-accent/25 bg-shell-surface px-5 py-12 text-left sm:px-10 sm:py-16 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,var(--shell-glow-amber),transparent_70%)]"
        />
        <p className="text-sm leading-6 font-medium tracking-wide text-shell-soft">
          ВАШ СЛЕДУЮЩИЙ ХОРОШИЙ ВАРИАНТ
        </p>
        <TextReveal as="h2" id="cta-title" className={"mt-4 " + ui.heroTitle}>
          Пусть выглядит
          <br />
          <AccentText text="по-вашему." />
        </TextReveal>
        <TextReveal className={`mt-5 max-w-lg ${ui.body}`}>
          Начните с пресета, сохраните свой вариант и заберите тему в проект.
        </TextReveal>
        <EditorLink className="mt-6 gap-2 rounded-lg text-base">
          Создать свою тему
        </EditorLink>
        <p className="mt-4 text-sm leading-6 text-shell-muted">
          Без аккаунта · Локальные копии · CSS и JSON
        </p>
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
      <div className="grid gap-6 border-y border-white/20 py-7 sm:grid-cols-3 sm:gap-8 sm:py-9">
        {[
          { to: 2, label: "независимые палитры", detail: "Светлая и тёмная" },
          {
            to: 4,
            label: "цветовых пресета",
            detail: "Отправная точка для своего стиля",
          },
          {
            to: 7,
            label: "семейств шрифтов",
            detail: "С кириллицей и fallback",
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
