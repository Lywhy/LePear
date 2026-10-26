/** Seasonal app chrome. Editor themes and exported tokens are independent. */
export const autumnPalette = {
  background: "#0d0906",
  deep: "#070503",
  surface: "#171009",
  raised: "#24190f",
  hover: "#382719",
  accent: "#ff9b45",
  "accent-hover": "#ffb567",
  "accent-ink": "#23180d",
  text: "#fff1dd",
  soft: "#e5d6c1",
  muted: "#c4b39f",
  dim: "#a28b74",
  teal: "#dc8846",
  sand: "#e8b789",
  success: "#efbd77",
  warning: "#f6d58f",
  danger: "#ffb6aa",
  "light-surface": "#fff0da",
  "light-ink": "#382315",
  line: "#59412b",
  "glow-amber": "#ff9b450f",
  "glow-teal": "#dc88460d",
  grid: "#dc884608",
  "glow-soft": "#ff9b450a",
  "spotlight-border": "#ff9b4529",
  "hero-shade": "#070503e6",
  "hero-shade-soft": "#07050399",
} as const;
export type ShellPalette = {
  readonly [Role in keyof typeof autumnPalette]: string;
};
export const winterPalette: ShellPalette = {
  background: "#080e17",
  deep: "#050a11",
  surface: "#101b2a",
  raised: "#182a3d",
  hover: "#243f58",
  accent: "#9bcffd",
  "accent-hover": "#c4e3ff",
  "accent-ink": "#0c2134",
  text: "#edf5ff",
  soft: "#d1e0f0",
  muted: "#a9bed3",
  dim: "#8fa7bf",
  teal: "#78b9cd",
  sand: "#c9e0ef",
  success: "#93d5c5",
  warning: "#e7d0a0",
  danger: "#f3b6c3",
  "light-surface": "#eff7ff",
  "light-ink": "#1d354a",
  line: "#36536e",
  "glow-amber": "#9bcffd0f",
  "glow-teal": "#78b9cd0d",
  grid: "#78b9cd08",
  "glow-soft": "#9bcffd0a",
  "spotlight-border": "#9bcffd29",
  "hero-shade": "#050a11e6",
  "hero-shade-soft": "#050a1199",
};
export const springPalette: ShellPalette = {
  background: "#0a110c",
  deep: "#060c08",
  surface: "#121e16",
  raised: "#1d2e21",
  hover: "#304637",
  accent: "#b6dc9d",
  "accent-hover": "#cdebb9",
  "accent-ink": "#172711",
  text: "#f0f5e9",
  soft: "#d8e2cf",
  muted: "#b8c7ac",
  dim: "#91a789",
  teal: "#dca8bd",
  sand: "#e5e7bd",
  success: "#8ed3b0",
  warning: "#e9cf94",
  danger: "#f0aaad",
  "light-surface": "#f3f7ec",
  "light-ink": "#263c25",
  line: "#435b42",
  "glow-amber": "#b6dc9d0f",
  "glow-teal": "#dca8bd0d",
  grid: "#adc89c08",
  "glow-soft": "#b6dc9d0a",
  "spotlight-border": "#b6dc9d29",
  "hero-shade": "#060c08e6",
  "hero-shade-soft": "#060c0899",
};
export const summerPalette: ShellPalette = {
  background: "#081312",
  deep: "#050d0d",
  surface: "#102321",
  raised: "#193632",
  hover: "#284b44",
  accent: "#f1d285",
  "accent-hover": "#f8e2a8",
  "accent-ink": "#2b250e",
  text: "#f6f3e4",
  soft: "#e2e3ce",
  muted: "#b9cabc",
  dim: "#91aa9d",
  teal: "#6acac0",
  sand: "#e9ddba",
  success: "#98d7b0",
  warning: "#f2bb82",
  danger: "#f2a8a0",
  "light-surface": "#faf6e8",
  "light-ink": "#25413a",
  line: "#3e6257",
  "glow-amber": "#f1d2850f",
  "glow-teal": "#6acac00d",
  grid: "#6acac008",
  "glow-soft": "#f1d2850a",
  "spotlight-border": "#f1d28529",
  "hero-shade": "#050d0de6",
  "hero-shade-soft": "#050d0d99",
};
export type ShellSeasonId = "autumn" | "winter" | "spring" | "summer";
export interface ShellSeason {
  id: ShellSeasonId;
  name: string;
  description: string;
  palette: ShellPalette | null;
  preview: readonly string[];
}
export const shellSeasons: readonly ShellSeason[] = [
  {
    id: "autumn",
    name: "Осень",
    description: "Тёплый оранжевый, медь и глубокие тёмные поверхности.",
    palette: autumnPalette,
    preview: [
      autumnPalette.background,
      autumnPalette.accent,
      autumnPalette.teal,
      autumnPalette.sand,
    ],
  },
  {
    id: "winter",
    name: "Зима",
    description:
      "Ледяной голубой, серебристый текст и глубокие синие поверхности.",
    palette: winterPalette,
    preview: [
      winterPalette.background,
      winterPalette.accent,
      winterPalette.teal,
      winterPalette.sand,
    ],
  },
  {
    id: "spring",
    name: "Весна",
    description: "Свежая зелень, мягкий розовый и тёмные лесные поверхности.",
    palette: springPalette,
    preview: [
      springPalette.background,
      springPalette.accent,
      springPalette.teal,
      springPalette.sand,
    ],
  },
  {
    id: "summer",
    name: "Лето",
    description:
      "Солнечный золотистый, морская бирюза и тёмные прибрежные оттенки.",
    palette: summerPalette,
    preview: [
      summerPalette.background,
      summerPalette.accent,
      summerPalette.teal,
      summerPalette.sand,
    ],
  },
];
export function findShellSeason(id: unknown) {
  return shellSeasons.find((season) => season.id === id);
}
export function resolveShellSeason(id: unknown): ShellSeasonId {
  const season = findShellSeason(id);
  return season?.palette ? season.id : "autumn";
}
export function paletteForSeason(id: ShellSeasonId): ShellPalette {
  return findShellSeason(id)?.palette ?? autumnPalette;
}
