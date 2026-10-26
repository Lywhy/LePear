import { CircleCheck, CircleAlert, Info, LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { feedbackMotion } from "@/lib/motion-presets";

export function TransferStatus({
  message,
  tone = "info",
}: {
  message: string;
  tone?: "info" | "success" | "warning" | "error" | "loading";
}) {
  const reduced = useReducedMotion();
  const Icon =
    tone === "success"
      ? CircleCheck
      : tone === "loading"
        ? LoaderCircle
        : tone === "error" || tone === "warning"
          ? CircleAlert
          : Info;
  const colors =
    tone === "error"
      ? "border-shell-danger/25 bg-shell-danger/5 text-shell-danger"
      : tone === "warning"
        ? "border-shell-warning/25 bg-shell-warning/5 text-shell-warning"
        : tone === "success"
          ? "border-shell-accent/25 bg-shell-accent/5 text-shell-accent"
          : "border-shell-divider/15 bg-shell-deep text-shell-soft";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-atomic="true"
      className={"min-h-14 rounded-xl border p-3 text-sm leading-6 " + colors}
    >
      <motion.div
        key={message}
        className="flex min-w-0 items-start gap-2.5"
        {...feedbackMotion(reduced !== false)}
      >
        <Icon
          size={18}
          aria-hidden="true"
          className={
            "mt-0.5 shrink-0 " +
            (tone === "loading"
              ? "animate-spin motion-reduce:animate-none"
              : "")
          }
        />
        <span className="min-w-0 wrap-anywhere">{message}</span>
      </motion.div>
    </div>
  );
}
