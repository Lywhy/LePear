import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Download,
  Layers3,
  Monitor,
  Smartphone,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeImport } from "@/components/editor/theme-import";
import { Textarea } from "@/components/ui/textarea";
import { ThemePreview } from "@/components/theme-preview";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { PaletteEditor } from "@/components/editor/palette-editor";
import { TypographyEditor } from "@/components/editor/typography-editor";
import { LayoutEditor } from "@/components/editor/layout-editor";
import { SavedThemes } from "@/components/editor/saved-themes";
import { useThemeWorkspace, settingsSections } from "@/lib/use-theme-workspace";
import {
  exportTheme,
  createInitialTheme,
  updateTheme,
  type ThemeUpdate,
} from "@/lib/site-theme";

function SettingsSection({
  value,
  title,
  summary,
  children,
}: {
  value: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value} className="min-w-0 border-white/15">
      <AccordionTrigger className="min-h-16 items-center gap-3 px-1 py-4 text-base text-[#edf1e7] hover:no-underline focus-visible:border-[#d3ed9a] focus-visible:ring-[#d3ed9a]/30 **:data-[slot=accordion-trigger-icon]:text-[#c9dfa9]">
        <span className="min-w-0">
          <span className="block">{title}</span>
          <span className="mt-1 block text-sm leading-5 font-normal text-[#b1bda7]">
            {summary}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="h-auto px-1 pt-2 pb-5 [&>fieldset]:border-0 [&>fieldset]:pt-0 [&>fieldset>legend]:sr-only">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
export default function EditorPage() {
  const {
    workspace,
    setWorkspace,
    storageMessage,
    storageOk,
    blocked,
    retrySaving,
  } = useThemeWorkspace();
  const {
    theme,
    editor: { view, previewWidth, openSettings },
  } = workspace;
  function setTheme(theme: typeof workspace.theme) {
    setWorkspace((current) => ({ ...current, theme }));
  }
  function setView(view: typeof workspace.editor.view) {
    setWorkspace((current) => ({
      ...current,
      editor: { ...current.editor, view },
    }));
  }
  function setPreviewWidth(previewWidth: typeof workspace.editor.previewWidth) {
    setWorkspace((current) => ({
      ...current,
      editor: { ...current.editor, previewWidth },
    }));
  }
  function setOpenSettings(openSettings: string[]) {
    setWorkspace((current) => ({
      ...current,
      editor: { ...current.editor, openSettings },
    }));
  }
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const [paletteRevision, setPaletteRevision] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Редактор темы — LePear";
    return () => {
      document.title = "LePear — ваш сайт, ваш характер";
    };
  }, []);
  function patch(update: ThemeUpdate) {
    const result = updateTheme(theme, update);
    if (!result.success) {
      setStatus(
        `Настройки не изменены: ${result.errors.map((error) => `${error.path}: ${error.message}`).join(" ")}`,
      );
      return;
    }
    setTheme(result.theme);
    setCopied(false);
    setStatus("");
  }
  function download(format: "css" | "json") {
    const data =
      format === "css" ? exportTheme(theme) : JSON.stringify(theme, null, 2);
    const url = URL.createObjectURL(
      new Blob([data], {
        type: format === "css" ? "text/css" : "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `lepear-theme.${format}`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`Тема скачана: ${format.toUpperCase()}`);
  }
  async function copy(format: "css" | "json" = "css") {
    const data =
      format === "css" ? exportTheme(theme) : JSON.stringify(theme, null, 2);
    try {
      await navigator.clipboard.writeText(data);
      setCopied(format === "css");
      setManualCopy(null);
      setStatus(`${format.toUpperCase()} темы скопирован`);
    } catch {
      setCopied(false);
      setManualCopy(data);
      setStatus(
        "Буфер обмена недоступен. Выделите текст ниже и нажмите Ctrl+C / Cmd+C или скачайте файл.",
      );
    }
  }
  return (
    <div className="dark min-h-dvh bg-[#0e100f] font-sans text-[#edf1e7]">
      <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-8">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[#bdc9b2] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]"
        >
          <ArrowLeft size={17} />
          На главную
        </Link>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-xs leading-6 tracking-widest text-[#b5c6a5]">
              ВАШ ВИЗУАЛЬНЫЙ ЯЗЫК
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              Редактор темы
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#b1bda7]">
              Настройте оформление и проверьте его на компонентах. Изменения
              применяются только к области предпросмотра.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setTheme(createInitialTheme());
              setPaletteRevision((value) => value + 1);
              setCopied(false);
              setStatus("Исходная тема восстановлена для обоих режимов");
            }}
            className="h-11 gap-2 border-white/20 bg-transparent px-4 text-sm text-[#dbe4d2] hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Сбросить всю тему
          </Button>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside
            className="rounded-xl border border-white/10 bg-[#171c17] p-5 sm:p-6"
            aria-label="Настройки темы"
          >
            <h2 className="mb-6 flex items-center gap-2 text-lg font-medium">
              <SlidersHorizontal size={19} className="text-[#c9dfa9]" />
              Настройки
            </h2>
            <div className="space-y-3">
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Видимость блоков настроек"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenSettings([...settingsSections])}
                  className="min-h-11 px-2 text-sm text-[#c5d1b9] hover:bg-white/5"
                >
                  Развернуть всё
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenSettings([])}
                  className="min-h-11 px-2 text-sm text-[#c5d1b9] hover:bg-white/5"
                >
                  Свернуть всё
                </Button>
              </div>
              <Accordion
                multiple
                keepMounted
                value={openSettings}
                onValueChange={setOpenSettings}
                className="**:data-[slot=accordion-content]:animate-none"
              >
                <SettingsSection
                  value="library"
                  title="Мои темы"
                  summary={`${workspace.savedThemes.length} сохранённых копий`}
                >
                  <SavedThemes
                    workspace={workspace}
                    onChange={setWorkspace}
                    onSelect={() => {
                      setPaletteRevision((value) => value + 1);
                      setCopied(false);
                      setStatus("");
                    }}
                  />
                </SettingsSection>
                <SettingsSection
                  value="mode"
                  title="Режим"
                  summary={theme.mode === "dark" ? "Тёмный" : "Светлый"}
                >
                  <fieldset>
                    <legend className="sr-only">Режим</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(["dark", "light"] as const).map((mode) => (
                        <Button
                          key={mode}
                          onClick={() => patch({ mode })}
                          aria-pressed={theme.mode === mode}
                          variant="default"
                          className={`min-h-11 gap-2 border-white/15 px-2 text-sm ${theme.mode === mode ? "bg-[#d3ed9a] text-[#182112] hover:bg-[#e0f6b7]" : "bg-transparent text-[#c5d1b9] hover:bg-white/5"}`}
                        >
                          {mode === "dark" ? (
                            <Moon size={16} />
                          ) : (
                            <Sun size={16} />
                          )}{" "}
                          {mode === "dark" ? "Тёмный" : "Светлый"}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#b1bda7]">
                      Цвета светлого и тёмного режимов независимы. Шрифт,
                      размеры и отступы общие.
                    </p>
                  </fieldset>
                </SettingsSection>
                <SettingsSection
                  value="colors"
                  title="Цвета и пресеты"
                  summary={`${theme.mode === "dark" ? "Тёмная" : "Светлая"} палитра · ${theme.palettes[theme.mode].primary.toUpperCase()}`}
                >
                  <PaletteEditor
                    key={paletteRevision}
                    theme={theme}
                    onChange={(palette) => patch({ palette })}
                  />
                </SettingsSection>
                <SettingsSection
                  value="typography"
                  title="Типографика"
                  summary={`${theme.typography.font === "System" ? "Системный" : theme.typography.font} · ${theme.typography.fontSize} px`}
                >
                  <TypographyEditor
                    value={theme.typography}
                    onChange={(typography) => patch({ typography })}
                  />
                </SettingsSection>
                <SettingsSection
                  value="layout"
                  title="Размеры и отступы"
                  summary={`Радиус ${theme.shape.radius} px · высота от ${theme.layout.controlHeight} px`}
                >
                  <LayoutEditor theme={theme} onChange={patch} />
                </SettingsSection>
              </Accordion>
            </div>
            <div className="mt-7 space-y-3 border-t border-white/10 pt-5">
              <p
                role="status"
                className={`text-sm leading-6 ${storageOk ? "text-[#b1bda7]" : "text-[#ffd29c]"}`}
              >
                {storageMessage}
              </p>
              {(blocked || !storageOk) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={retrySaving}
                  className="h-auto min-h-11 border-white/20 bg-transparent px-3 py-2 text-sm whitespace-normal"
                >
                  {blocked
                    ? "Заменить повреждённые данные текущими"
                    : "Повторить сохранение"}
                </Button>
              )}
              <p className="text-sm leading-6 text-[#b1bda7]">
                Скачайте JSON для резервной копии текущей темы. Очистка данных
                браузера удаляет локальные темы.
              </p>
            </div>
          </aside>
          <section className="min-w-0" aria-label="Предпросмотр и экспорт">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex gap-1 rounded-lg border border-white/10 bg-[#171c17] p-1"
                aria-label="Вид предпросмотра"
              >
                {[
                  { value: "components", label: "Компоненты", icon: Layers3 },
                  { value: "css", label: "CSS", icon: Code2 },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    variant="ghost"
                    aria-pressed={view === tab.value}
                    onClick={() => setView(tab.value as typeof view)}
                    className={`min-h-10 gap-2 px-3 text-sm ${view === tab.value ? "bg-[#343e2a] text-[#e4efd9]" : "text-[#b5c2a8]"}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </Button>
                ))}
              </div>
              {view === "components" && (
                <div
                  role="group"
                  aria-label="Ширина предпросмотра"
                  className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-[#171c17] p-1"
                >
                  <Button
                    variant="ghost"
                    aria-pressed={previewWidth === "wide"}
                    onClick={() => setPreviewWidth("wide")}
                    className={`min-h-10 gap-2 px-3 text-sm ${previewWidth === "wide" ? "bg-[#343e2a] text-[#e4efd9]" : "text-[#b5c2a8]"}`}
                  >
                    <Monitor size={16} />
                    Широкий
                  </Button>
                  <Button
                    variant="ghost"
                    aria-pressed={previewWidth === "narrow"}
                    onClick={() => setPreviewWidth("narrow")}
                    className={`min-h-10 gap-2 px-3 text-sm ${previewWidth === "narrow" ? "bg-[#343e2a] text-[#e4efd9]" : "text-[#b5c2a8]"}`}
                  >
                    <Smartphone size={16} />
                    Узкий
                  </Button>
                </div>
              )}
              <span className="font-mono text-xs leading-6 text-[#c0d4a7]">
                shadcn/ui · Nova
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/15">
              {view === "components" ? (
                <div className="bg-[#0b0e0a] p-2 sm:p-4">
                  <p className="mb-3 text-sm leading-6 text-[#b1bda7]">
                    {previewWidth === "narrow"
                      ? "Узкий вид: до 390 px. На небольшом экране ширина подстраивается под доступное место."
                      : "Широкий вид: вся доступная ширина. Компоненты перестраиваются по ширине области предпросмотра."}
                  </p>
                  <div
                    className={`mx-auto w-full rounded-lg border border-white/10 ${previewWidth === "narrow" ? "max-w-97.5" : "max-w-none"}`}
                  >
                    <ThemePreview
                      theme={theme}
                      narrowView={previewWidth === "narrow"}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#121611] p-5">
                  <h2 className="mb-4 text-lg font-medium">
                    CSS-переменные темы
                  </h2>
                  <pre className="max-h-175 overflow-auto rounded-lg border border-white/10 bg-[#0d100c] p-4 font-mono text-sm leading-7 whitespace-pre-wrap wrap-break-word text-[#cce4ac]">
                    <code>{exportTheme(theme)}</code>
                  </pre>
                  <p className="mt-4 text-sm leading-7 text-[#b1bda7]">
                    CSS содержит оба режима, слой токенов Tailwind v4 и стили
                    компонентов. Импортируйте файл в основной CSS после
                    Tailwind/shadcn и пересоберите свой проект. Контейнеру
                    добавьте <code>lepear-theme</code> и{" "}
                    <code>data-theme="light"</code> или{" "}
                    <code>data-theme="dark"</code>; для тёмного режима также
                    класс <code>dark</code>. Порталы меню и диалогов должны
                    находиться внутри контейнера темы. Для Geist отдельно
                    подключите <code>@fontsource-variable/geist</code>. Пример
                    подключения: <code>examples/theme-integration</code> в
                    проекте.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => copy("css")}
                variant="outline"
                className="min-h-11 gap-2 border-white/20 bg-[#171c17] px-4 text-sm"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                {copied ? "Скопировано" : "Копировать CSS"}
              </Button>
              <Button
                type="button"
                onClick={() => copy("json")}
                variant="outline"
                className="min-h-11 gap-2 border-white/20 bg-[#171c17] px-4 text-sm"
              >
                <Copy size={16} />
                Копировать JSON
              </Button>
              <Button
                onClick={() => download("css")}
                className="min-h-11 gap-2 bg-[#d3ed9a] px-4 text-sm text-[#182112] hover:bg-[#e0f6b7]"
              >
                <Download size={16} />
                Скачать CSS
              </Button>
              <Button
                onClick={() => download("json")}
                className="min-h-11 gap-2 bg-[#d3ed9a] px-4 text-sm text-[#182112] hover:bg-[#e0f6b7]"
              >
                <Download size={16} />
                Скачать JSON
              </Button>
            </div>
            {manualCopy !== null && (
              <div className="mt-4">
                <p className="mb-2 text-sm leading-6 text-[#b1bda7]">
                  Текст для ручного копирования (весь текст выделяется при
                  фокусе):
                </p>
                <Textarea
                  aria-label="Экспорт для ручного копирования"
                  readOnly
                  value={manualCopy}
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-56 field-sizing-fixed font-mono text-sm md:text-sm"
                />
              </div>
            )}
            <ThemeImport
              onImport={(imported) => {
                setWorkspace((current) => ({
                  ...current,
                  theme: imported,
                  selectedId: null,
                }));
                setPaletteRevision((value) => value + 1);
                setCopied(false);
                setManualCopy(null);
                setStatus(
                  "JSON импортирован в рабочий черновик. Именованные копии сохранены.",
                );
              }}
            />
            <p
              className="mt-4 min-h-6 text-sm leading-6 text-[#c4dab0]"
              role="status"
            >
              {status}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
