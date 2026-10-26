/** Stable font IDs shared by validation, UI and export. */
export const fontFamilies = {
  Geist: "'Geist Variable', system-ui, Arial, sans-serif",
  System: "system-ui, 'Segoe UI', Arial, sans-serif",
  Georgia: "Georgia, 'Times New Roman', serif",
  Arial: "Arial, Helvetica, sans-serif",
  Verdana: "Verdana, Geneva, sans-serif",
  "Times New Roman": "'Times New Roman', Georgia, serif",
  "Courier New": "'Courier New', Courier, monospace",
  Inter: "'Inter Variable', system-ui, Arial, sans-serif",
  Manrope: "'Manrope Variable', system-ui, Arial, sans-serif",
  Rubik: "'Rubik Variable', system-ui, Arial, sans-serif",
  "Noto Serif": "'Noto Serif Variable', Georgia, serif",
  "Roboto Mono": "'Roboto Mono Variable', 'Courier New', monospace",
} as const;
export type ThemeFont = keyof typeof fontFamilies;
interface FontEntry {
  id: ThemeFont;
  label: string;
  kind: "Без засечек" | "С засечками" | "Моноширинный";
  description: string;
  webFamily?: string;
  packageName?: string;
  weights?: readonly [number, number];
}
export const fontCatalog: readonly FontEntry[] = [
  {
    id: "Geist",
    label: "Geist",
    kind: "Без засечек",
    description:
      "Variable-шрифт приложения с кириллицей. Fallback: system-ui, Arial, sans-serif.",
    webFamily: "Geist Variable",
    packageName: "@fontsource-variable/geist",
    weights: [100, 900],
  },
  {
    id: "System",
    label: "Системный",
    kind: "Без засечек",
    description:
      "Шрифт интерфейса вашей ОС. Fallback: Segoe UI, Arial, sans-serif. Начертания зависят от устройства.",
  },
  {
    id: "Georgia",
    label: "Georgia",
    kind: "С засечками",
    description:
      "Шрифт с устройства. Fallback: Times New Roman, serif. Насыщенности могут заменяться ближайшим доступным начертанием.",
  },
  {
    id: "Arial",
    label: "Arial",
    kind: "Без засечек",
    description:
      "Нейтральный системный шрифт. Fallback: Helvetica, sans-serif. Начертания зависят от устройства.",
  },
  {
    id: "Verdana",
    label: "Verdana",
    kind: "Без засечек",
    description:
      "Широкий экранный шрифт с устройства. Fallback: Geneva, sans-serif. Начертания зависят от устройства.",
  },
  {
    id: "Times New Roman",
    label: "Times New Roman",
    kind: "С засечками",
    description:
      "Классический шрифт с устройства. Fallback: Georgia, serif. Начертания зависят от устройства.",
  },
  {
    id: "Courier New",
    label: "Courier New",
    kind: "Моноширинный",
    description:
      "Системный моноширинный шрифт. Fallback: Courier, monospace. Начертания зависят от устройства.",
  },
  {
    id: "Inter",
    label: "Inter",
    kind: "Без засечек",
    description:
      "Чёткий интерфейсный гротеск с кириллицей. Fallback: system-ui, Arial, sans-serif.",
    webFamily: "Inter Variable",
    packageName: "@fontsource-variable/inter",
    weights: [100, 900],
  },
  {
    id: "Manrope",
    label: "Manrope",
    kind: "Без засечек",
    description:
      "Геометричный гротеск для заголовков и спокойного набора. Кириллица; fallback: system-ui, Arial, sans-serif.",
    webFamily: "Manrope Variable",
    packageName: "@fontsource-variable/manrope",
    weights: [200, 800],
  },
  {
    id: "Rubik",
    label: "Rubik",
    kind: "Без засечек",
    description:
      "Мягкий гротеск с округлыми деталями и кириллицей. Fallback: system-ui, Arial, sans-serif.",
    webFamily: "Rubik Variable",
    packageName: "@fontsource-variable/rubik",
    weights: [300, 900],
  },
  {
    id: "Noto Serif",
    label: "Noto Serif",
    kind: "С засечками",
    description:
      "Выразительный текстовый шрифт с засечками и кириллицей. Fallback: Georgia, serif.",
    webFamily: "Noto Serif Variable",
    packageName: "@fontsource-variable/noto-serif",
    weights: [100, 900],
  },
  {
    id: "Roboto Mono",
    label: "Roboto Mono",
    kind: "Моноширинный",
    description:
      "Моноширинный variable-шрифт для кода и чисел с кириллицей. Fallback: Courier New, monospace.",
    webFamily: "Roboto Mono Variable",
    packageName: "@fontsource-variable/roboto-mono",
    weights: [100, 700],
  },
];
export function fontInfo(font: ThemeFont) {
  return fontCatalog.find((entry) => entry.id === font)!;
}
export function fontInstallationNote(font: ThemeFont) {
  const info = fontInfo(font);
  return info.packageName
    ? "Install " +
        info.packageName +
        "; import its wght.css before the theme CSS. Font files are not embedded."
    : "Uses an installed system font and fallback chain. Font files are not embedded.";
}
