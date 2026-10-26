import { seasonalColorPresets } from "@/lib/seasonal-color-presets";
import { additionalColorPresets } from "@/lib/additional-color-presets";
import {
  createInitialTheme,
  type ThemeMode,
  type ThemePalette,
} from "@/lib/site-theme";

type ColorPreset = {
  id: string;
  name: string;
  description: string;
  palettes: Record<ThemeMode, ThemePalette>;
};
function palette(mode: ThemeMode, colors: Partial<ThemePalette>): ThemePalette {
  return { ...createInitialTheme().palettes[mode], ...colors };
}
/** Presets replace the complete selected palette in a single state update. */
export const colorPresets: ColorPreset[] = [
  {
    id: "forest",
    name: "Лес",
    description: "Природные поверхности и лаймовый акцент",
    palettes: createInitialTheme().palettes,
  },
  {
    id: "ocean",
    name: "Океан",
    description: "Синие поверхности и небесный акцент",
    palettes: {
      light: palette("light", {
        background: "#f0f6fc",
        foreground: "#142c45",
        card: "#ffffff",
        cardForeground: "#142c45",
        popover: "#ffffff",
        popoverForeground: "#142c45",
        primary: "#1265b0",
        primaryForeground: "#ffffff",
        secondary: "#dbeafa",
        secondaryForeground: "#183b60",
        muted: "#e5eff9",
        mutedForeground: "#46627d",
        accent: "#d0e8fa",
        accentForeground: "#133f67",
        destructive: "#b42332",
        border: "#adc5dd",
        input: "#8faecb",
        ring: "#1265b0",
      }),
      dark: palette("dark", {
        background: "#0c1726",
        foreground: "#e6f0ff",
        card: "#132238",
        cardForeground: "#e6f0ff",
        popover: "#172b44",
        popoverForeground: "#e6f0ff",
        primary: "#8dceff",
        primaryForeground: "#082942",
        secondary: "#213b58",
        secondaryForeground: "#e6f0ff",
        muted: "#1c3049",
        mutedForeground: "#adc2dd",
        accent: "#254966",
        accentForeground: "#e6f0ff",
        destructive: "#ff9b9b",
        border: "#355573",
        input: "#456986",
        ring: "#8dceff",
      }),
    },
  },
  {
    id: "plum",
    name: "Слива",
    description: "Сиреневые поверхности и фиолетовый акцент",
    palettes: {
      light: palette("light", {
        background: "#f8f3fc",
        foreground: "#32213e",
        card: "#ffffff",
        cardForeground: "#32213e",
        popover: "#ffffff",
        popoverForeground: "#32213e",
        primary: "#7640a6",
        primaryForeground: "#ffffff",
        secondary: "#ebdff5",
        secondaryForeground: "#47285e",
        muted: "#f0e8f6",
        mutedForeground: "#6b557c",
        accent: "#e7d6f5",
        accentForeground: "#47285e",
        destructive: "#b42332",
        border: "#cfb8dd",
        input: "#b59bc8",
        ring: "#7640a6",
      }),
      dark: palette("dark", {
        background: "#1b1224",
        foreground: "#f5eaff",
        card: "#291c36",
        cardForeground: "#f5eaff",
        popover: "#332240",
        popoverForeground: "#f5eaff",
        primary: "#d6aff7",
        primaryForeground: "#311245",
        secondary: "#443052",
        secondaryForeground: "#f5eaff",
        muted: "#382841",
        mutedForeground: "#cfb6df",
        accent: "#513561",
        accentForeground: "#f5eaff",
        destructive: "#ffa1ae",
        border: "#624673",
        input: "#79588c",
        ring: "#d6aff7",
      }),
    },
  },
  {
    id: "graphite",
    name: "Графит",
    description: "Нейтральные поверхности и монохромный акцент",
    palettes: {
      light: palette("light", {
        background: "#f5f5f5",
        foreground: "#202020",
        card: "#ffffff",
        cardForeground: "#202020",
        popover: "#ffffff",
        popoverForeground: "#202020",
        primary: "#262626",
        primaryForeground: "#ffffff",
        secondary: "#e5e5e5",
        secondaryForeground: "#262626",
        muted: "#ededed",
        mutedForeground: "#595959",
        accent: "#dedede",
        accentForeground: "#262626",
        destructive: "#b42332",
        border: "#c4c4c4",
        input: "#aaaaaa",
        ring: "#525252",
      }),
      dark: palette("dark", {
        background: "#141414",
        foreground: "#f2f2f2",
        card: "#202020",
        cardForeground: "#f2f2f2",
        popover: "#292929",
        popoverForeground: "#f2f2f2",
        primary: "#e5e5e5",
        primaryForeground: "#202020",
        secondary: "#363636",
        secondaryForeground: "#f2f2f2",
        muted: "#2b2b2b",
        mutedForeground: "#bdbdbd",
        accent: "#404040",
        accentForeground: "#f2f2f2",
        destructive: "#ff9b9b",
        border: "#505050",
        input: "#656565",
        ring: "#d4d4d4",
      }),
    },
  },
  ...additionalColorPresets,
  ...seasonalColorPresets,
];
export function normalizeColor(value: string, opaque = false): string | null {
  const hex = value.trim().toLowerCase();
  return (opaque ? /^#[\da-f]{6}$/ : /^#[\da-f]{6}(?:[\da-f]{2})?$/).test(hex)
    ? hex
    : null;
}
type RGB = [number, number, number];
function over(hex: string, base: RGB): RGB {
  const alpha = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return base.map(
    (channel, i) =>
      (parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255) * alpha +
      channel * (1 - alpha),
  ) as RGB;
}
function luminance(rgb: RGB) {
  const linear = rgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}
export function paletteContrast(
  p: ThemePalette,
  mode: ThemeMode,
  text: keyof ThemePalette,
  surface: keyof ThemePalette,
) {
  const canvas = over(p.background, mode === "dark" ? [0, 0, 0] : [1, 1, 1]);
  const base = surface === "background" ? canvas : over(p[surface], canvas);
  const first = luminance(over(p[text], base));
  const second = luminance(base);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
export const contrastPairs: {
  label: string;
  text: keyof ThemePalette;
  surface: keyof ThemePalette;
}[] = [
  { label: "Основной текст / фон", text: "foreground", surface: "background" },
  {
    label: "Текст карточки / карточка",
    text: "cardForeground",
    surface: "card",
  },
  { label: "Текст меню / меню", text: "popoverForeground", surface: "popover" },
  {
    label: "Текст кнопки / основной цвет",
    text: "primaryForeground",
    surface: "primary",
  },
  {
    label: "Текст вторичной кнопки / вторичный цвет",
    text: "secondaryForeground",
    surface: "secondary",
  },
  {
    label: "Приглушённый текст / приглушённый фон",
    text: "mutedForeground",
    surface: "muted",
  },
  {
    label: "Приглушённый текст / карточка",
    text: "mutedForeground",
    surface: "card",
  },
  {
    label: "Текст выделения / выделение",
    text: "accentForeground",
    surface: "accent",
  },
  { label: "Ошибка / фон", text: "destructive", surface: "background" },
  { label: "Ошибка / карточка", text: "destructive", surface: "card" },
];
