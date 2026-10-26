import { lightShellPalettes } from "@/lib/light-shell-palettes";
/** Seasonal app chrome. Editor themes and exported tokens are independent. */
export const autumnPalette = {
  divider: "#ffffff",
  background: "#271a12",
  deep: "#20150f",
  surface: "#332319",
  raised: "#433023",
  hover: "#5a3e2b",
  accent: "#ff9b45",
  "accent-hover": "#ffb567",
  "accent-ink": "#23180d",
  text: "#fff1dd",
  soft: "#e5d6c1",
  muted: "#d1bea9",
  dim: "#b8a08b",
  teal: "#dc8846",
  sand: "#e8b789",
  success: "#efbd77",
  warning: "#f6d58f",
  danger: "#ffb6aa",
  "light-surface": "#fff0da",
  "light-ink": "#382315",
  line: "#86664a",
  "glow-amber": "#ff9b450f",
  "glow-teal": "#dc88460d",
  grid: "#dc884608",
  "glow-soft": "#ff9b450a",
  "spotlight-border": "#ff9b4529",
  "hero-shade": "#20150fe6",
  "hero-shade-soft": "#20150f99",
} as const;
export type ShellPalette = {
  readonly [Role in keyof typeof autumnPalette]: string;
};
export const winterPalette: ShellPalette = {
  divider: "#ffffff",
  background: "#17283b",
  deep: "#122132",
  surface: "#20364c",
  raised: "#2b465e",
  hover: "#3b5c77",
  accent: "#9bcffd",
  "accent-hover": "#c4e3ff",
  "accent-ink": "#0c2134",
  text: "#edf5ff",
  soft: "#d1e0f0",
  muted: "#bacfe0",
  dim: "#a2bacf",
  teal: "#78b9cd",
  sand: "#c9e0ef",
  success: "#93d5c5",
  warning: "#e7d0a0",
  danger: "#f3b6c3",
  "light-surface": "#eff7ff",
  "light-ink": "#1d354a",
  line: "#597a97",
  "glow-amber": "#9bcffd0f",
  "glow-teal": "#78b9cd0d",
  grid: "#78b9cd08",
  "glow-soft": "#9bcffd0a",
  "spotlight-border": "#9bcffd29",
  "hero-shade": "#122132e6",
  "hero-shade-soft": "#12213299",
};
export const springPalette: ShellPalette = {
  divider: "#ffffff",
  background: "#1c2d20",
  deep: "#17261b",
  surface: "#273b2b",
  raised: "#354e38",
  hover: "#48674b",
  accent: "#b6dc9d",
  "accent-hover": "#cdebb9",
  "accent-ink": "#172711",
  text: "#f0f5e9",
  soft: "#d8e2cf",
  muted: "#c4d3b9",
  dim: "#aac09f",
  teal: "#dca8bd",
  sand: "#e5e7bd",
  success: "#8ed3b0",
  warning: "#e9cf94",
  danger: "#f0aaad",
  "light-surface": "#f3f7ec",
  "light-ink": "#263c25",
  line: "#648265",
  "glow-amber": "#b6dc9d0f",
  "glow-teal": "#dca8bd0d",
  grid: "#adc89c08",
  "glow-soft": "#b6dc9d0a",
  "spotlight-border": "#b6dc9d29",
  "hero-shade": "#17261be6",
  "hero-shade-soft": "#17261b99",
};
export const summerPalette: ShellPalette = {
  divider: "#ffffff",
  background: "#18322f",
  deep: "#132a28",
  surface: "#21433e",
  raised: "#2e574e",
  hover: "#407366",
  accent: "#f1d285",
  "accent-hover": "#f8e2a8",
  "accent-ink": "#2b250e",
  text: "#f6f3e4",
  soft: "#e2e3ce",
  muted: "#c7d8ca",
  dim: "#aac4b5",
  teal: "#6acac0",
  sand: "#e9ddba",
  success: "#98d7b0",
  warning: "#f2bb82",
  danger: "#f2a8a0",
  "light-surface": "#faf6e8",
  "light-ink": "#25413a",
  line: "#628b7c",
  "glow-amber": "#f1d2850f",
  "glow-teal": "#6acac00d",
  grid: "#6acac008",
  "glow-soft": "#f1d2850a",
  "spotlight-border": "#f1d28529",
  "hero-shade": "#132a28e6",
  "hero-shade-soft": "#132a2899",
};
export type ShellMode = "light" | "dark";
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
    description: "Тёплый оранжевый, медь и мягкие песочные оттенки.",
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
    description: "Ледяной голубой, серебристый и мягкие синие оттенки.",
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
    description: "Свежая зелень, мягкий розовый и природные оттенки.",
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
    description: "Солнечный золотистый, морская бирюза и песочные оттенки.",
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
export function paletteForSeason(
  id: ShellSeasonId,
  mode: ShellMode = "dark",
): ShellPalette {
  if (mode === "light") return lightShellPalettes[resolveShellSeason(id)];
  return findShellSeason(id)?.palette ?? autumnPalette;
}
