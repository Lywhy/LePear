import { useId } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SettingsRange } from "@/components/editor/settings-range";
import { controlClasses as controls } from "@/components/editor/control-classes";
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
            className={controls.trigger}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className={controls.popup}
          >
            {fonts.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className={controls.option}
              >
                <span style={{ fontFamily: fontFamilies[font.value] }}>
                  {font.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-3 rounded-xl border border-white/10 bg-shell-deep p-4">
          <p className="text-sm leading-6 text-shell-muted">Образец шрифта</p>
          <p
            className="mt-2 text-2xl leading-9 text-shell-text wrap-anywhere"
            style={{ fontFamily: fontFamilies[value.font] }}
          >
            Своя тема. Your style. 0123
          </p>
        </div>
        <p
          id={`${id}-font-hint`}
          className="mt-3 text-sm leading-6 text-shell-muted"
        >
          {fonts.find((font) => font.value === value.font)?.description}
        </p>
      </div>
      {ranges.map((range) => (
        <SettingsRange
          key={range.key}
          label={range.label}
          hint={range.hint}
          value={value[range.key]}
          {...themeLimits[range.key]}
          unit={range.unit}
          onChange={(number) => onChange({ [range.key]: number })}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        className={controls.action + " w-full"}
        onClick={() => onChange(createInitialTheme().typography)}
      >
        <RotateCcw size={16} className="shrink-0" />
        Сбросить типографику
      </Button>
      <p className="text-sm leading-6 text-shell-muted">
        Настройки общие для обоих режимов. Цвета, закругления и отступы при
        сбросе типографики сохраняются.
      </p>
    </fieldset>
  );
}
