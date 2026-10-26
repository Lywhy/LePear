import latin from "@fontsource-variable/noto-serif/files/noto-serif-latin-wght-normal.woff2?url";
import cyrillic from "@fontsource-variable/noto-serif/files/noto-serif-cyrillic-wght-normal.woff2?url";
import unicode from "@fontsource-variable/noto-serif/unicode.json";
export default {
  files: [latin, cyrillic],
  unicode: [unicode.latin, unicode.cyrillic],
} as const;
