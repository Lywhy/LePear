import type { Transition } from "motion/react";

export const motionTiming = {
  feedback: 0.16,
  enter: 0.32,
} as const;
const ease = [0.22, 1, 0.36, 1] as const;
export const motionTransitions = {
  feedback: { type: "tween", duration: motionTiming.feedback, ease },
  enter: { type: "tween", duration: motionTiming.enter, ease },
} satisfies Record<string, Transition>;

/** Content stays readable from the first frame; no invisible waiting state. */
export function appearMotion(reduced: boolean) {
  return {
    initial: reduced ? (false as const) : { y: 8, opacity: 1 },
    animate: { y: 0, opacity: 1 },
    transition: reduced ? { duration: 0 } : motionTransitions.enter,
  };
}
export function feedbackMotion(reduced: boolean) {
  return {
    initial: reduced ? (false as const) : { y: 2, opacity: 1 },
    animate: { opacity: 1, y: 0 },
    transition: reduced ? { duration: 0 } : motionTransitions.feedback,
  };
}
