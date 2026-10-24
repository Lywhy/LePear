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
        "inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#d3ed9a] px-5 py-3 text-sm font-medium text-[#182112] transition-colors hover:bg-[#e0f6b7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a] motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </Link>
  );
}
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs leading-6 tracking-widest text-[#b5c6a5]">
      <span className="size-1.5 shrink-0 bg-[#d3ed9a]" aria-hidden="true" />
      {children}
    </p>
  );
}
