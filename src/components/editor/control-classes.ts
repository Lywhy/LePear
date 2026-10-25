export const controlClasses = {
  input:
    "h-11 min-w-0 rounded-lg border-white/20 bg-shell-deep px-3 text-base text-shell-text placeholder:text-shell-dim hover:border-white/35 focus-visible:border-shell-accent focus-visible:ring-shell-accent/25 aria-invalid:border-shell-danger aria-invalid:ring-shell-danger/20 dark:bg-shell-deep disabled:cursor-not-allowed disabled:opacity-45",
  trigger:
    "h-auto min-h-11 w-full rounded-lg border-white/20 bg-shell-deep px-3 py-2 text-base text-shell-text hover:bg-shell-raised focus-visible:border-shell-accent focus-visible:ring-shell-accent/25 dark:bg-shell-deep dark:hover:bg-shell-raised *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:whitespace-normal",
  popup:
    "dark rounded-xl border border-white/20 bg-shell-raised p-1.5 font-sans text-shell-text shadow-xl ring-0 motion-reduce:animate-none [&_[data-slot=select-scroll-up-button]]:bg-shell-raised [&_[data-slot=select-scroll-down-button]]:bg-shell-raised",
  option:
    "min-h-11 rounded-lg py-2 pl-3 text-base text-shell-text data-highlighted:bg-shell-hover data-highlighted:text-shell-text data-selected:bg-shell-raised data-selected:text-shell-accent not-data-[variant=destructive]:focus:**:text-shell-text *:min-w-0 *:shrink *:whitespace-normal *:break-words",
  action:
    "h-auto min-h-11 gap-2 rounded-lg border-white/20 bg-transparent px-3 py-2 text-sm leading-6 text-shell-text whitespace-normal hover:border-white/35 hover:bg-shell-raised hover:text-shell-text focus-visible:border-shell-accent focus-visible:ring-shell-accent/25 dark:border-white/20 dark:bg-transparent dark:hover:bg-shell-raised aria-pressed:border-shell-accent/60 aria-pressed:bg-shell-raised dark:aria-pressed:border-shell-accent/60 dark:aria-pressed:bg-shell-raised motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40",
};
