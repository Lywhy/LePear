import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTransitions } from "@/lib/motion-presets";
import {
  Code2,
  Layers3,
  Monitor,
  Smartphone,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  ArrowUp,
  CircleCheck,
  AlertCircle,
  Sun,
} from "lucide-react";
import { ThemeImport } from "@/components/editor/theme-import";
import { ThemeExport } from "@/components/editor/theme-export";
import { TransferStatus } from "@/components/editor/transfer-status";
import { ThemePreview } from "@/components/theme-preview";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { SettingsSection } from "@/components/editor/settings-section";
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

export default function EditorPage() {
  const reduced = useReducedMotion();
  const previewTransition =
    reduced !== false ? { duration: 0 } : motionTransitions.feedback;
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
  const [statusTone, setStatusTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const [paletteRevision, setPaletteRevision] = useState(0);
  function jumpTo(id: string) {
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "auto" });
  }
  function patch(update: ThemeUpdate) {
    const result = updateTheme(theme, update);
    if (!result.success) {
      setStatusTone("error");
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
    setStatusTone("success");
    setStatus(`Тема скачана: ${format.toUpperCase()}`);
  }
  async function copy(format: "css" | "json" = "css") {
    const data =
      format === "css" ? exportTheme(theme) : JSON.stringify(theme, null, 2);
    try {
      await navigator.clipboard.writeText(data);
      setStatusTone("success");
      setCopied(format === "css");
      setManualCopy(null);
      setStatus(`${format.toUpperCase()} темы скопирован`);
    } catch {
      setStatusTone("warning");
      setCopied(false);
      setManualCopy(data);
      setStatus(
        "Буфер обмена недоступен. Выделите текст ниже и нажмите Ctrl+C / Cmd+C или скачайте файл.",
      );
    }
  }
  return (
    <div className="font-sans text-[#edf1e7]">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-10 lg:px-10">
        <div className="mb-6 grid items-start gap-5 lg:grid-cols-[1fr_auto] rounded-2xl border border-white/10 bg-[#121810] p-5 sm:mb-8 sm:p-6">
          <div>
            <p className="text-sm leading-6 font-medium tracking-wide text-[#b5c6a5]">
              LEPEAR / МАСТЕРСКАЯ ТЕМЫ
            </p>
            <h1 className="mt-2 font-[Arial_Black,Arial,sans-serif] text-3xl leading-tight font-black tracking-[-0.04em] sm:text-5xl">
              Редактор темы
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#b1bda7]">
              Настройте оформление и проверьте его на компонентах. Изменения
              применяются только к области предпросмотра.
            </p>
            <div
              className="mt-4 flex flex-wrap gap-2 text-sm leading-6 text-[#c5d1b9]"
              aria-label="Текущие параметры темы"
            >
              <span className="rounded-full border border-white/10 bg-[#22291e] px-3 py-1">
                {theme.mode === "dark" ? "Тёмный режим" : "Светлый режим"}
              </span>
              <span className="rounded-full border border-white/10 bg-[#22291e] px-3 py-1">
                {theme.typography.font === "System"
                  ? "Системный"
                  : theme.typography.font}{" "}
                · {theme.typography.fontSize} px
              </span>
              <span
                title={storageMessage}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 ${storageOk ? "text-[#c4dab0]" : "text-[#ffd29c]"}`}
              >
                {storageOk ? (
                  <CircleCheck size={15} aria-hidden="true" />
                ) : (
                  <AlertCircle size={15} aria-hidden="true" />
                )}
                {storageOk ? "Локальное хранение" : "Работа в памяти"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setTheme(createInitialTheme());
              setPaletteRevision((value) => value + 1);
              setCopied(false);
              setStatusTone("success");
              setStatus("Исходная тема восстановлена для обоих режимов");
            }}
            className="h-11 gap-2 border-white/20 bg-transparent px-4 text-sm text-[#dbe4d2] hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Сбросить всю тему
          </Button>
        </div>
        <nav
          aria-label="Быстрые переходы в редакторе"
          className="sticky top-0 z-30 mb-5 grid grid-cols-3 gap-1 rounded-xl border border-white/15 bg-[#121810] p-1 shadow-lg shadow-black/20 lg:hidden"
        >
          {[
            { id: "editor-settings", label: "Настройки" },
            { id: "editor-preview", label: "Результат" },
            { id: "editor-export", label: "Экспорт" },
          ].map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              aria-controls={item.id}
              onClick={() => jumpTo(item.id)}
              className="h-auto min-h-11 min-w-0 px-2 py-2 text-sm leading-6 text-[#dbe4d2] whitespace-normal focus-visible:ring-[#d3ed9a]/40"
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-8">
          <aside
            id="editor-settings"
            tabIndex={-1}
            className="min-w-0 scroll-mt-24 rounded-2xl border border-white/10 bg-[#121810] p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a] sm:p-4"
            aria-label="Настройки темы"
          >
            <div className="mb-3 px-1 pt-1">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <SlidersHorizontal
                  size={19}
                  className="text-[#c9dfa9]"
                  aria-hidden="true"
                />
                Параметры темы
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#b1bda7]">
                Открыто {openSettings.length} из {settingsSections.length}{" "}
                групп. Раскройте только нужные.
              </p>
            </div>
            <div className="space-y-3">
              <div
                className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-[#171c17] p-1"
                role="group"
                aria-label="Видимость блоков настроек"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenSettings([...settingsSections])}
                  className="min-h-11 px-2 text-sm text-[#c5d1b9] hover:bg-white/5"
                >
                  Раскрыть всё
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
                className="gap-3 **:data-[slot=accordion-content]:animate-none"
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
            <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-[#171c17] p-4">
              <TransferStatus
                message={storageMessage}
                tone={storageOk ? "success" : "warning"}
              />
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
          <section
            id="editor-preview"
            tabIndex={-1}
            className="min-w-0 scroll-mt-24 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]"
            aria-label="Предпросмотр и экспорт"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-[Arial_Black,Arial,sans-serif] text-xl font-black tracking-tight">
                  Результат
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#b1bda7]">
                  Изменения видны сразу и применяются только здесь.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => jumpTo("editor-settings")}
                className="min-h-11 gap-2 px-3 text-sm text-[#c5d1b9]"
              >
                <ArrowUp size={16} aria-hidden="true" />К настройкам
              </Button>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#171c17] p-2 lg:sticky lg:top-4 lg:z-20">
              <div
                className="flex min-w-0 flex-wrap gap-1 rounded-lg border border-white/10 bg-[#171c17] p-1"
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
                    aria-controls={
                      tab.value === "components"
                        ? "preview-components"
                        : "preview-css"
                    }
                    onClick={() => setView(tab.value as typeof view)}
                    className={`h-auto min-h-11 min-w-0 gap-2 px-3 py-2 text-sm whitespace-normal ${view === tab.value ? "bg-[#343e2a] text-[#e4efd9]" : "text-[#b5c2a8]"}`}
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
                    className={`h-auto min-h-11 min-w-0 gap-2 px-3 py-2 text-sm whitespace-normal ${previewWidth === "wide" ? "bg-[#343e2a] text-[#e4efd9]" : "text-[#b5c2a8]"}`}
                  >
                    <Monitor size={16} />
                    Широкий
                  </Button>
                  <Button
                    variant="ghost"
                    aria-pressed={previewWidth === "narrow"}
                    onClick={() => setPreviewWidth("narrow")}
                    className={`h-auto min-h-11 min-w-0 gap-2 px-3 py-2 text-sm whitespace-normal ${previewWidth === "narrow" ? "bg-[#343e2a] text-[#e4efd9]" : "text-[#b5c2a8]"}`}
                  >
                    <Smartphone size={16} />
                    Узкий
                  </Button>
                </div>
              )}
              <span className="px-2 text-sm leading-6 text-[#c0d4a7]">
                shadcn/ui · Nova
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#121810]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-sm leading-6">
                <span className="inline-flex items-center gap-2 text-[#edf1e7]">
                  <Layers3 size={16} aria-hidden="true" />
                  {view === "components" ? "Витрина темы" : "Код темы"}
                </span>
                <span className="text-[#b1bda7]">
                  {view === "components"
                    ? theme.mode === "dark"
                      ? "Тёмная палитра"
                      : "Светлая палитра"
                    : "CSS · оба режима"}
                </span>
              </div>
              <motion.div
                id="preview-components"
                hidden={view !== "components"}
                initial={false}
                animate={{ opacity: view === "components" ? 1 : 0.92 }}
                transition={previewTransition}
                className="bg-[#0b0e0a] p-2 sm:p-4"
              >
                <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6 text-[#b1bda7]">
                  {previewWidth === "narrow"
                    ? "Узкий вид: до 390 px. На небольшом экране ширина подстраивается под доступное место."
                    : "Широкий вид: вся доступная ширина. Компоненты перестраиваются по ширине области предпросмотра."}
                </p>
                <motion.div
                  initial={false}
                  animate={{ maxWidth: previewWidth === "narrow" ? 390 : 1600 }}
                  transition={previewTransition}
                  className="mx-auto w-full rounded-lg border border-white/10"
                >
                  <ThemePreview
                    theme={theme}
                    narrowView={previewWidth === "narrow"}
                  />
                </motion.div>
              </motion.div>
              <motion.div
                id="preview-css"
                hidden={view !== "css"}
                initial={false}
                animate={{ opacity: view === "css" ? 1 : 0.92 }}
                transition={previewTransition}
                className="bg-[#121611] p-4 sm:p-5"
              >
                <h2 className="mb-4 text-lg font-medium">
                  CSS-переменные темы
                </h2>
                <pre className="max-h-175 overflow-auto rounded-lg border border-white/10 bg-[#0d100c] p-4 font-mono text-sm leading-7 whitespace-pre-wrap wrap-break-word text-[#cce4ac]">
                  <code>{exportTheme(theme)}</code>
                </pre>
                <p className="mt-4 text-sm leading-7 text-[#b1bda7]">
                  Код содержит обе палитры и стили компонентов. Скачивание,
                  копирование и раскрываемая инструкция подключения находятся
                  ниже, в блоке «Перенос темы».
                </p>
              </motion.div>
            </div>
            <section
              id="editor-export"
              tabIndex={-1}
              aria-labelledby="editor-export-title"
              className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-[#121810] p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a] sm:p-5"
            >
              <h2
                id="editor-export-title"
                className="font-[Arial_Black,Arial,sans-serif] text-xl font-black tracking-tight"
              >
                Перенос темы
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#b1bda7]">
                Скачайте тему для своего сайта или сохраните резервную копию.
              </p>
              <ThemeExport
                onCopy={copy}
                onDownload={download}
                copied={copied}
                manualCopy={manualCopy}
                status={status}
                statusTone={statusTone}
              />
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
                  setStatus("");
                }}
              />
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
