import { fontFamilies, fontInstallationNote } from "@/lib/font-catalog";
import type { ThemeFont } from "@/lib/font-catalog";
export { fontFamilies, type ThemeFont } from "@/lib/font-catalog";
import type { CSSProperties } from "react";

export const THEME_SCHEMA_VERSION = 2 as const;
export type ThemeMode = "light" | "dark";
export const themeColors = [
  { name: "Lime", value: "#d3ed9a", className: "bg-[#d3ed9a]" },
  { name: "Sky", value: "#9fd6ef", className: "bg-[#9fd6ef]" },
  { name: "Apricot", value: "#efb48c", className: "bg-[#efb48c]" },
  { name: "Lavender", value: "#c2b4ef", className: "bg-[#c2b4ef]" },
  { name: "Rose", value: "#edabc0", className: "bg-[#edabc0]" },
];
export type ThemePalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
};
export type ThemeTypography = {
  font: ThemeFont;
  fontSize: number;
  headingScale: number;
  fontWeight: number;
  headingWeight: number;
  lineHeight: number;
  letterSpacing: number;
};
export type ThemeLayout = {
  controlHeight: number;
  controlPaddingInline: number;
  componentPadding: number;
  componentGap: number;
};
export type SiteTheme = {
  version: typeof THEME_SCHEMA_VERSION;
  mode: ThemeMode;
  palettes: Record<ThemeMode, ThemePalette>;
  typography: ThemeTypography;
  shape: { radius: number };
  layout: ThemeLayout;
};

/** Shared limits for validation and UI. Dimensions are px, tracking is em. */
export const themeLimits = {
  fontSize: { min: 14, max: 20, step: 1 },
  headingScale: { min: 1.1, max: 2, step: 0.05 },
  fontWeight: { min: 300, max: 700, step: 100 },
  headingWeight: { min: 300, max: 700, step: 100 },
  lineHeight: { min: 1.2, max: 2, step: 0.05 },
  letterSpacing: { min: -0.03, max: 0.1, step: 0.005 },
  radius: { min: 0, max: 24, step: 1 },
  controlHeight: { min: 40, max: 64, step: 1 },
  controlPaddingInline: { min: 8, max: 32, step: 1 },
  componentPadding: { min: 12, max: 40, step: 1 },
  componentGap: { min: 8, max: 32, step: 1 },
} as const;

/** Each call returns independent objects, including both palettes. */
export function createInitialTheme(): SiteTheme {
  return {
    version: THEME_SCHEMA_VERSION,
    mode: "dark",
    palettes: {
      dark: {
        background: "#101310",
        foreground: "#edf1e7",
        card: "#1a2017",
        cardForeground: "#edf1e7",
        popover: "#1a2017",
        popoverForeground: "#edf1e7",
        primary: "#d3ed9a",
        primaryForeground: "#111811",
        secondary: "#2b3426",
        secondaryForeground: "#edf1e7",
        muted: "#252d21",
        mutedForeground: "#b1bda6",
        accent: "#2b3426",
        accentForeground: "#edf1e7",
        destructive: "#ff938f",
        border: "#ffffff1c",
        input: "#ffffff26",
        ring: "#d3ed9a",
      },
      light: {
        background: "#f4f6f0",
        foreground: "#20271c",
        card: "#ffffff",
        cardForeground: "#20271c",
        popover: "#ffffff",
        popoverForeground: "#20271c",
        primary: "#d3ed9a",
        primaryForeground: "#111811",
        secondary: "#e6ecde",
        secondaryForeground: "#20271c",
        muted: "#e8ede2",
        mutedForeground: "#5c6952",
        accent: "#e6ecde",
        accentForeground: "#20271c",
        destructive: "#b72922",
        border: "#34462526",
        input: "#34462533",
        ring: "#d3ed9a",
      },
    },
    typography: {
      font: "Geist",
      fontSize: 16,
      headingScale: 1.5,
      fontWeight: 400,
      headingWeight: 500,
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    shape: { radius: 10 },
    layout: {
      controlHeight: 44,
      controlPaddingInline: 12,
      componentPadding: 20,
      componentGap: 16,
    },
  };
}
export const initialTheme = createInitialTheme();
export type ThemeValidationError = { path: string; message: string };
export type ThemeValidationResult =
  | { success: true; theme: SiteTheme }
  | { success: false; errors: ThemeValidationError[] };
const paletteKeys = Object.keys(
  initialTheme.palettes.dark,
) as (keyof ThemePalette)[];
const typographyNumberKeys = [
  "fontSize",
  "headingScale",
  "fontWeight",
  "headingWeight",
  "lineHeight",
  "letterSpacing",
] as const;
const layoutKeys = [
  "controlHeight",
  "controlPaddingInline",
  "componentPadding",
  "componentGap",
] as const;
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isColor(value: unknown, opaque = false): value is string {
  return (
    typeof value === "string" &&
    (opaque ? /^#[\da-f]{6}$/i : /^#[\da-f]{6}(?:[\da-f]{2})?$/i).test(value)
  );
}

/** No coercion, clamping or partial acceptance: rejected data leaves state intact. */
export function validateTheme(value: unknown): ThemeValidationResult {
  const errors: ThemeValidationError[] = [];
  const add = (path: string, message: string) => errors.push({ path, message });
  const record = (input: unknown, path: string): Record<string, unknown> => {
    if (isRecord(input)) return input;
    add(path, "Ожидается объект.");
    return {};
  };
  const number = (
    input: unknown,
    key: keyof typeof themeLimits,
    path: string,
  ) => {
    const { min, max, step } = themeLimits[key];
    if (
      typeof input !== "number" ||
      !Number.isFinite(input) ||
      input < min ||
      input > max
    ) {
      add(path, `Допустимо число от ${min} до ${max}.`);
      return;
    }
    if (
      Math.abs((input - min) / step - Math.round((input - min) / step)) > 1e-6
    )
      add(path, `Шаг значения должен быть ${step}.`);
  };
  const root = record(value, "theme");
  if (root.version !== THEME_SCHEMA_VERSION)
    add("version", `Поддерживается версия темы ${THEME_SCHEMA_VERSION}.`);
  if (root.mode !== "light" && root.mode !== "dark")
    add("mode", "Режим должен быть light или dark.");
  const palettes = record(root.palettes, "palettes");
  for (const mode of ["light", "dark"] as const) {
    const palette = record(palettes[mode], `palettes.${mode}`);
    for (const key of paletteKeys)
      if (!isColor(palette[key], key === "primary"))
        add(
          `palettes.${mode}.${key}`,
          key === "primary"
            ? "Цвет акцента должен быть в формате #RRGGBB."
            : "Цвет должен быть в формате #RRGGBB или #RRGGBBAA.",
        );
  }
  const typography = record(root.typography, "typography");
  if (
    typeof typography.font !== "string" ||
    !Object.hasOwn(fontFamilies, typography.font)
  )
    add(
      "typography.font",
      `Выберите доступный шрифт: ${Object.keys(fontFamilies).join(", ")}.`,
    );
  for (const key of typographyNumberKeys)
    number(typography[key], key, `typography.${key}`);
  const shape = record(root.shape, "shape");
  number(shape.radius, "radius", "shape.radius");
  const layout = record(root.layout, "layout");
  for (const key of layoutKeys) number(layout[key], key, `layout.${key}`);
  if (errors.length) return { success: false, errors };
  // Build a detached, known-shape value. Extra input keys are never propagated.
  const readPalette = (mode: ThemeMode) =>
    Object.fromEntries(
      paletteKeys.map((key) => [
        key,
        (palettes[mode] as Record<string, string>)[key]!.toLowerCase(),
      ]),
    ) as ThemePalette;
  return {
    success: true,
    theme: {
      version: THEME_SCHEMA_VERSION,
      mode: root.mode as ThemeMode,
      palettes: { light: readPalette("light"), dark: readPalette("dark") },
      typography: {
        font: typography.font as ThemeFont,
        ...Object.fromEntries(
          typographyNumberKeys.map((key) => [key, typography[key]]),
        ),
      } as ThemeTypography,
      shape: { radius: shape.radius as number },
      layout: Object.fromEntries(
        layoutKeys.map((key) => [key, layout[key]]),
      ) as ThemeLayout,
    },
  };
}
export type ThemeUpdate = {
  mode?: ThemeMode;
  palette?: Partial<ThemePalette>;
  typography?: Partial<ThemeTypography>;
  shape?: Partial<SiteTheme["shape"]>;
  layout?: Partial<ThemeLayout>;
};

export function accentForeground(hex: string) {
  if (!isColor(hex, true)) return "#111811";
  function luminance(color: string) {
    const rgb = color
      .slice(1)
      .match(/.{2}/g)!
      .map((channel) => parseInt(channel, 16) / 255)
      .map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      );
    return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
  }
  const background = luminance(hex);
  const dark = luminance("#111811");
  const darkContrast =
    (Math.max(background, dark) + 0.05) / (Math.min(background, dark) + 0.05);
  const whiteContrast = 1.05 / (background + 0.05);
  return darkContrast >= whiteContrast ? "#111811" : "#ffffff";
}
/** Palette edits affect the selected mode only; typography and layout are shared. */
export function updateTheme(
  current: SiteTheme,
  update: ThemeUpdate,
): ThemeValidationResult {
  const mode = update.mode ?? current.mode;
  const activePalette = { ...current.palettes[mode], ...update.palette };
  if (update.palette?.primary !== undefined) {
    if (update.palette.primaryForeground === undefined)
      activePalette.primaryForeground = accentForeground(
        update.palette.primary,
      );
    if (update.palette.ring === undefined)
      activePalette.ring = update.palette.primary;
  }
  return validateTheme({
    ...current,
    mode,
    palettes: { ...current.palettes, [mode]: activePalette },
    typography: { ...current.typography, ...update.typography },
    shape: { ...current.shape, ...update.shape },
    layout: { ...current.layout, ...update.layout },
  });
}

const colorTokenNames: Record<keyof ThemePalette, string> = {
  background: "background",
  foreground: "foreground",
  card: "card",
  cardForeground: "card-foreground",
  popover: "popover",
  popoverForeground: "popover-foreground",
  primary: "primary",
  primaryForeground: "primary-foreground",
  secondary: "secondary",
  secondaryForeground: "secondary-foreground",
  muted: "muted",
  mutedForeground: "muted-foreground",
  accent: "accent",
  accentForeground: "accent-foreground",
  destructive: "destructive",
  border: "border",
  input: "input",
  ring: "ring",
};
/** Density controls vertical padding; text may increase the requested minimum. */
export function controlPaddingBlock(theme: SiteTheme) {
  return Math.min(12, Math.max(4, theme.layout.componentGap / 2));
}
export function effectiveControlHeight(theme: SiteTheme) {
  return Math.ceil(
    Math.max(
      theme.layout.controlHeight,
      theme.typography.fontSize * theme.typography.lineHeight +
        2 * controlPaddingBlock(theme) +
        2,
    ),
  );
}
export function themeTokens(theme: SiteTheme): Record<string, string> {
  const { typography, layout } = theme;
  return {
    ...Object.fromEntries(
      paletteKeys.map((key) => [
        `--${colorTokenNames[key]}`,
        theme.palettes[theme.mode][key],
      ]),
    ),
    "--radius": `${theme.shape.radius / 16}rem`,
    "--font-sans": fontFamilies[typography.font],
    "--preview-font-size": `${typography.fontSize}px`,
    "--preview-heading-scale": String(typography.headingScale),
    "--preview-small-size": `${Math.max(14, typography.fontSize * 0.875)}px`,
    "--preview-heading-size": `${Number((typography.fontSize * typography.headingScale).toFixed(3))}px`,
    "--preview-subheading-size": `${Number((typography.fontSize * (1 + (typography.headingScale - 1) / 2)).toFixed(3))}px`,
    "--preview-font-weight": String(typography.fontWeight),
    "--preview-heading-weight": String(typography.headingWeight),
    "--preview-line-height": String(typography.lineHeight),
    "--preview-letter-spacing": `${typography.letterSpacing}em`,
    "--preview-control-height": `${layout.controlHeight}px`,
    "--preview-control-safe-height": `${effectiveControlHeight(theme)}px`,
    "--preview-control-padding-block": `${controlPaddingBlock(theme)}px`,
    "--preview-control-padding": `${layout.controlPaddingInline}px`,
    "--preview-component-padding": `${layout.componentPadding}px`,
    "--preview-component-gap": `${layout.componentGap}px`,
  };
}
/** Token scope is restricted to the preview; editor and landing never inherit it. */
export function previewStyle(theme: SiteTheme): CSSProperties {
  return {
    ...themeTokens(theme),
    fontFamily: fontFamilies[theme.typography.font],
    colorScheme: theme.mode,
  } as CSSProperties;
}
/** Tailwind v4 source CSS: compile with the host app, never inject as runtime style. */
export function exportTheme(theme: SiteTheme) {
  const declarations = (mode: ThemeMode) =>
    Object.entries(themeTokens({ ...theme, mode }))
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");
  const mapping = Object.values(colorTokenNames)
    .map((name) => `  --color-${name}: var(--${name});`)
    .join("\n");
  return `/* LePear schema v${theme.version}. Both palettes; default mode: ${theme.mode}.
 * Import AFTER Tailwind/shadcn CSS in your main stylesheet and compile with Tailwind v4.
 * Root: class="lepear-theme${theme.mode === "dark" ? " dark" : ""}" data-theme="${theme.mode}".
 * Switch BOTH class dark and data-theme. Portals must be inside this themed root.
 * Font: ${fontInstallationNote(theme.typography.font)}
 * System fonts use the fallback chain; font files are not included.
 */
@theme inline {
${mapping}
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
.lepear-theme {
${declarations(theme.mode)}
  color-scheme: ${theme.mode};
}
.lepear-theme[data-theme="light"] {
${declarations("light")}
  color-scheme: light;
}
.lepear-theme[data-theme="dark"] {
${declarations("dark")}
  color-scheme: dark;
}
.lepear-theme {
  font-family: var(--font-sans);
  font-size: var(--preview-font-size);
  font-weight: var(--preview-font-weight);
  line-height: var(--preview-line-height);
  letter-spacing: var(--preview-letter-spacing);
  background: var(--background);
  color: var(--foreground);
  overflow-wrap: anywhere;
}
.lepear-theme :where(*) {
  font-family: var(--font-sans);
  font-weight: var(--preview-font-weight);
  line-height: var(--preview-line-height);
  letter-spacing: var(--preview-letter-spacing);
}
.lepear-theme :where(h1, h2, h3) {
  font-size: var(--preview-heading-size);
  font-weight: var(--preview-heading-weight);
}
.lepear-theme :where(h4, h5, h6, [data-slot="card-title"], [data-slot="dialog-title"]) {
  font-size: var(--preview-subheading-size);
  font-weight: var(--preview-heading-weight);
}
.lepear-theme :where(button:not([role="checkbox"]):not([role="switch"]), input:not([type="checkbox"]):not([type="radio"]), textarea, select, [data-slot="select-trigger"], [data-slot="select-item"], [data-slot="tabs-trigger"]) {
  height: auto;
  min-height: var(--preview-control-safe-height);
  max-width: 100%;
  min-width: 0;
  padding-block: var(--preview-control-padding-block);
  padding-inline: var(--preview-control-padding);
  border-radius: calc(var(--radius) * 0.7);
  font-size: var(--preview-small-size);
  white-space: normal;
  overflow-wrap: anywhere;
}
.lepear-theme :where(input:not([type="checkbox"]):not([type="radio"]), textarea, select, [data-slot="select-trigger"]) {
  font-size: var(--preview-font-size);
}
.lepear-theme :where([data-slot="select-value"], [data-slot="select-item"] > span) {
  white-space: normal;
  -webkit-line-clamp: unset;
  min-width: 0;
  flex-shrink: 1;
}
.lepear-theme :where([data-slot="card"], [data-slot="dialog-content"]) {
  min-width: 0;
  border-radius: var(--radius);
  padding: var(--preview-component-padding);
  gap: var(--preview-component-gap);
  font-size: var(--preview-font-size);
}
.lepear-theme :where([data-slot="card-content"], [data-slot="card-header"], [data-slot="card-footer"]) { padding-inline: 0; }
.lepear-theme :where([data-slot="dialog-content"]) { max-height: 85dvh; overflow-y: auto; }
.lepear-theme :where([data-slot="dialog-footer"]) { margin: 0; padding: var(--preview-component-gap) 0 0; gap: var(--preview-component-gap); flex-wrap: wrap; }
.lepear-theme :where([data-slot="select-content"], [data-slot="tabs-list"]) { border-radius: var(--radius); }
.lepear-theme :where([data-slot="select-content"]) { padding: calc(var(--preview-component-gap) * 0.25); }
.lepear-theme :where([data-slot="badge"], [data-slot="checkbox"]) { border-radius: calc(var(--radius) * 0.5); }
.lepear-theme :where(label, [data-slot="badge"], [data-slot="table"], [data-slot="table-caption"], [data-slot="dialog-description"]) { font-size: var(--preview-small-size); }
.lepear-theme :where(th, td) { height: var(--preview-control-safe-height); padding: var(--preview-control-padding-block) var(--preview-control-padding); }
.lepear-theme :where([data-slot="table-container"]) { overflow-x: auto; }
.lepear-theme .lepear-stack { display: flex; flex-direction: column; gap: var(--preview-component-gap); }
.lepear-theme .lepear-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: var(--preview-component-gap); }
`;
}
