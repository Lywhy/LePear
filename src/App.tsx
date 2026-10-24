import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Menu,
  MousePointer2,
  Palette,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingPreview } from "@/components/landing/landing-preview";
import { Brand, EditorLink, Kicker } from "@/components/landing/shared";
import { themeColors } from "@/lib/site-theme";

const faqs = [
  [
    "Что такое LePear?",
    "LePear — визуальный редактор темы сайта. Подбирайте цвета, шрифты и форму компонентов, проверяйте результат на живом интерфейсе и переносите настройки в свой проект. Редактор открывается на отдельной странице.",
  ],
  [
    "Для какой библиотеки подходит тема?",
    "Редактор использует shadcn/ui и Tailwind CSS. Можно скачать CSS-переменные выбранной темы и JSON с настройками. Для применения CSS понадобится подключить переменные к контейнеру вашего приложения.",
  ],
  [
    "Нужно ли уметь писать код?",
    "Для выбора оформления — нет. Цвета, шрифты и закругления меняются визуально. Чтобы подключить тему к своему сайту, понадобится доступ к его стилям.",
  ],
  [
    "Могу ли я использовать свой цвет?",
    "Да. В редакторе доступны готовые акценты и выбор собственного цвета. Цвет текста основной кнопки подстраивается под яркость акцента.",
  ],
  [
    "Сохраняются ли мои настройки?",
    "Сейчас настройки действуют во время работы на странице редактора. Скачайте JSON, чтобы сохранить их в файле. Автоматическое сохранение и импорт будут добавлены отдельно.",
  ],
];
const sectionWidth =
  "mx-auto w-[calc(100%-2rem)] max-w-7xl sm:w-[calc(100%-4rem)] lg:w-[calc(100%-7rem)]";
const heading =
  "mt-5 text-4xl leading-[1.08] font-normal tracking-[-.05em] sm:text-5xl lg:text-[3.4rem]";
const muted = "text-[#a8b69c]";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="dark min-h-screen overflow-x-clip bg-[#0e100f] font-sans text-[#f2f3ed] selection:bg-[#d3ed9a] selection:text-[#182112]">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded bg-[#d3ed9a] p-3 text-[#182112] focus:translate-y-0"
        href="#main"
      >
        К содержимому
      </a>
      <header
        className={`${sectionWidth} relative flex min-h-20 items-center justify-between gap-4 py-4 lg:min-h-22`}
      >
        <Brand />
        <nav
          className="hidden items-center gap-7 text-sm text-[#b6c0ad] lg:flex"
          aria-label="Основная навигация"
        >
          {[
            ["Возможности", "#features"],
            ["Как это работает", "#how-it-works"],
            ["Вопросы", "#faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <EditorLink className="min-h-10 gap-2 bg-[#e6eade] px-3 py-2 text-xs sm:text-sm">
            Редактор
          </EditorLink>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 text-[#d4dfc9] lg:hidden"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="absolute top-full right-0 left-0 z-30 rounded-md border border-white/15 bg-[#1b2118] p-3 shadow-xl lg:hidden"
            aria-label="Мобильная навигация"
          >
            {[
              ["Возможности", "#features"],
              ["Как это работает", "#how-it-works"],
              ["Вопросы", "#faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center justify-between gap-4 rounded px-3 text-base hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#d3ed9a]"
              >
                {label}
                <ArrowUpRight size={18} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="relative isolate mx-2 min-h-155 overflow-hidden bg-[#162b2b] px-4 pt-14 pb-52 text-center sm:mx-4 sm:min-h-172.5 sm:pt-16 sm:pb-60">
          <div
            className="absolute inset-0 -z-20 bg-[url('/assets/lepear-landscape.webp')] bg-cover bg-center"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 bg-[#061619]/25"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-4xl">
            <p className="mx-auto flex w-fit max-w-full items-center justify-center gap-2 rounded-sm border border-white/20 bg-[#142c27]/75 px-3 py-2 font-mono text-[11px] leading-5 tracking-wide text-[#e9efdc] sm:text-xs">
              <span
                className="size-1.5 shrink-0 bg-[#d3ed9a]"
                aria-hidden="true"
              />
              МЕНЬШЕ РУТИНЫ. БОЛЬШЕ ВАШЕГО СТИЛЯ.
            </p>
            <h1 className="my-6 text-[clamp(2.7rem,11.5vw,5rem)] leading-[1.02] font-normal tracking-[-.065em] sm:my-7">
              Ваш сайт.
              <br />
              Ваш характер.
            </h1>
            <p className="mx-auto max-w-lg text-base leading-7 text-[#eff1e8] sm:text-lg sm:leading-8">
              От первого цвета до последнего пикселя.
              <br className="hidden sm:block" /> Создавайте темы, которые
              хочется использовать.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <EditorLink>Попробовать в деле</EditorLink>
              <a
                href="#features"
                className="inline-flex min-h-12 items-center gap-3 border-b border-white/40 py-3 text-sm text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white"
              >
                Узнать больше
                <ArrowDown size={16} />
              </a>
            </div>
            <p className="mt-4 text-sm text-[#e3ebd8]">
              Без регистрации · На основе shadcn/ui
            </p>
          </div>
        </section>
        <LandingPreview />
        <section
          id="features"
          className={`${sectionWidth} scroll-mt-8 py-20 lg:py-24`}
        >
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Kicker>СОБСТВЕННЫЙ ВИЗУАЛЬНЫЙ ЯЗЫК</Kicker>
              <h2 className={heading}>
                Одна основа.
                <br />
                <span className={muted}>Бесконечно ваш.</span>
              </h2>
            </div>
            <p className={`${muted} text-base leading-8`}>
              Не начинайте с чистого листа.
              <br />
              Начните со своего ощущения.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="overflow-hidden rounded-md border border-white/10 bg-[#141814]">
              <div className="min-h-52 border-b border-white/10 bg-[#171c16] p-7">
                <div className="flex h-12 gap-1.5" aria-hidden="true">
                  {themeColors.map((color) => (
                    <span
                      key={color.name}
                      className={`flex-1 rounded-sm ${color.className}`}
                    />
                  ))}
                </div>
                <div className="mt-6 space-y-2 font-mono text-xs leading-6 text-[#b0c09f]">
                  {[
                    ["--primary", "#D3ED9A"],
                    ["--background", "#101310"],
                    ["--foreground", "#EDF1E7"],
                  ].map(([token, value]) => (
                    <div key={token} className="flex justify-between gap-3">
                      <span>{token}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <FeatureCopy
                index="01 / ЦВЕТ"
                title="Найдите свою палитру"
                text="Спокойная база или смелый акцент. Выберите цвет — и посмотрите, как меняется весь интерфейс."
              />
            </article>
            <article className="overflow-hidden rounded-md border border-white/10 bg-[#141814]">
              <div className="flex min-h-52 flex-col justify-between gap-6 border-b border-white/10 bg-[#171c16] p-7">
                <p className="text-7xl leading-none tracking-[-.08em] text-[#e1e7d8]">
                  Aa<span className="ml-5 text-5xl text-[#92a281]">Бб</span>
                </p>
                <p className="flex flex-wrap justify-between gap-2 font-mono text-xs leading-6 text-[#b0c09f]">
                  <span>Geist</span>
                  <span>Regular / Medium / Bold</span>
                </p>
              </div>
              <FeatureCopy
                index="02 / ТИПОГРАФИКА"
                title="Задайте тон одним шрифтом"
                text="Строго, выразительно или чуть мягче. Найдите голос, с которым ваш сайт говорит за вас."
              />
            </article>
            <article className="overflow-hidden rounded-md border border-white/10 bg-[#141814]">
              <div className="flex min-h-52 flex-wrap items-center justify-center gap-3 border-b border-white/10 bg-[#171c16] p-7 text-sm">
                <span className="rounded-sm border border-[#7b9350]/40 bg-[#26301f] px-4 py-3 text-[#c9dda9]">
                  Строго
                </span>
                <span className="rounded-xl border border-[#91a968]/50 bg-[#343e25] px-4 py-3 text-[#d1e3b4]">
                  Мягко
                </span>
                <span className="rounded-full bg-[#cee598] px-4 py-3 text-[#243018]">
                  Свободно
                </span>
              </div>
              <FeatureCopy
                index="03 / ФОРМА"
                title="Всё дело в деталях"
                text="Закругления меняют настроение. Настройте форму компонентов до нужного ощущения."
              />
            </article>
          </div>
        </section>
        <section
          id="how-it-works"
          className={`${sectionWidth} grid scroll-mt-8 gap-10 border-t border-white/10 py-20 lg:grid-cols-[1fr_1.15fr] lg:gap-24 lg:py-24`}
        >
          <div>
            <Kicker>ОТ ИДЕИ ДО ИНТЕРФЕЙСА</Kicker>
            <h2 className={heading}>
              Меньше рутины.
              <br />
              <span className={muted}>Больше попаданий.</span>
            </h2>
            <p className={`mt-6 text-base leading-8 ${muted}`}>
              Простой путь к теме,
              <br />
              которую вы искали.
            </p>
            <Link
              to="/editor"
              className="mt-6 inline-flex min-h-12 items-center gap-6 border-b border-[#91a878]/50 py-3 text-base text-[#d4e7be] hover:text-white focus-visible:outline-2 focus-visible:outline-[#d3ed9a]"
            >
              Начать с одного цвета
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {[
              {
                n: "01",
                title: "Выберите настроение",
                text: "Откройте редактор. Выберите светлую или тёмную основу, любимый акцент и шрифт.",
                icon: Palette,
              },
              {
                n: "02",
                title: "Посмотрите в действии",
                text: "Кнопки, поля и карточки меняются вместе с темой. Оцените её на живом интерфейсе.",
                icon: MousePointer2,
              },
              {
                n: "03",
                title: "Заберите с собой",
                text: "Скачайте CSS-переменные темы или JSON с настройками и используйте их в своём проекте.",
                icon: Code2,
              },
            ].map((step) => (
              <article
                key={step.n}
                className="flex items-start gap-5 py-7 first:pt-0"
              >
                <span className="rounded border border-[#607c39]/40 px-2 py-1 font-mono text-xs leading-6 text-[#adc098]">
                  {step.n}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className={`mt-3 max-w-md text-base leading-7 ${muted}`}>
                    {step.text}
                  </p>
                </div>
                <step.icon
                  className="mt-1 hidden shrink-0 text-[#a4b68f] sm:block"
                  size={20}
                />
              </article>
            ))}
          </div>
        </section>
        <section
          id="faq"
          className={`${sectionWidth} grid scroll-mt-8 gap-10 border-t border-white/10 py-20 lg:grid-cols-[1fr_1.15fr] lg:gap-24 lg:py-24`}
        >
          <div>
            <Kicker>ХОРОШИЙ ВОПРОС</Kicker>
            <h2 className={heading}>
              Давайте
              <br />
              <span className={muted}>разберёмся.</span>
            </h2>
            <p className={`mt-6 text-base leading-8 ${muted}`}>
              Немного ясности перед первым цветом.
            </p>
          </div>
          <Accordion>
            {faqs.map(([question, answer], i) => (
              <AccordionItem
                key={question}
                value={i}
                className="border-white/10"
              >
                <AccordionTrigger className="gap-5 rounded-none py-5 text-base leading-7 font-normal">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-8 text-[#b1bda7]">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section
          className={`${sectionWidth} rounded-md border border-[#93aa59]/30 bg-[#1a2117] px-5 py-14 text-center sm:px-10 sm:py-20`}
        >
          <div className="flex justify-center">
            <Kicker>ВАША СЛЕДУЮЩАЯ ХОРОШАЯ ИДЕЯ</Kicker>
          </div>
          <h2 className="my-7 text-5xl leading-[1.06] font-normal tracking-[-.055em] sm:text-6xl lg:text-7xl">
            Пусть выглядит
            <br />
            <span className="text-[#d3ed9a]">по-вашему.</span>
          </h2>
          <EditorLink>Создать своё настроение</EditorLink>
          <p className="mt-5 text-sm leading-7 text-[#b7c6a8]">
            Начните с цвета. Остальное сложится.
          </p>
        </section>
      </main>
      <footer
        className={`${sectionWidth} flex flex-wrap items-center justify-between gap-6 py-9`}
      >
        <Brand />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#b1bda7]">
          <Link to="/contact" className="hover:text-white">
            Обратная связь
          </Link>
          <a
            className="inline-flex items-center gap-2 hover:text-white"
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
          >
            Built with shadcn/ui
            <ArrowUpRight size={14} />
          </a>
          <span>© 2026 LePear</span>
        </div>
      </footer>
    </div>
  );
}
function FeatureCopy({
  index,
  title,
  text,
}: {
  index: string;
  title: string;
  text: string;
}) {
  return (
    <div className="p-6 sm:p-7">
      <p className="font-mono text-xs leading-6 tracking-wide text-[#b0c39d]">
        {index}
      </p>
      <h3 className="mt-3 text-xl leading-7 font-medium tracking-tight">
        {title}
      </h3>
      <p className="mt-3 text-base leading-7 text-[#a8b69c]">{text}</p>
    </div>
  );
}
