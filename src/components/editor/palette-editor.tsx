import { MotionIcon } from "@/components/motion/motion-icon";
import { ColorField } from "@/components/editor/color-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId, useState } from "react";
import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function PaletteEditor({
  theme,
  onChange,
}: {
  theme: SiteTheme;
  onChange: (colors: Partial<ThemePalette>) => void;
}) {
  const id = useId();
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
        <Label htmlFor={id + "-preset"} className="sr-only">
          Выберите цветовой пресет
        </Label>
        <Select
          items={colorPresets.map((preset) => ({
            value: preset.id,
            label: preset.name,
          }))}
          value={selected?.id ?? null}
          onValueChange={(value) => {
            const preset = colorPresets.find((item) => item.id === value);
            if (!preset) return;
            onChange({ ...preset.palettes[theme.mode] });
            setRevision((n) => n + 1);
          }}
        >
          <SelectTrigger
            id={id + "-preset"}
            className={controls.trigger}
            aria-describedby={id + "-preset-help"}
          >
            <SelectValue placeholder="Своя палитра" />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className={controls.popup + " max-h-80"}
          >
            {colorPresets.map((preset) => (
              <SelectItem
                key={preset.id}
                value={preset.id}
                className={controls.option}
              >
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="min-w-0">{preset.name}</span>
                  <span aria-hidden="true" className="flex shrink-0 gap-1">
                    {(
                      ["background", "card", "primary", "foreground"] as const
                    ).map((key) => (
                      <span
                        key={key}
                        className="size-3.5 rounded-sm border border-shell-divider/20"
                        style={{
                          backgroundColor: preset.palettes[theme.mode][key],
                        }}
                      />
                    ))}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div aria-hidden="true" className="mt-3 grid grid-cols-4 gap-2">
          {(["background", "card", "primary", "foreground"] as const).map(
            (key) => (
              <span
                key={key}
                className="h-8 rounded-md border border-shell-divider/20"
                style={{ backgroundColor: palette[key] }}
              />
            ),
          )}
        </div>
        {selected && (
          <p className="mt-2 text-sm leading-6 text-shell-muted">
            {selected.description}.
          </p>
        )}
        <p
          id={id + "-preset-help"}
          className="mt-3 text-sm leading-6 text-shell-muted"
        >
          {selected ? "Палитра: " + selected.name + "." : "Своя палитра."}{" "}
          {colorPresets.length} готовых вариантов. Пресет заменяет все цвета
          только {theme.mode === "dark" ? "тёмного" : "светлого"} режима. Шрифт
          и размеры сохраняются.
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
              className={`grid size-11 place-items-center rounded-full transition-[filter] hover:brightness-110 motion-reduce:transition-none border-4 border-shell-surface text-shell-accent-ink outline-offset-1 focus-visible:outline-2 focus-visible:outline-shell-text ${color.className} ${palette.primary === color.value ? "outline-2 outline-shell-accent" : ""}`}
            >
              {palette.primary === color.value && (
                <SelectionFeedback className="inline-flex rounded-full bg-shell-deep p-0.5 text-white">
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
        <p className="mt-3 text-sm leading-6 text-shell-muted">
          При изменении акцента текст основной кнопки подбирается автоматически,
          а кольцо фокуса принимает цвет акцента. Ниже их можно изменить
          отдельно.
        </p>
      </fieldset>
      {groups.map((group) => (
        <details
          key={group.name}
          className="group rounded-xl border border-shell-divider/10 bg-shell-deep p-3"
        >
          <summary className="cursor-pointer rounded text-sm leading-6 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-shell-accent">
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
      <div className="rounded-xl border border-shell-divider/15 bg-shell-deep p-4 text-sm leading-6">
        <h3 className="flex items-center gap-2 font-medium">
          <span className="grid size-6 place-items-center rounded-md bg-shell-raised text-shell-accent">
            {warnings.length ? (
              <TriangleAlert size={16} aria-hidden="true" />
            ) : (
              <Check size={16} aria-hidden="true" />
            )}
          </span>
          Читаемость цветов
        </h3>
        <p className="mt-2 text-shell-muted">
          Ориентир для текстовых пар — 4.5:1. Это подсказка по базовым цветам, а
          не полная проверка доступности. Прозрачность учитывается поверх фона
          режима; hover и disabled смотрите в превью.
        </p>
        {warnings.length > 0 ? (
          <ul className="mt-3 space-y-2 text-shell-warning">
            {warnings.map((pair) => (
              <li
                key={pair.label}
                className="rounded-lg border border-shell-warning/20 bg-shell-warning/5 p-3"
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
          <p className="mt-3 text-shell-success">
            Расчётные текстовые пары: не ниже 4.5:1.
          </p>
        )}
        {focusContrast < 3 && (
          <p className="mt-3 text-shell-warning">
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
        <MotionIcon
          icon={RotateCcw}
          effect="turn"
          size={16}
          className="shrink-0"
        />
        Исходные цвета режима
      </Button>
      <p className="text-sm leading-6 text-shell-muted">
        Сброс цветов возвращает палитру «Лес» в выбранном режиме. Второй режим,
        типографика и размеры сохраняются.
      </p>
    </div>
  );
}
