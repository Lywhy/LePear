import { lightShellPalettes } from "@/lib/light-shell-palettes";
import { shellSeasons, type ShellPalette } from "@/lib/shell-seasons";
import type { ThemePalette } from "@/lib/site-theme";

function editorPalette(colors: ShellPalette): ThemePalette {
  return {
    background: colors.background,
    foreground: colors.text,
    card: colors.surface,
    cardForeground: colors.text,
    popover: colors.raised,
    popoverForeground: colors.text,
    primary: colors.accent,
    primaryForeground: colors["accent-ink"],
    secondary: colors.raised,
    secondaryForeground: colors.soft,
    muted: colors.raised,
    mutedForeground: colors.muted,
    accent: colors.hover,
    accentForeground: colors.text,
    destructive: colors.danger,
    border: colors.line + "66",
    input: colors.line,
    ring: colors.accent,
  };
}
/** Snapshots for the editor, never a subscription to the active app season. */
export const seasonalColorPresets = shellSeasons.flatMap((season) =>
  season.palette
    ? [
        {
          id: "season-" + season.id,
          name: season.name,
          description:
            "Сезонная палитра LePear: " + season.description.replace(/\.$/, ""),
          palettes: {
            light: editorPalette(lightShellPalettes[season.id]),
            dark: editorPalette(season.palette),
          },
        },
      ]
    : [],
);
