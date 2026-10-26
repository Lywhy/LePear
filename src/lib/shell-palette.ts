import type { CSSProperties } from "react";
import {
  autumnPalette,
  type ShellPalette,
  type ShellMode,
} from "@/lib/shell-seasons";

/** Fixed illustration palette. Live app components use useShellPalette instead. */
export const shellColors = autumnPalette;
export const shellSwatches = [
  { name: "Accent", className: "bg-shell-accent" },
  { name: "Secondary accent", className: "bg-shell-teal" },
  { name: "Soft accent", className: "bg-shell-sand" },
  { name: "Surface", className: "bg-shell-hover" },
  { name: "Text", className: "bg-shell-text" },
];

/** References remain live in overlays, independent of the editor's local tokens. */
export const shellThemeStyle = {
  "--background": "var(--shell-background)",
  "--foreground": "var(--shell-text)",
  "--card": "var(--shell-surface)",
  "--card-foreground": "var(--shell-text)",
  "--popover": "var(--shell-raised)",
  "--popover-foreground": "var(--shell-text)",
  "--primary": "var(--shell-accent)",
  "--primary-foreground": "var(--shell-accent-ink)",
  "--secondary": "var(--shell-raised)",
  "--secondary-foreground": "var(--shell-soft)",
  "--muted": "var(--shell-raised)",
  "--muted-foreground": "var(--shell-muted)",
  "--accent": "var(--shell-hover)",
  "--accent-foreground": "var(--shell-text)",
  "--destructive": "var(--shell-danger)",
  "--border": "color-mix(in srgb, var(--shell-line) 40%, transparent)",
  "--input": "var(--shell-line)",
  "--ring": "var(--shell-accent)",
} as CSSProperties;

export function installShellPalette(
  palette: ShellPalette,
  season: string,
  mode: ShellMode = "dark",
) {
  const root = document.documentElement;
  for (const [role, value] of Object.entries(palette))
    root.style.setProperty("--shell-" + role, value);
  for (const [name, value] of Object.entries(shellThemeStyle))
    root.style.setProperty(name, String(value));
  root.dataset.shellSeason = season;
  root.dataset.shellMode = mode;
  root.classList.toggle("dark", mode === "dark");
  document.body.classList.add("bg-shell-background", "text-shell-text");
  root.style.colorScheme = mode;
  root.style.backgroundColor = palette.background;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", palette.background);
}
