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
      ? "border-[#ffb4b0]/25 bg-[#ffb4b0]/5 text-[#ffb4b0]"
      : tone === "warning"
        ? "border-[#ffd29c]/25 bg-[#ffd29c]/5 text-[#ffd29c]"
        : tone === "success"
          ? "border-[#d3ed9a]/25 bg-[#d3ed9a]/5 text-[#d3ed9a]"
          : "border-white/15 bg-[#10160f] text-[#c5d1b9]";
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
