import { EditorLink, Kicker } from "@/components/landing/shared";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { designClasses as ui } from "@/lib/design-system";
import { themeColors } from "@/lib/site-theme";
import {
  Check,
  Code2,
  Layers3,
  MessageCircle,
  Palette,
  Save,
  SlidersHorizontal,
  Type
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
      className="flex min-h-52 flex-col justify-center border-b border-white/10 bg-[#101710]/55 p-6 sm:p-7"
    >
      {kind === "color" ? (
        <>
          <div className="flex h-14 gap-2">
            {themeColors.map((color) => (
              <span
                key={color.name}
                className={`min-w-0 flex-1 rounded-lg ${color.className}`}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm leading-6">
            <div className="rounded-lg border border-white/10 bg-[#22291e] p-3 text-[#e9eedf]">
              Тёмная основа
              <span className="mt-1 block text-[#b1bda7]">Свой характер</span>
            </div>
            <div className="rounded-lg border border-[#dbe4d0] bg-[#f4f6f0] p-3 text-[#20271c]">
              Светлая основа
              <span className="mt-1 block text-[#5c6952]">Свои цвета</span>
            </div>
          </div>
        </>
      ) : kind === "type" ? (
        <>
          <p className="text-6xl leading-none tracking-[-0.06em] text-[#e7eddc]">
            Aa <span className="font-serif text-[#c9dfa9]">Бб</span>
          </p>
          <p className="mt-5 text-base leading-7 text-[#c5d1b9]">
            Читается. Чувствуется. Запоминается.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm leading-6 text-[#a8b69c]">
            <span>Geist</span>
            <span>Georgia</span>
            <span>Системный</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 text-sm leading-6 text-[#e4edda]">
            <span className="rounded-sm border border-[#7d9659]/50 bg-[#26301f] px-4 py-3">
              Строго
            </span>
            <span className="rounded-xl border border-[#91a968]/50 bg-[#343e25] px-4 py-3">
              Мягко
            </span>
            <span className="rounded-full bg-[#d3ed9a] px-4 py-3 text-[#182112]">
              Свободно
            </span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-[#b1bda7]">Плотность</span>
            <span className="h-1 flex-1 rounded-full bg-[#343e2a]">
              <span className="block h-full w-2/3 rounded-full bg-[#a7c77c]" />
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
    <section id="features" aria-labelledby="features-title" className={section}>
      <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <Kicker>СОБСТВЕННЫЙ ВИЗУАЛЬНЫЙ ЯЗЫК</Kicker>
          <h2 id="features-title" className={`mt-4 ${ui.sectionTitle}`}>
            Одна основа.
            <br />
            <span className="text-[#a8b69c]">Бесконечно ваш.</span>
          </h2>
        </div>
        <p className={`${ui.body} max-w-lg`}>
          Цвет, типографика и форма работают вместе. Настройте каждый слой и
          сразу посмотрите на целый интерфейс.
        </p>
      </div>
      <div className={`${ui.grid} lg:grid-cols-3`}>
        {cards.map((card) => (
          <SpotlightCard
            key={card.id}
            role="article"
            aria-labelledby={`feature-${card.id}`}
            effectsEnabled={reduced === false}
            spotlightColor="#d3ed9a"
            intensity={0.2}
            borderGlow={0.8}
            proximity={48}
            smoothing={0.2}
            ambient={false}
            flare={false}
            className="flex h-full min-w-0 flex-col p-0 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#d3ed9a]"
            style={
              {
                "--spotlight-card-surface": "#171c17",
                "--spotlight-card-border": "rgba(211,237,154,0.16)",
              } as CSSProperties
            }
          >
            <FeatureVisual kind={card.id} />
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <p className="flex items-center justify-between gap-3 text-sm leading-6 text-[#b5c6a5]">
                <span>
                  {card.number} / {card.label}
                </span>
                <card.icon size={18} aria-hidden="true" />
              </p>
              <h3 id={`feature-${card.id}`} className={`mt-4 ${ui.cardTitle}`}>
                {card.title}
              </h3>
              <p className={`mt-3 flex-1 ${ui.body}`}>{card.text}</p>
              <Link
                to="/editor"
                className={`mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded text-sm text-[#d3ed9a] hover:text-[#e0f6b7] ${ui.focus}`}
              >
                {card.action}
              </Link>
            </div>
          </SpotlightCard>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-white/10 bg-[#121810] px-5 py-4 text-sm leading-6 text-[#bdcdb0]">
        {[
          "Два режима — независимые палитры",
          "Именованные копии в браузере",
          "JSON для переноса и резервных копий",
        ].map((text) => (
          <p key={text} className="flex items-start gap-2">
            <Check
              size={16}
              aria-hidden="true"
              className="mt-1 shrink-0 text-[#d3ed9a]"
            />
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}

export function LandingWorkflow() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="workflow-title"
      className={`${section} border-t border-white/10`}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Kicker>ОТ ИДЕИ ДО ИНТЕРФЕЙСА</Kicker>
          <h2 id="workflow-title" className={`mt-4 ${ui.sectionTitle}`}>
            Найдите своё.
            <br />
            <span className="text-[#a8b69c]">Сохраните. Используйте.</span>
          </h2>
          <p className={`mt-5 max-w-md ${ui.body}`}>
            От первой палитры до темы, которую можно забрать с собой. Без
            регистрации и лишних шагов.
          </p>
          <EditorLink className="mt-6 gap-2 rounded-lg">
            Начать с пресета
          </EditorLink>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <li key={step.number} className="min-w-0">
              <ScrollReveal className="h-full rounded-2xl border border-white/10 bg-[#171c17] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-sm leading-6 text-[#b1c79a]">
                    {step.number}
                  </span>
                  <step.icon
                    size={21}
                    aria-hidden="true"
                    className="text-[#c9dfa9]"
                  />
                </div>
                <h3 className="mt-5 text-lg leading-7 font-medium">
                  {step.title}
                </h3>
                <p className={`mt-3 ${ui.body}`}>{step.text}</p>
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
      className={`${section} grid gap-8 border-t border-white/10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}
    >
      <div>
        <Kicker>ХОРОШИЙ ВОПРОС</Kicker>
        <h2 id="faq-title" className={`mt-4 ${ui.sectionTitle}`}>
          Немного ясности
          <br />
          <span className="text-[#a8b69c]">перед первым цветом.</span>
        </h2>
        <p className={`mt-5 max-w-md ${ui.body}`}>
          Что сохраняется, как перенести тему и что понадобится для подключения.
        </p>
        <Link
          to="/contact"
          className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded text-sm text-[#d3ed9a] hover:text-[#e0f6b7] ${ui.focus}`}
        >
          <MessageCircle size={17} aria-hidden="true" />
          Есть другой вопрос?
        </Link>
      </div>
      <Accordion
        multiple
        className="rounded-2xl border border-white/10 bg-[#171c17] px-4 sm:px-6 motion-reduce:**:data-[slot=accordion-content]:animate-none motion-reduce:**:data-[slot=accordion-trigger]:transition-none"
      >
        {faqs.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border-white/10"
          >
            <AccordionTrigger className="min-h-16 items-center gap-5 rounded-md py-5 text-base leading-7 text-[#e4edda] hover:no-underline focus-visible:border-[#d3ed9a] focus-visible:ring-[#d3ed9a]/30 **:data-[slot=accordion-trigger-icon]:text-[#c9dfa9]">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="h-auto pb-5 text-base leading-7 text-[#b1bda7]">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function LandingCta() {
  return (
    <section aria-labelledby="cta-title" className={`${ui.container} pb-8`}>
      <div className="relative isolate overflow-hidden rounded-3xl border border-[#a7c77c]/25 bg-[#1a2417] px-5 py-12 text-center sm:px-10 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(163,195,112,0.14),transparent_70%)]"
        />
        <p className="text-sm leading-6 font-medium tracking-wide text-[#c5dbab]">
          ВАШ СЛЕДУЮЩИЙ ХОРОШИЙ ВАРИАНТ
        </p>
        <h2
          id="cta-title"
          className="mt-4 text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-5xl"
        >
          Пусть выглядит
          <br />
          <span className="text-[#d3ed9a]">по-вашему.</span>
        </h2>
        <p className={`mx-auto mt-5 max-w-lg ${ui.body}`}>
          Начните с пресета, сохраните свой вариант и заберите тему в проект.
        </p>
        <EditorLink className="mt-6 gap-2 rounded-lg text-base">
          Создать свою тему
        </EditorLink>
        <p className="mt-4 text-sm leading-6 text-[#b7c6a8]">
          Без аккаунта · Локальные копии · CSS и JSON
        </p>
      </div>
    </section>
  );
}
