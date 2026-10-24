import { validateTheme, type ThemeValidationResult } from "@/lib/site-theme";

export const MAX_THEME_IMPORT_BYTES = 1_000_000;
export function parseThemeJSON(text: string): ThemeValidationResult {
  if (new Blob([text]).size > MAX_THEME_IMPORT_BYTES)
    return {
      success: false,
      errors: [
        { path: "file", message: "Размер JSON не должен превышать 1 МБ." },
      ],
    };
  try {
    const value: unknown = JSON.parse(text.replace(/^\uFEFF/, ""));
    return validateTheme(value);
  } catch {
    return {
      success: false,
      errors: [
        {
          path: "JSON",
          message:
            "Не удалось прочитать JSON. Проверьте скобки, кавычки и запятые.",
        },
      ],
    };
  }
}
