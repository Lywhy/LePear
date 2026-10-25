import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { appearMotion } from "@/lib/motion-presets";

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} {...appearMotion(reduced !== false)}>
      {children}
    </motion.div>
  );
}
