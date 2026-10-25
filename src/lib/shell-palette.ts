import type { CSSProperties } from "react";
/** App chrome only. User themes and exported tokens remain independent. */
export const shellColors = {
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

export const shellSwatches = [
  { name: "Orange", value: shellColors.accent, className: "bg-shell-accent" },
  { name: "Copper", value: shellColors.teal, className: "bg-shell-teal" },
  { name: "Sand", value: shellColors.sand, className: "bg-shell-sand" },
  { name: "Ember", value: shellColors.hover, className: "bg-shell-hover" },
  { name: "Cloud", value: shellColors.text, className: "bg-shell-text" },
];

/** shadcn chrome defaults; the live preview overrides these with its own palette. */
export const shellThemeStyle = {
  "--background": shellColors.background,
  "--foreground": shellColors.text,
  "--card": shellColors.surface,
  "--card-foreground": shellColors.text,
  "--popover": shellColors.raised,
  "--popover-foreground": shellColors.text,
  "--primary": shellColors.accent,
  "--primary-foreground": shellColors["accent-ink"],
  "--secondary": shellColors.raised,
  "--secondary-foreground": shellColors.soft,
  "--muted": shellColors.raised,
  "--muted-foreground": shellColors.muted,
  "--accent": shellColors.hover,
  "--accent-foreground": shellColors.text,
  "--destructive": shellColors.danger,
  "--border": shellColors.line + "66",
  "--input": shellColors.line,
  "--ring": shellColors.accent,
} as CSSProperties;

/** Set inherited palette before mounting React, including body-level portals. */
export function installShellPalette() {
  for (const [role, value] of Object.entries(shellColors)) {
    document.documentElement.style.setProperty("--shell-" + role, value);
  }
  for (const [name, value] of Object.entries(shellThemeStyle)) {
    document.documentElement.style.setProperty(name, String(value));
  }
  document.body.classList.add("bg-shell-background", "text-shell-text");
  document.documentElement.style.colorScheme = "dark";
  document.documentElement.style.backgroundColor = shellColors.background;
}
