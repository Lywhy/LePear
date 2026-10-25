import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { feedbackMotion } from "@/lib/motion-presets";

export function SelectionFeedback({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span className={className} {...feedbackMotion(reduced !== false)}>
      {children}
    </motion.span>
  );
}
