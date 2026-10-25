import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { motionTransitions } from "@/lib/motion-presets";

export function AppMotion({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={motionTransitions.feedback}>
      {children}
    </MotionConfig>
  );
}
