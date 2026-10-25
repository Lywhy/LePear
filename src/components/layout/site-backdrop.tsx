import { lazy, Suspense, useRef } from "react";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";
const ShapeGrid = lazy(() => import("@/components/react-bits/shape-grid"));

/** Shell decoration only. Pointer events and exported theme tokens stay independent. */
export function SiteBackdrop() {
  const scope = useRef<HTMLDivElement>(null);
  const enabled = useDecorativeMotion(scope);
  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_8%_25%,rgba(89,119,62,0.18),transparent_52%),radial-gradient(ellipse_at_95%_75%,rgba(70,101,91,0.16),transparent_48%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(152,181,124,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(152,181,124,0.07)_1px,transparent_1px)] [background-size:96px_96px]" />
      {enabled && (
        <Suspense fallback={null}>
          <ShapeGrid
            shape="square"
            cellSize={96}
            lineWidth={0.6}
            direction="diagonal"
            speed={0.12}
            lineColor="#38512e"
            hoverColor="#d3ed9a"
            fillOpacity={0.06}
            rainbow={false}
            trail={0.4}
            glow={0.2}
            twinkle={0.03}
            clickCascade={false}
            intro={false}
            opacity={0.45}
            dpr={1}
            fade={0.4}
          />
        </Suspense>
      )}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#0e100f] to-transparent" />
    </div>
  );
}
