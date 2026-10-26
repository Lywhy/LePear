import latin from "@fontsource-variable/roboto-mono/files/roboto-mono-latin-wght-normal.woff2?url";
import cyrillic from "@fontsource-variable/roboto-mono/files/roboto-mono-cyrillic-wght-normal.woff2?url";
import unicode from "@fontsource-variable/roboto-mono/unicode.json";
export default {
  files: [latin, cyrillic],
  unicode: [unicode.latin, unicode.cyrillic],
} as const;
