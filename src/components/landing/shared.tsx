import { cn } from "cn";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function EditorLink({
  children = "Открыть редактор",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to="/editor"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-shell-accent px-5 py-3 text-sm font-medium text-shell-accent-ink transition-colors hover:bg-shell-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-shell-accent motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </Link>
  );
}
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-shell-accent/20 bg-shell-accent/5 px-3 py-1 font-mono text-sm leading-6 tracking-wide text-shell-muted">
      <span
        className="size-1.5 shrink-0 rounded-full bg-shell-accent"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}
