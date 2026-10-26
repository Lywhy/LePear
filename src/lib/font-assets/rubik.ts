import latin from "@fontsource-variable/rubik/files/rubik-latin-wght-normal.woff2?url";
import cyrillic from "@fontsource-variable/rubik/files/rubik-cyrillic-wght-normal.woff2?url";
import unicode from "@fontsource-variable/rubik/unicode.json";
export default {
  files: [latin, cyrillic],
  unicode: [unicode.latin, unicode.cyrillic],
} as const;
