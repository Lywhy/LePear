import { useId } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  const id = useId();
  const activeDensity = densities.find((density) =>
    (Object.keys(density.layout) as (keyof ThemeLayout)[]).every(
      (key) => density.layout[key] === theme.layout[key],
    ),
  );
  const safeHeight = effectiveControlHeight(theme);
  return (
    <fieldset className="min-w-0 space-y-5 border-t border-white/15 pt-6">
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
            className={`h-auto min-h-11 px-3 py-2 text-sm ${activeDensity?.label === density.label ? "border-[#d3ed9a]/50 bg-[#343e2a] text-[#edf1e7]" : "border-white/20 bg-transparent text-[#c5d1b9]"}`}
          >
            {density.label}
          </Button>
        ))}
      </div>
      <p className="text-sm leading-6 text-[#b1bda7]">
        {activeDensity
          ? `Плотность: ${activeDensity.label.toLowerCase()}.`
          : "Своя плотность."}{" "}
        Вариант плотности меняет только четыре параметра отступов и высоты.
        Закругление и типографика сохраняются.
      </p>
      {settings.map((setting) => {
        const current =
          setting.key === "radius"
            ? theme.shape.radius
            : theme.layout[setting.key];
        const limits = themeLimits[setting.key];
        const controlId = `${id}-${setting.key}`;
        return (
          <div key={setting.key}>
            <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
              <span id={`${controlId}-label`}>{setting.label}</span>
              <output htmlFor={controlId} className="font-mono">
                {current} px
              </output>
            </div>
            <Slider
              id={controlId}
              aria-labelledby={`${controlId}-label`}
              aria-describedby={`${controlId}-hint`}
              min={limits.min}
              max={limits.max}
              step={limits.step}
              value={[current]}
              onValueChange={(next) => {
                const value = typeof next === "number" ? next : next[0];
                if (value === undefined) return;
                onChange(
                  setting.key === "radius"
                    ? { shape: { radius: value } }
                    : { layout: { [setting.key]: value } },
                );
              }}
              className="py-3 **:data-[slot=slider-range]:bg-[#d3ed9a]"
            />
            <div className="mt-1 flex justify-between text-sm text-[#b1bda7]">
              <span>{limits.min} px</span>
              <span>{limits.max} px</span>
            </div>
            <p
              id={`${controlId}-hint`}
              className="mt-2 text-sm leading-6 text-[#b1bda7]"
            >
              {setting.hint}
            </p>
          </div>
        );
      })}
      <p className="rounded-lg border border-white/15 p-3 text-sm leading-6 text-[#c4dab0]">
        Расчётный минимум высоты: {safeHeight} px
        {safeHeight > theme.layout.controlHeight
          ? " — увеличен под текущий размер текста и межстрочный интервал"
          : ""}
        . Многострочные кнопки могут быть выше.
      </p>
      <Button
        type="button"
        variant="outline"
        className="h-auto min-h-11 w-full gap-2 border-white/20 bg-transparent px-3 py-2 text-sm whitespace-normal"
        onClick={() => {
          const initial = createInitialTheme();
          onChange({ shape: initial.shape, layout: initial.layout });
        }}
      >
        <RotateCcw size={16} className="shrink-0" />
        Сбросить размеры
      </Button>
      <p className="text-sm leading-6 text-[#b1bda7]">
        Параметры общие для обоих режимов и действуют только внутри
        предпросмотра. Переключатель остаётся овальным, аватары — круглыми.
        Толщина границ и тени заданы компонентами.
      </p>
    </fieldset>
  );
}
