import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sprout } from "lucide-react";
import { cn } from "cn";

export function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2 text-2xl font-semibold tracking-tight text-[#f2f3ed] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]"
      aria-label="LePear — на главную"
    >
      <Sprout className="size-7 text-[#d3ed9a]" aria-hidden="true" />
      LePear
    </Link>
  );
}
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
      <ArrowUpRight size={18} aria-hidden="true" />
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
