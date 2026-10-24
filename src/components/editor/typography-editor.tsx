import { useId } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInitialTheme,
  fontFamilies,
  themeLimits,
  type ThemeFont,
  type ThemeTypography,
} from "@/lib/site-theme";

const fonts: { value: ThemeFont; label: string; description: string }[] = [
  {
    value: "Geist",
    label: "Geist",
    description:
      "Локальный variable-шрифт с кириллицей. При недоступности: system-ui, Arial, sans-serif.",
  },
  {
    value: "System",
    label: "Системный",
    description:
      "Шрифт интерфейса вашей ОС. Fallback: Segoe UI, Arial, sans-serif. Доступные начертания зависят от системы.",
  },
  {
    value: "Georgia",
    label: "Georgia",
    description:
      "Шрифт с устройства. Если не установлен: Times New Roman, serif. Промежуточные насыщенности могут отображаться ближайшим доступным начертанием.",
  },
  {
    value: "Arial",
    label: "Arial",
    description:
      "Нейтральный шрифт без засечек с устройства. Если не установлен: Helvetica, sans-serif. Насыщенности зависят от доступных начертаний.",
  },
  {
    value: "Verdana",
    label: "Verdana",
    description:
      "Широкий экранный шрифт с устройства. Если не установлен: Geneva, sans-serif. Насыщенности зависят от доступных начертаний.",
  },
  {
    value: "Times New Roman",
    label: "Times New Roman",
    description:
      "Классический шрифт с засечками с устройства. Если не установлен: Georgia, serif. Насыщенности зависят от доступных начертаний.",
  },
  {
    value: "Courier New",
    label: "Courier New",
    description:
      "Моноширинный шрифт с устройства. Если не установлен: Courier, monospace. Насыщенности зависят от доступных начертаний.",
  },
];
const ranges = [
  {
    key: "fontSize",
    label: "Базовый размер",
    unit: "px",
    hint: "Основной текст и поля ввода.",
  },
  {
    key: "headingScale",
    label: "Масштаб заголовков",
    unit: "×",
    hint: "Относительно базового размера. Подзаголовки используют промежуточный масштаб.",
  },
  {
    key: "fontWeight",
    label: "Насыщенность текста",
    unit: "",
    hint: "Текст, подписи и элементы управления.",
  },
  {
    key: "headingWeight",
    label: "Насыщенность заголовков",
    unit: "",
    hint: "Заголовки разделов, карточек и диалога.",
  },
  {
    key: "lineHeight",
    label: "Межстрочный интервал",
    unit: "×",
    hint: "Множитель размера шрифта, включая многострочные подписи.",
  },
  {
    key: "letterSpacing",
    label: "Межбуквенный интервал",
    unit: "em",
    hint: "Отрицательные значения уплотняют, положительные — разрежают текст.",
  },
] as const;

export function TypographyEditor({
  value,
  onChange,
}: {
  value: ThemeTypography;
  onChange: (value: Partial<ThemeTypography>) => void;
}) {
  const id = useId();
  return (
    <fieldset className="min-w-0 space-y-5 border-t border-white/15 pt-6">
      <legend className="px-1 text-base font-medium">Типографика</legend>
      <div>
        <Label htmlFor={`${id}-font`} className="mb-3 text-sm">
          Шрифт
        </Label>
        <Select
          items={fonts}
          value={value.font}
          onValueChange={(font) => {
            if (typeof font === "string" && Object.hasOwn(fontFamilies, font))
              onChange({ font: font as ThemeFont });
          }}
        >
          <SelectTrigger
            id={`${id}-font`}
            aria-describedby={`${id}-font-hint`}
            className="min-h-11 w-full border-white/20 bg-[#22291e] px-3 text-base text-[#edf1e7] hover:bg-[#2b3426] focus-visible:border-[#d3ed9a] focus-visible:ring-[#d3ed9a]/30 dark:bg-[#22291e] dark:hover:bg-[#2b3426]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className="dark rounded-lg border border-white/15 bg-[#22291e] p-1 font-sans text-[#edf1e7] shadow-xl ring-0 motion-reduce:animate-none [&_[data-slot=select-scroll-up-button]]:bg-[#22291e] [&_[data-slot=select-scroll-down-button]]:bg-[#22291e]"
          >
            {fonts.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className="min-h-11 rounded-md pl-3 text-base text-[#edf1e7] hover:bg-[#343e2a] focus:bg-[#343e2a] focus:text-[#edf1e7] data-highlighted:bg-[#343e2a] data-highlighted:text-[#edf1e7] data-selected:bg-[#343e2a] data-selected:text-[#d3ed9a] not-data-[variant=destructive]:focus:**:text-[#edf1e7]"
              >
                <span style={{ fontFamily: fontFamilies[font.value] }}>
                  {font.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          id={`${id}-font-hint`}
          className="mt-3 text-sm leading-6 text-[#b1bda7]"
        >
          {fonts.find((font) => font.value === value.font)?.description}
        </p>
      </div>
      {ranges.map((range) => {
        const limits = themeLimits[range.key];
        const controlId = `${id}-${range.key}`;
        return (
          <div key={range.key}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span id={`${controlId}-label`}>{range.label}</span>
              <output htmlFor={controlId} className="font-mono">
                {Number(value[range.key].toFixed(3))} {range.unit}
              </output>
            </div>
            <Slider
              id={controlId}
              aria-labelledby={`${controlId}-label`}
              aria-describedby={`${controlId}-hint`}
              min={limits.min}
              max={limits.max}
              step={limits.step}
              value={[value[range.key]]}
              onValueChange={(next) => {
                const number = typeof next === "number" ? next : next[0];
                if (number !== undefined)
                  onChange({ [range.key]: Number(number.toFixed(3)) });
              }}
              className="py-3 **:data-[slot=slider-range]:bg-[#d3ed9a]"
            />
            <div className="mt-1 flex justify-between gap-2 text-sm text-[#b1bda7]">
              <span>
                {limits.min} {range.unit}
              </span>
              <span>
                {limits.max} {range.unit}
              </span>
            </div>
            <p
              id={`${controlId}-hint`}
              className="mt-2 text-sm leading-6 text-[#b1bda7]"
            >
              {range.hint}
            </p>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        className="h-auto min-h-11 w-full gap-2 border-white/20 bg-transparent px-3 py-2 text-sm whitespace-normal"
        onClick={() => onChange(createInitialTheme().typography)}
      >
        <RotateCcw size={16} className="shrink-0" />
        Сбросить типографику
      </Button>
      <p className="text-sm leading-6 text-[#b1bda7]">
        Настройки общие для обоих режимов. Цвета, закругления и отступы при
        сбросе типографики сохраняются.
      </p>
    </fieldset>
  );
}
