import { useEffect, useState } from "react";
import { fontInfo, type ThemeFont } from "@/lib/font-catalog";
type FontAssets = {
  default: {
    files: readonly [string, string];
    unicode: readonly [string, string];
  };
};
const imports: Partial<Record<ThemeFont, () => Promise<FontAssets>>> = {
  Inter: () => import("@/lib/font-assets/inter"),
  Manrope: () => import("@/lib/font-assets/manrope"),
  Rubik: () => import("@/lib/font-assets/rubik"),
  "Noto Serif": () => import("@/lib/font-assets/noto-serif"),
  "Roboto Mono": () => import("@/lib/font-assets/roboto-mono"),
};
const requests = new Map<ThemeFont, Promise<void>>();
async function ensureFont(font: ThemeFont) {
  const info = fontInfo(font);
  if (!info.webFamily) return;
  let request = requests.get(font);
  if (!request) {
    request = (async () => {
      const assets = await imports[font]?.();
      if (assets) {
        if (!document.fonts || typeof FontFace === "undefined")
          throw new Error("Font loading API is unavailable.");
        const faces = assets.default.files.map(
          (url, index) =>
            new FontFace(
              info.webFamily!,
              'url("' + url + '") format("woff2")',
              {
                style: "normal",
                weight: info.weights?.join(" ") ?? "400",
                display: "swap",
                unicodeRange: assets.default.unicode[index],
              },
            ),
        );
        const loaded = await Promise.all(faces.map((face) => face.load()));
        for (const face of loaded) document.fonts.add(face);
      }
      if (!document.fonts) throw new Error("Font loading API is unavailable.");
      const faces = await document.fonts.load(
        '400 18px "' + info.webFamily + '"',
        "Своя тема Your style 0123456789",
      );
      if (!faces.length || faces.some((face) => face.status !== "loaded"))
        throw new Error("Font files could not be loaded.");
    })();
    requests.set(font, request);
    void request.catch(() => {
      if (requests.get(font) === request) requests.delete(font);
    });
  }
  await request;
}
type FontState = { font?: ThemeFont; phase: "ready" | "error" };
/** Async font setup only; no network call or ref mutation during render. */
export function useThemeFont(font?: ThemeFont) {
  const [state, setState] = useState<FontState>({ phase: "ready" });
  useEffect(() => {
    if (!font || !fontInfo(font).webFamily) return;
    let active = true;
    void ensureFont(font).then(
      () => {
        if (active) setState({ font, phase: "ready" });
      },
      () => {
        if (active) setState({ font, phase: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, [font]);
  if (!font || !fontInfo(font).webFamily) return "system";
  return state.font === font ? state.phase : "loading";
}
