import { createInitialTheme } from "@/lib/site-theme";
import { shellColors as colors } from "@/lib/shell-palette";

/** Independent illustration. Never loaded into the workspace or storage. */
export const landingPreviewTheme = createInitialTheme();
landingPreviewTheme.palettes.dark = {
  background: colors.deep,
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
  border: colors.line + "70",
  input: colors.line,
  ring: colors.accent,
};
