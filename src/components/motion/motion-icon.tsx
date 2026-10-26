import { useRef, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";
import { motionTransitions } from "@/lib/motion-presets";

type IconEffect = "nudge" | "back" | "download" | "turn" | "press" | "close";
const interactions: Record<IconEffect, string> = {
  nudge:
    "group-hover/icon-action:translate-x-0.5 group-focus-visible/icon-action:translate-x-0.5",
  back: "group-hover/icon-action:-translate-x-0.5 group-focus-visible/icon-action:-translate-x-0.5",
  download:
    "group-hover/icon-action:translate-y-0.5 group-focus-visible/icon-action:translate-y-0.5",
  turn: "group-hover/icon-action:rotate-12 group-focus-visible/icon-action:rotate-12",
  press:
    "group-hover/icon-action:scale-110 group-focus-visible/icon-action:scale-110",
  close:
    "group-hover/icon-action:rotate-90 group-focus-visible/icon-action:rotate-90",
};
function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}
const visible = () => document.visibilityState === "visible";
const hidden = () => false;

function LoadingGlyph({ icon: Icon }: { icon: LucideIcon }) {
  const scope = useRef<HTMLSpanElement>(null);
  const inView = useInView(scope, { amount: 0.1 });
  const tabVisible = useSyncExternalStore(subscribeVisibility, visible, hidden);
  const reduced = useReducedMotion();
  const running = reduced === false && inView && tabVisible;
  return (
    <motion.span
      ref={scope}
      className="inline-flex size-full"
      initial={false}
      animate={{ rotate: running ? 360 : 0 }}
      transition={
        running
          ? { duration: 1, ease: "linear", repeat: Infinity }
          : { duration: 0 }
      }
    >
      <Icon className="size-full" />
    </motion.span>
  );
}

/** Decoration only: the parent owns its action, label, focus, and disabled state.
 * Add group/icon-action to links; Button already provides it.
 * CSS handles interaction; Motion handles state on a separate inner element.
 */
export function MotionIcon({
  icon: Icon,
  size = 18,
  effect = "press",
  state = "idle",
  className,
}: {
  icon: LucideIcon;
  size?: number;
  effect?: IconEffect;
  state?: "idle" | "loading" | "success" | "error" | "cancelled";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const feedback =
    state === "success" || state === "error" || state === "cancelled";
  return (
    <span
      aria-hidden="true"
      data-slot="motion-icon"
      style={{ width: size, height: size }}
      className={cn(
        "pointer-events-none inline-flex shrink-0 items-center justify-center align-middle transition-transform duration-200 ease-out",
        state === "idle" && interactions[effect],
        "group-disabled/icon-action:translate-0 group-disabled/icon-action:rotate-0 group-disabled/icon-action:scale-100 group-aria-disabled/icon-action:translate-0 group-aria-disabled/icon-action:rotate-0 group-aria-disabled/icon-action:scale-100 motion-reduce:translate-0 motion-reduce:rotate-0 motion-reduce:scale-100 motion-reduce:transition-none",
        className,
      )}
    >
      {state === "loading" ? (
        <LoadingGlyph icon={Icon} />
      ) : (
        <motion.span
          key={state}
          className="inline-flex size-full"
          initial={feedback && reduced === false ? { scale: 0.85 } : false}
          animate={
            feedback && reduced === false
              ? { scale: [0.85, 1.1, 1] }
              : { scale: 1 }
          }
          transition={
            reduced !== false ? { duration: 0 } : motionTransitions.enter
          }
        >
          <Icon className="size-full" />
        </motion.span>
      )}
    </span>
  );
}
