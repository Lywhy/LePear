import { CircleCheck, CircleAlert, LoaderCircle, X } from "lucide-react";
import { MotionIcon } from "@/components/motion/motion-icon";
import type { VideoJob } from "@/lib/youtube-jobs";

/** Server status remains authoritative; the adjacent text announces each state. */
export function DownloadStateIcon({ status }: { status: VideoJob["status"] }) {
  const ready = status === "ready";
  const cancelled = status === "cancelled";
  const failed = status === "failed" || status === "expired";
  return (
    <MotionIcon
      icon={
        ready
          ? CircleCheck
          : cancelled
            ? X
            : failed
              ? CircleAlert
              : LoaderCircle
      }
      state={
        ready
          ? "success"
          : cancelled
            ? "cancelled"
            : failed
              ? "error"
              : "loading"
      }
      size={18}
      className="mt-1"
    />
  );
}
