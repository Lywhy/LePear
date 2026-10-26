/** Shared styling for the app shell/marketing pages, not exported user themes. */
export const designClasses = {
  page: "min-h-dvh bg-shell-background font-sans text-shell-text selection:bg-shell-accent selection:text-shell-accent-ink",
  container: "mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-14",
  section: "py-12 sm:py-16 lg:py-24",
  stack: "flex flex-col gap-4 sm:gap-6",
  grid: "grid gap-4 sm:gap-6 lg:gap-8",
  eyebrow: "text-sm leading-6 font-medium tracking-[0.12em] text-shell-soft",
  heroTitle:
    "font-[family-name:Arial_Black,Arial,sans-serif] text-4xl leading-[1.08] font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl [overflow-wrap:anywhere]",
  sectionTitle:
    "font-[family-name:Arial_Black,Arial,sans-serif] text-3xl leading-tight font-black tracking-[-0.03em] sm:text-4xl [overflow-wrap:anywhere]",
  cardTitle:
    "font-[family-name:Arial_Black,Arial,sans-serif] text-xl leading-snug font-black tracking-tight [overflow-wrap:anywhere]",
  body: "text-base leading-7 text-shell-muted [overflow-wrap:anywhere]",
  caption: "text-sm leading-6 text-shell-muted [overflow-wrap:anywhere]",
  surface:
    "min-w-0 rounded-2xl border border-shell-divider/10 bg-shell-surface p-5 sm:p-6",
  inset:
    "min-w-0 rounded-xl border border-shell-divider/10 bg-shell-raised p-4",
  primaryAction:
    "h-auto min-h-11 gap-2 rounded-lg bg-shell-accent px-4 py-3 text-sm leading-6 font-medium text-shell-accent-ink whitespace-normal hover:bg-shell-accent-hover focus-visible:border-shell-accent focus-visible:ring-shell-accent/40",
  secondaryAction:
    "h-auto min-h-11 gap-2 rounded-lg border-shell-divider/20 bg-transparent px-4 py-3 text-sm leading-6 text-shell-soft whitespace-normal hover:bg-shell-divider/5 focus-visible:border-shell-accent focus-visible:ring-shell-accent/40",
  quietAction:
    "h-auto min-h-11 rounded-lg px-3 py-2 text-sm leading-6 text-shell-soft hover:bg-shell-divider/5 focus-visible:border-shell-accent focus-visible:ring-shell-accent/40",
  focus:
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-shell-accent",
} as const;
