import type { CSSProperties } from "react";

export const themeColors = [
  { name: "Lime", value: "#d3ed9a", className: "bg-[#d3ed9a]" },
  { name: "Sky", value: "#9fd6ef", className: "bg-[#9fd6ef]" },
  { name: "Apricot", value: "#efb48c", className: "bg-[#efb48c]" },
  { name: "Lavender", value: "#c2b4ef", className: "bg-[#c2b4ef]" },
  { name: "Rose", value: "#edabc0", className: "bg-[#edabc0]" },
];
export type SiteTheme = {
  accent: string;
  mode: "light" | "dark";
  font: "Geist" | "System" | "Georgia";
  fontSize: number;
  radius: number;
};
export const initialTheme: SiteTheme = {
  accent: "#d3ed9a",
  mode: "dark",
  font: "Geist",
  fontSize: 16,
  radius: 10,
};
export const fontFamilies = {
  Geist: "'Geist Variable', sans-serif",
  System: "system-ui, sans-serif",
  Georgia: "Georgia, serif",
};
export function accentForeground(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]! > 0.179
    ? "#111811"
    : "#ffffff";
}
export function themeTokens(theme: SiteTheme): Record<string, string> {
  const dark = theme.mode === "dark";
  return {
    "--background": dark ? "#101310" : "#f4f6f0",
    "--foreground": dark ? "#edf1e7" : "#20271c",
    "--card": dark ? "#1a2017" : "#ffffff",
    "--card-foreground": dark ? "#edf1e7" : "#20271c",
    "--popover": dark ? "#1a2017" : "#ffffff",
    "--popover-foreground": dark ? "#edf1e7" : "#20271c",
    "--primary": theme.accent,
    "--primary-foreground": accentForeground(theme.accent),
    "--secondary": dark ? "#2b3426" : "#e6ecde",
    "--secondary-foreground": dark ? "#edf1e7" : "#20271c",
    "--muted": dark ? "#252d21" : "#e8ede2",
    "--muted-foreground": dark ? "#b1bda6" : "#5c6952",
    "--accent": dark ? "#2b3426" : "#e6ecde",
    "--accent-foreground": dark ? "#edf1e7" : "#20271c",
    "--destructive": dark ? "#ff938f" : "#b72922",
    "--border": dark ? "#ffffff1c" : "#34462526",
    "--input": dark ? "#ffffff26" : "#34462533",
    "--ring": theme.accent,
    "--radius": `${theme.radius / 16}rem`,
    "--font-sans": fontFamilies[theme.font],
    "--preview-font-size": `${theme.fontSize}px`,
  };
}
export function previewStyle(theme: SiteTheme): CSSProperties {
  return {
    ...themeTokens(theme),
    fontFamily: fontFamilies[theme.font],
    colorScheme: theme.mode,
  } as CSSProperties;
}
export function exportTheme(theme: SiteTheme) {
  const tokens = Object.entries(themeTokens(theme))
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `/* LePear: scoped theme for shadcn/ui + Tailwind CSS v4.\n * Add class="lepear-theme" to your preview or application container.\n * Geist requires @fontsource-variable/geist when selected.\n */\n.lepear-theme {\n${tokens}\n  font-family: var(--font-sans);\n  font-size: var(--preview-font-size);\n  color-scheme: ${theme.mode};\n}\n`;
}
