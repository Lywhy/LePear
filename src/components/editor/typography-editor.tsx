import { MotionIcon } from "@/components/motion/motion-icon";
import { fontCatalog, fontInfo } from "@/lib/font-catalog";
import { useThemeFont } from "@/lib/use-theme-font";
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

const fonts = fontCatalog.map((font) => ({
  value: font.id,
  label: font.label,
}));
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
  const selectedFont = fontInfo(value.font);
  const fontPhase = useThemeFont(value.font);
  return (
    <fieldset className="min-w-0 space-y-5 border-t border-shell-divider/15 pt-6">
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
            className={controls.popup + " max-h-80"}
          >
            {fonts.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className={controls.option}
              >
                <span>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-3 rounded-xl border border-shell-divider/10 bg-shell-deep p-4">
          <p className="text-sm leading-6 text-shell-muted">
            Образец: кириллица и латиница
          </p>
          <p
            className="mt-2 text-2xl leading-9 text-shell-text wrap-anywhere"
            style={{
              fontFamily: fontFamilies[value.font],
              fontWeight: value.fontWeight,
              lineHeight: value.lineHeight,
              letterSpacing: value.letterSpacing + "em",
            }}
          >
            Своя тема. Your style. 0123456789
          </p>
          <p
            className="mt-2 text-base leading-7 text-shell-text wrap-anywhere"
            style={{
              fontFamily: fontFamilies[value.font],
              fontWeight: value.headingWeight,
            }}
          >
            Съешь ещё этих мягких булок. The quick brown fox.
          </p>
          <p
            className="mt-3 min-h-12 text-sm leading-6 text-shell-muted"
            role="status"
          >
            {fontPhase === "loading"
              ? "Шрифт загружается, пока используется запасной."
              : fontPhase === "error"
                ? "Не удалось загрузить шрифт. Сейчас используется запасной; выберите семейство снова или обновите страницу."
                : fontPhase === "system"
                  ? "Системное семейство: фактический шрифт и начертания зависят от устройства."
                  : "Веб-шрифт загружен с этого сайта."}
          </p>
        </div>
        <p
          id={`${id}-font-hint`}
          className="mt-3 text-sm leading-6 text-shell-muted"
        >
          {selectedFont.kind}. {selectedFont.description}{" "}
          {selectedFont.weights
            ? "Доступные насыщенности: " +
              selectedFont.weights[0] +
              "–" +
              selectedFont.weights[1] +
              ". В редакторе: 300–700."
            : "В редакторе: 300–700; браузер может использовать ближайшее начертание."}
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
        <MotionIcon
          icon={RotateCcw}
          effect="turn"
          size={16}
          className="shrink-0"
        />
        Сбросить типографику
      </Button>
      <p className="text-sm leading-6 text-shell-muted">
        Настройки общие для обоих режимов. Цвета, закругления и отступы при
        сбросе типографики сохраняются.
      </p>
    </fieldset>
  );
}
