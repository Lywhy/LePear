import latin from "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url";
import cyrillic from "@fontsource-variable/manrope/files/manrope-cyrillic-wght-normal.woff2?url";
import unicode from "@fontsource-variable/manrope/unicode.json";
export default {
  files: [latin, cyrillic],
  unicode: [unicode.latin, unicode.cyrillic],
} as const;
