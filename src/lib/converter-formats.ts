import formats from "../../shared/converter-formats.json";
export type ConverterCategory = "audio" | "image";
export interface ConverterFormat {
  id: string;
  label: string;
  category: ConverterCategory;
  extensions: string[];
  mime: string;
}
export const converterFormats = formats as ConverterFormat[];
export function formatForName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();
  return converterFormats.find((format) =>
    format.extensions.includes(extension ?? ""),
  );
}
export function targetsForName(name: string) {
  const source = formatForName(name);
  return source
    ? converterFormats.filter(
        (format) =>
          format.category === source.category && format.id !== source.id,
      )
    : [];
}
export const converterAccept = converterFormats
  .flatMap((format) => format.extensions.map((extension) => "." + extension))
  .join(",");
