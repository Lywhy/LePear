import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsRange } from "@/components/editor/settings-range";
import { SelectionFeedback } from "@/components/editor/selection-feedback";
import { controlClasses as controls } from "@/components/editor/control-classes";
import {
  createInitialTheme,
  themeLimits,
  effectiveControlHeight,
  type SiteTheme,
  type ThemeLayout,
  type ThemeUpdate,
} from "@/lib/site-theme";

const densities: { label: string; layout: ThemeLayout }[] = [
  {
    label: "Компактно",
    layout: {
      controlHeight: 40,
      controlPaddingInline: 8,
      componentPadding: 12,
      componentGap: 8,
    },
  },
  { label: "Обычно", layout: createInitialTheme().layout },
  {
    label: "Просторно",
    layout: {
      controlHeight: 56,
      controlPaddingInline: 24,
      componentPadding: 32,
      componentGap: 24,
    },
  },
];
const settings = [
  {
    key: "radius",
    label: "Закругление",
    hint: "Карточки и диалоги используют полный радиус; кнопки и поля — 70%, мелкие детали — 50%.",
  },
  {
    key: "controlHeight",
    label: "Минимальная высота",
    hint: "Общая для кнопок, полей и выбора. Для крупного или многострочного текста высота увеличивается автоматически.",
  },
  {
    key: "controlPaddingInline",
    label: "Отступ внутри контролов",
    hint: "Горизонтальное пространство внутри кнопок, полей и пунктов меню.",
  },
  {
    key: "componentPadding",
    label: "Отступ внутри блоков",
    hint: "Внутренние отступы карточек, диалога и области предпросмотра.",
  },
  {
    key: "componentGap",
    label: "Расстояние между элементами",
    hint: "Промежутки сетки, форм и групп действий. Также определяет вертикальные отступы контролов и ячеек таблицы.",
  },
] as const;

export function LayoutEditor({
  theme,
  onChange,
}: {
  theme: SiteTheme;
  onChange: (update: ThemeUpdate) => void;
}) {
  const activeDensity = densities.find((density) =>
    (Object.keys(density.layout) as (keyof ThemeLayout)[]).every(
      (key) => density.layout[key] === theme.layout[key],
    ),
  );
  const safeHeight = effectiveControlHeight(theme);
  return (
    <fieldset className="min-w-0 space-y-5 border-t border-shell-divider/15 pt-6">
      <legend className="px-1 text-base font-medium">Размеры и отступы</legend>
      <div
        role="group"
        aria-label="Плотность компонентов"
        className="flex flex-wrap gap-2"
      >
        {densities.map((density) => (
          <Button
            key={density.label}
            type="button"
            variant="outline"
            aria-pressed={activeDensity?.label === density.label}
            onClick={() => onChange({ layout: { ...density.layout } })}
            className={
              controls.action +
              (activeDensity?.label === density.label
                ? " border-shell-accent/50 bg-shell-hover"
                : "")
            }
          >
            {activeDensity?.label === density.label && (
              <span className="grid size-4 shrink-0 place-items-center">
                <SelectionFeedback className="inline-flex">
                  <Check size={16} aria-hidden="true" />
                </SelectionFeedback>
              </span>
            )}
            {density.label}
          </Button>
        ))}
      </div>
      <p className="text-sm leading-6 text-shell-muted">
        {activeDensity
          ? `Плотность: ${activeDensity.label.toLowerCase()}.`
          : "Своя плотность."}{" "}
        Вариант плотности меняет только четыре параметра отступов и высоты.
        Закругление и типографика сохраняются.
      </p>
      {settings.map((setting) => (
        <SettingsRange
          key={setting.key}
          label={setting.label}
          hint={setting.hint}
          value={
            setting.key === "radius"
              ? theme.shape.radius
              : theme.layout[setting.key]
          }
          {...themeLimits[setting.key]}
          unit="px"
          onChange={(number) =>
            onChange(
              setting.key === "radius"
                ? { shape: { radius: number } }
                : { layout: { [setting.key]: number } },
            )
          }
        />
      ))}
      <p className="rounded-lg border border-shell-divider/15 p-3 text-sm leading-6 text-shell-success">
        Расчётный минимум высоты: {safeHeight} px
        {safeHeight > theme.layout.controlHeight
          ? " — увеличен под текущий размер текста и межстрочный интервал"
          : ""}
        . Многострочные кнопки могут быть выше.
      </p>
      <Button
        type="button"
        variant="outline"
        className={controls.action + " w-full"}
        onClick={() => {
          const initial = createInitialTheme();
          onChange({ shape: initial.shape, layout: initial.layout });
        }}
      >
        <RotateCcw size={16} className="shrink-0" />
        Сбросить размеры
      </Button>
      <p className="text-sm leading-6 text-shell-muted">
        Параметры общие для обоих режимов и действуют только внутри
        предпросмотра. Переключатель остаётся овальным, аватары — круглыми.
        Толщина границ и тени заданы компонентами.
      </p>
    </fieldset>
  );
}
