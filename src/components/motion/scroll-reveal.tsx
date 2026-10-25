import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { motionTransitions } from "@/lib/motion-presets";

/** Visible before entry; a one-time movement starts only when the section is in view. */
export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced !== false ? { y: 0 } : { y: [8, 0] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={reduced !== false ? { duration: 0 } : motionTransitions.enter}
    >
      {children}
    </motion.div>
  );
}
