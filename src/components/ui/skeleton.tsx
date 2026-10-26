import type { ComponentProps } from "react";
import { cn } from "cn";
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-shell-divider/10 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
