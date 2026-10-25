import { useId, useState } from "react";
import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectionFeedback } from "@/components/editor/selection-feedback";
import { controlClasses as controls } from "@/components/editor/control-classes";
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
      source: color ?? value,
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
          className={controls.input + " w-12 shrink-0 cursor-pointer p-1"}
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
          className={
            controls.input + " flex-1 font-mono text-base tabular-nums"
          }
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
              className={
                controls.action +
                " min-h-24 flex-col items-stretch gap-3 px-3 py-3 " +
                (selected?.id === preset.id
                  ? " border-[#d3ed9a]/60 bg-[#2b3426]"
                  : " bg-[#121810]")
              }
            >
              <span className="flex w-full items-center justify-between gap-2 font-medium">
                {preset.name}
                {selected?.id === preset.id && (
                  <SelectionFeedback className="inline-flex">
                    <Check size={16} aria-hidden="true" />
                  </SelectionFeedback>
                )}
              </span>
              <span
                className="grid w-full grid-cols-4 gap-1"
                aria-hidden="true"
              >
                {(["background", "card", "primary", "foreground"] as const).map(
                  (key) => (
                    <span
                      key={key}
                      className="h-7 rounded-md border border-white/20"
                      style={{
                        backgroundColor: preset.palettes[theme.mode][key],
                      }}
                    />
                  ),
                )}
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
              className={`grid size-11 place-items-center rounded-full transition-[filter] hover:brightness-110 motion-reduce:transition-none border-4 border-[#171c17] text-[#182112] outline-offset-1 focus-visible:outline-2 focus-visible:outline-[#edf1e7] ${color.className} ${palette.primary === color.value ? "outline-2 outline-[#d3ed9a]" : ""}`}
            >
              {palette.primary === color.value && (
                <SelectionFeedback className="inline-flex rounded-full bg-[#10160f] p-0.5 text-white">
                  <Check size={16} aria-hidden="true" />
                </SelectionFeedback>
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
          className="group rounded-xl border border-white/10 bg-[#121810] p-3"
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
      <div className="rounded-xl border border-white/15 bg-[#10160f] p-4 text-sm leading-6">
        <h3 className="flex items-center gap-2 font-medium">
          <span className="grid size-6 place-items-center rounded-md bg-[#22291e] text-[#d3ed9a]">
            {warnings.length ? (
              <TriangleAlert size={16} aria-hidden="true" />
            ) : (
              <Check size={16} aria-hidden="true" />
            )}
          </span>
          Читаемость цветов
        </h3>
        <p className="mt-2 text-[#b1bda7]">
          Ориентир для текстовых пар — 4.5:1. Это подсказка по базовым цветам, а
          не полная проверка доступности. Прозрачность учитывается поверх фона
          режима; hover и disabled смотрите в превью.
        </p>
        {warnings.length > 0 ? (
          <ul className="mt-3 space-y-2 text-[#ffd29c]">
            {warnings.map((pair) => (
              <li
                key={pair.label}
                className="rounded-lg border border-[#ffd29c]/20 bg-[#ffd29c]/5 p-3"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span>{pair.label}</span>
                  <span className="font-mono tabular-nums">
                    {pair.ratio.toFixed(2)}:1
                  </span>
                </span>
                <span className="mt-1 block">Увеличьте контраст.</span>
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
        className={controls.action + " w-full"}
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
