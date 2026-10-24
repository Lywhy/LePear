import { useId, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInitialTheme,
  themeColors,
  type SiteTheme,
  type ThemePalette,
} from "@/lib/site-theme";
import {
  colorPresets,
  contrastPairs,
  normalizeColor,
  paletteContrast,
} from "@/lib/theme-palettes";

const groups: {
  name: string;
  fields: { key: keyof ThemePalette; label: string }[];
}[] = [
  {
    name: "Фон и поверхности",
    fields: [
      { key: "background", label: "Фон страницы" },
      { key: "card", label: "Поверхность карточки" },
      { key: "popover", label: "Поверхность меню и диалога" },
      { key: "muted", label: "Приглушённый фон" },
    ],
  },
  {
    name: "Текст",
    fields: [
      { key: "foreground", label: "Основной текст" },
      { key: "cardForeground", label: "Текст карточки" },
      { key: "popoverForeground", label: "Текст меню и диалога" },
      { key: "mutedForeground", label: "Приглушённый текст" },
    ],
  },
  {
    name: "Кнопки и состояния",
    fields: [
      { key: "primaryForeground", label: "Текст основной кнопки" },
      { key: "secondary", label: "Вторичная кнопка" },
      { key: "secondaryForeground", label: "Текст вторичной кнопки" },
      { key: "accent", label: "Выделение и наведение" },
      { key: "accentForeground", label: "Текст выделения" },
      { key: "destructive", label: "Ошибка и опасное действие" },
    ],
  },
  {
    name: "Границы и фокус",
    fields: [
      { key: "border", label: "Границы" },
      { key: "input", label: "Граница поля ввода" },
      { key: "ring", label: "Кольцо фокуса" },
    ],
  },
];

function ColorField({
  label,
  value,
  opaque = false,
  onChange,
}: {
  label: string;
  value: string;
  opaque?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const [field, setField] = useState({
    source: value,
    draft: value.toUpperCase(),
    error: "",
  });
  // Adjust local input state only when an external palette update changes this token.
  if (field.source !== value) {
    setField({ source: value, draft: value.toUpperCase(), error: "" });
  }
  const { draft, error } = field;
  function edit(input: string) {
    const color = normalizeColor(input, opaque);
    setField({
      source: value,
      draft: input,
      error: color
        ? ""
        : opaque
          ? "Введите #RRGGBB, например #1265B0."
          : "Введите #RRGGBB или #RRGGBBAA (с прозрачностью).",
    });
    if (color) onChange(color);
  }
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-2 text-sm leading-5">
        {label}
      </Label>
      <div className="flex min-w-0 gap-2">
        <Input
          type="color"
          value={value.slice(0, 7)}
          aria-label={`${label}: выбрать цвет`}
          onChange={(e) => edit(e.target.value + value.slice(7))}
          className="h-11 w-12 shrink-0 cursor-pointer p-1"
        />
        <Input
          id={id}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          maxLength={24}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => edit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setField({
                source: value,
                draft: value.toUpperCase(),
                error: "",
              });
            }
          }}
          className="h-11 min-w-0 flex-1 font-mono text-sm"
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm leading-5 text-[#ffb4b0]"
          role="status"
        >
          {error} Тема сохраняет последний корректный цвет. Escape — отменить
          ввод.
        </p>
      )}
    </div>
  );
}

export function PaletteEditor({
  theme,
  onChange,
}: {
  theme: SiteTheme;
  onChange: (colors: Partial<ThemePalette>) => void;
}) {
  const [revision, setRevision] = useState(0);
  const palette = theme.palettes[theme.mode];
  const selected = colorPresets.find((preset) =>
    (Object.keys(palette) as (keyof ThemePalette)[]).every(
      (key) => preset.palettes[theme.mode][key] === palette[key],
    ),
  );
  const warnings = contrastPairs
    .map((pair) => ({
      ...pair,
      ratio: paletteContrast(palette, theme.mode, pair.text, pair.surface),
    }))
    .filter((pair) => pair.ratio < 4.5);
  const focusContrast = paletteContrast(
    palette,
    theme.mode,
    "ring",
    "background",
  );
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Цветовой пресет</legend>
        <div className="grid grid-cols-2 gap-2">
          {colorPresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              aria-pressed={selected?.id === preset.id}
              title={preset.description}
              onClick={() => {
                onChange({ ...preset.palettes[theme.mode] });
                setRevision((n) => n + 1);
              }}
              className={`h-auto min-h-16 flex-col items-start gap-2 border-white/20 px-3 py-3 text-sm ${selected?.id === preset.id ? "bg-[#343e2a] text-[#edf1e7]" : "bg-transparent text-[#c5d1b9]"}`}
            >
              <span className="flex items-center gap-2">
                {preset.name}
                {selected?.id === preset.id && (
                  <Check size={14} aria-hidden="true" />
                )}
              </span>
              <span className="flex gap-1" aria-hidden="true">
                {(["background", "card", "primary"] as const).map((key) => (
                  <span
                    key={key}
                    className="size-4 rounded-full border border-white/30"
                    style={{
                      backgroundColor: preset.palettes[theme.mode][key],
                    }}
                  />
                ))}
              </span>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#b1bda7]">
          {selected ? `Палитра: ${selected.name}.` : "Своя палитра."} Пресет
          заменяет все цвета только{" "}
          {theme.mode === "dark" ? "тёмного" : "светлого"} режима. Шрифт и
          размеры сохраняются.
        </p>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Основной акцент</legend>
        <div className="mb-4 flex flex-wrap gap-2">
          {themeColors.map((color) => (
            <button
              key={color.name}
              type="button"
              aria-label={`Акцент ${color.name}`}
              aria-pressed={palette.primary === color.value}
              onClick={() => {
                onChange({ primary: color.value });
                setRevision((n) => n + 1);
              }}
              className={`grid size-11 place-items-center rounded-full border-4 border-[#171c17] text-[#182112] outline-offset-1 focus-visible:outline-2 focus-visible:outline-[#edf1e7] ${color.className} ${palette.primary === color.value ? "outline-2 outline-[#d3ed9a]" : ""}`}
            >
              {palette.primary === color.value && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <ColorField
          key={`${theme.mode}-primary-${revision}`}
          label="Свой акцент"
          value={palette.primary}
          opaque
          onChange={(primary) => onChange({ primary })}
        />
        <p className="mt-3 text-sm leading-6 text-[#b1bda7]">
          При изменении акцента текст основной кнопки подбирается автоматически,
          а кольцо фокуса принимает цвет акцента. Ниже их можно изменить
          отдельно.
        </p>
      </fieldset>
      {groups.map((group) => (
        <details
          key={group.name}
          className="group rounded-lg border border-white/15 p-3"
        >
          <summary className="cursor-pointer rounded text-sm leading-6 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]">
            {group.name}
          </summary>
          <div className="mt-4 space-y-4">
            {group.fields.map((field) => (
              <ColorField
                key={`${theme.mode}-${field.key}-${revision}`}
                label={field.label}
                value={palette[field.key]}
                onChange={(value) => onChange({ [field.key]: value })}
              />
            ))}
          </div>
        </details>
      ))}
      <div className="rounded-lg border border-white/15 p-3 text-sm leading-6">
        <h3 className="font-medium">Читаемость цветов</h3>
        <p className="mt-2 text-[#b1bda7]">
          Ориентир для текстовых пар — 4.5:1. Это подсказка по базовым цветам, а
          не полная проверка доступности. Прозрачность учитывается поверх фона
          режима; hover и disabled смотрите в превью.
        </p>
        {warnings.length > 0 ? (
          <ul className="mt-3 space-y-2 text-[#ffd29c]">
            {warnings.map((pair) => (
              <li key={pair.label}>
                {pair.label}: {pair.ratio.toFixed(2)}:1 — увеличьте контраст.
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[#c4dab0]">
            Расчётные текстовые пары: не ниже 4.5:1.
          </p>
        )}
        {focusContrast < 3 && (
          <p className="mt-3 text-[#ffd29c]">
            Кольцо фокуса / фон: {focusContrast.toFixed(2)}:1. Рекомендуется
            контраст от 3:1.
          </p>
        )}
      </div>
      <Button
        variant="outline"
        className="h-auto min-h-11 w-full gap-2 border-white/20 bg-transparent px-3 py-2 text-sm whitespace-normal"
        onClick={() => {
          onChange(createInitialTheme().palettes[theme.mode]);
          setRevision((n) => n + 1);
        }}
      >
        <RotateCcw size={16} className="shrink-0" />
        Исходные цвета режима
      </Button>
      <p className="text-sm leading-6 text-[#b1bda7]">
        Сброс цветов возвращает палитру «Лес» в выбранном режиме. Второй режим,
        типографика и размеры сохраняются.
      </p>
    </div>
  );
}
