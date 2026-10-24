import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Download,
  Layers3,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/landing/shared";
import { ThemePreview } from "@/components/theme-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  exportTheme,
  initialTheme,
  themeColors,
  type SiteTheme,
} from "@/lib/site-theme";

export default function EditorPage() {
  const [theme, setTheme] = useState<SiteTheme>({ ...initialTheme });
  const [view, setView] = useState<"components" | "css">("components");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Редактор темы — LePear";
    return () => {
      document.title = "LePear — ваш сайт, ваш характер";
    };
  }, []);
  function patch(update: Partial<SiteTheme>) {
    setTheme((current) => ({ ...current, ...update }));
    setCopied(false);
    setStatus("");
  }
  function download(format: "css" | "json") {
    const data =
      format === "css"
        ? exportTheme(theme)
        : JSON.stringify({ version: 1, theme }, null, 2);
    const url = URL.createObjectURL(
      new Blob([data], {
        type: format === "css" ? "text/css" : "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `lepear-theme.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Тема скачана: ${format.toUpperCase()}`);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(exportTheme(theme));
      setCopied(true);
      setStatus("CSS темы скопирован");
    } catch {
      setStatus("Копирование недоступно. Скачайте CSS кнопкой рядом.");
    }
  }
  return (
    <div className="dark min-h-dvh bg-[#0e100f] font-sans text-[#edf1e7]">
      <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-8">
        <Brand />
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
              setTheme({ ...initialTheme });
              setCopied(false);
              setStatus("Исходная тема восстановлена");
            }}
            className="h-11 gap-2 border-white/20 bg-transparent px-4 text-sm text-[#dbe4d2] hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Сбросить тему
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
            <div className="space-y-7">
              <fieldset>
                <legend className="mb-3 text-sm font-medium">Режим</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["dark", "light"] as const).map((mode) => (
                    <Button
                      key={mode}
                      onClick={() => patch({ mode })}
                      aria-pressed={theme.mode === mode}
                      variant="default"
                      className={`min-h-11 gap-2 border-white/15 px-2 text-sm ${theme.mode === mode ? "bg-[#d3ed9a] text-[#182112] hover:bg-[#e0f6b7]" : "bg-transparent text-[#c5d1b9] hover:bg-white/5"}`}
                    >
                      {mode === "dark" ? <Moon size={16} /> : <Sun size={16} />}{" "}
                      {mode === "dark" ? "Тёмный" : "Светлый"}
                    </Button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-medium">
                  Акцентный цвет
                </legend>
                <div className="flex flex-wrap gap-2">
                  {themeColors.map((color) => (
                    <button
                      key={color.name}
                      aria-label={`Цвет ${color.name}`}
                      aria-pressed={theme.accent === color.value}
                      onClick={() => patch({ accent: color.value })}
                      className={`grid size-10 place-items-center rounded-full border-4 border-[#171c17] text-[#182112] outline-offset-1 focus-visible:outline-2 focus-visible:outline-[#edf1e7] ${color.className} ${theme.accent === color.value ? "outline-2 outline-[#d3ed9a]" : ""}`}
                    >
                      {theme.accent === color.value && <Check size={18} />}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="editor-color" className="mb-2 text-sm">
                    Свой цвет
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="editor-color"
                      type="color"
                      value={theme.accent}
                      onChange={(e) => patch({ accent: e.target.value })}
                      className="h-11 w-16 cursor-pointer p-1"
                    />
                    <span className="font-mono text-sm text-[#c5d1b9]">
                      {theme.accent.toUpperCase()}
                    </span>
                  </div>
                </div>
              </fieldset>
              <div>
                <Label htmlFor="editor-font" className="mb-3 text-sm">
                  Шрифт
                </Label>
                <select
                  id="editor-font"
                  value={theme.font}
                  onChange={(e) =>
                    patch({ font: e.target.value as SiteTheme["font"] })
                  }
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-[#22291e] px-3 text-base text-[#edf1e7] outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#d3ed9a]"
                >
                  <option>Geist</option>
                  <option value="System">Системный</option>
                  <option>Georgia</option>
                </select>
              </div>
              <div>
                <div className="mb-4 flex justify-between gap-3 text-sm">
                  <span id="font-size-label">Размер текста</span>
                  <output htmlFor="font-size">{theme.fontSize} px</output>
                </div>
                <Slider
                  id="font-size"
                  aria-labelledby="font-size-label"
                  min={14}
                  max={20}
                  step={1}
                  value={[theme.fontSize]}
                  onValueChange={(value) =>
                    patch({
                      fontSize: typeof value === "number" ? value : value[0]!,
                    })
                  }
                  className="py-3 [&_[data-slot=slider-range]]:bg-[#d3ed9a]"
                />
                <div className="mt-2 flex justify-between text-xs text-[#b1bda7]">
                  <span>14 px</span>
                  <span>20 px</span>
                </div>
              </div>
              <div>
                <div className="mb-4 flex justify-between gap-3 text-sm">
                  <span id="radius-label">Закругление</span>
                  <output htmlFor="editor-radius">{theme.radius} px</output>
                </div>
                <Slider
                  id="editor-radius"
                  aria-labelledby="radius-label"
                  min={0}
                  max={24}
                  step={1}
                  value={[theme.radius]}
                  onValueChange={(value) =>
                    patch({
                      radius: typeof value === "number" ? value : value[0]!,
                    })
                  }
                  className="py-3 [&_[data-slot=slider-range]]:bg-[#d3ed9a]"
                />
                <div className="mt-2 flex justify-between text-xs text-[#b1bda7]">
                  <span>Строго</span>
                  <span>Мягко</span>
                </div>
              </div>
            </div>
            <p className="mt-7 border-t border-white/10 pt-5 text-sm leading-6 text-[#b1bda7]">
              Настройки пока не сохраняются автоматически. Скачайте JSON, чтобы
              оставить копию.
            </p>
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
              <span className="font-mono text-xs leading-6 text-[#c0d4a7]">
                shadcn/ui · Nova
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/15">
              {view === "components" ? (
                <ThemePreview theme={theme} />
              ) : (
                <div className="bg-[#121611] p-5">
                  <h2 className="mb-4 text-lg font-medium">
                    CSS-переменные темы
                  </h2>
                  <pre className="max-h-[700px] overflow-auto rounded-lg border border-white/10 bg-[#0d100c] p-4 font-mono text-sm leading-7 whitespace-pre-wrap break-words text-[#cce4ac]">
                    <code>{exportTheme(theme)}</code>
                  </pre>
                  <p className="mt-4 text-sm leading-7 text-[#b1bda7]">
                    Подключите файл к проекту shadcn/ui с Tailwind CSS v4 и
                    добавьте класс{" "}
                    <code className="text-[#e2edcf]">lepear-theme</code>{" "}
                    контейнеру приложения. Для Geist также нужен установленный
                    шрифт.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={copy}
                variant="outline"
                className="min-h-11 gap-2 border-white/20 bg-[#171c17] px-4 text-sm"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                {copied ? "Скопировано" : "Копировать CSS"}
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
                variant="outline"
                className="min-h-11 gap-2 border-white/20 bg-[#171c17] px-4 text-sm"
              >
                <Download size={16} />
                Скачать JSON
              </Button>
            </div>
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

