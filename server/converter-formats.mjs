import { readFileSync } from "node:fs";
export const converterFormats = JSON.parse(
  readFileSync(
    new URL("../shared/converter-formats.json", import.meta.url),
    "utf8",
  ).replace(/^\uFEFF/, ""),
);
export function formatForName(name) {
  const extension = name.split(".").pop()?.toLowerCase();
  return converterFormats.find((format) =>
    format.extensions.includes(extension),
  );
}
export function targetFor(source, id) {
  return converterFormats.find(
    (format) =>
      format.id === id &&
      format.id !== source?.id &&
      format.category === source?.category,
  );
}
