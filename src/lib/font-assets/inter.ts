import latin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import cyrillic from "@fontsource-variable/inter/files/inter-cyrillic-wght-normal.woff2?url";
import unicode from "@fontsource-variable/inter/unicode.json";
export default {
  files: [latin, cyrillic],
  unicode: [unicode.latin, unicode.cyrillic],
} as const;
