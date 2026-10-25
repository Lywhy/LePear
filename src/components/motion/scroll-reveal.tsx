import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Visible before entry; a one-time movement starts only when the section is in view. */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={
        reduced !== false
          ? { y: 0, opacity: 1 }
          : { y: [24, 0], opacity: [0.82, 1] }
      }
      viewport={{ once: true, amount: 0.15 }}
      transition={
        reduced !== false
          ? { duration: 0 }
          : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
