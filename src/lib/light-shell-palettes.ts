import type { ShellPalette, ShellSeasonId } from "@/lib/shell-seasons";
type LightTones = Pick<
  ShellPalette,
  | "background"
  | "deep"
  | "surface"
  | "raised"
  | "hover"
  | "accent"
  | "text"
  | "soft"
  | "muted"
  | "dim"
  | "teal"
  | "sand"
  | "line"
> & { accentHover: string };
function lightPalette(tones: LightTones): ShellPalette {
  const { accentHover, ...colors } = tones;
  return {
    ...colors,
    "accent-hover": accentHover,
    "accent-ink": "#ffffff",
    success: "#216847",
    warning: "#8b5815",
    danger: "#ad293b",
    "light-surface": tones.background,
    "light-ink": tones.text,
    divider: tones.text,
    "glow-amber": tones.accent + "0d",
    "glow-teal": tones.teal + "0d",
    grid: tones.line + "12",
    "glow-soft": tones.accent + "0a",
    "spotlight-border": tones.line + "4d",
    "hero-shade": tones.background + "f2",
    "hero-shade-soft": tones.background + "cc",
  };
}
export const lightShellPalettes: Record<ShellSeasonId, ShellPalette> = {
  autumn: lightPalette({
    background: "#f7eee3",
    deep: "#eee0cf",
    surface: "#fff9f1",
    raised: "#f0dfc9",
    hover: "#e5cdb1",
    accent: "#a54d1b",
    accentHover: "#8b3c13",
    text: "#3c291e",
    soft: "#574031",
    muted: "#785b47",
    dim: "#8b6c54",
    teal: "#9b6043",
    sand: "#d6b58d",
    line: "#a88766",
  }),
  winter: lightPalette({
    background: "#eaf2f8",
    deep: "#dce8f2",
    surface: "#f7fbff",
    raised: "#dfebf6",
    hover: "#cbdff0",
    accent: "#225e93",
    accentHover: "#174b79",
    text: "#20364b",
    soft: "#35516c",
    muted: "#536e86",
    dim: "#6b849a",
    teal: "#2d7786",
    sand: "#b5cfe1",
    line: "#8caac2",
  }),
  spring: lightPalette({
    background: "#eef3e6",
    deep: "#e0e9d4",
    surface: "#fafff5",
    raised: "#e2eccf",
    hover: "#cfdcbb",
    accent: "#456d31",
    accentHover: "#335423",
    text: "#2a3c27",
    soft: "#455b3d",
    muted: "#60754f",
    dim: "#778768",
    teal: "#a55e7e",
    sand: "#daddb4",
    line: "#95aa80",
  }),
  summer: lightPalette({
    background: "#f6f1dc",
    deep: "#e8e3c7",
    surface: "#fffdf0",
    raised: "#e5ecda",
    hover: "#cde1cb",
    accent: "#806017",
    accentHover: "#654a0e",
    text: "#2b4036",
    soft: "#435f4f",
    muted: "#63795f",
    dim: "#7a8d72",
    teal: "#207d75",
    sand: "#d9c58d",
    line: "#99ad88",
  }),
};
