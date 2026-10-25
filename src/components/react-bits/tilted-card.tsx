// Source: React Bits TiltedCard-TS-TW, https://reactbits.dev/r/TiltedCard-TS-TW.json
// Local adaptation: pointer tilt only, using existing Motion springs.
// No flip, tooltip, device orientation, floating loop or additional engine.
import { useEffect, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

export default function TiltedCard({
  children,
  effectsEnabled = true,
  className,
}: {
  children: ReactNode;
  effectsEnabled?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const enabled = effectsEnabled && reduced === false;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 180, damping: 30 });
  const rotateY = useSpring(y, { stiffness: 180, damping: 30 });
  useEffect(() => {
    if (!enabled) {
      x.set(0);
      y.set(0);
    }
  }, [enabled, x, y]);
  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        className={className}
        style={{
          rotateX: enabled ? rotateX : 0,
          rotateY: enabled ? rotateY : 0,
        }}
        onPointerMove={(event) => {
          if (!enabled || event.pointerType !== "mouse") return;
          const box = event.currentTarget.getBoundingClientRect();
          if (!box.width || !box.height) return;
          x.set(-((event.clientY - box.top) / box.height - 0.5) * 8);
          y.set(((event.clientX - box.left) / box.width - 0.5) * 8);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
