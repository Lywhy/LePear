import { TextReveal } from "@/components/motion/text-reveal";
import { designClasses as ui } from "@/lib/design-system";
export function ToolPageHeader({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <header className="relative isolate mb-8 grid items-end gap-6 overflow-hidden rounded-3xl border border-shell-divider/10 bg-shell-surface/80 p-5 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-20 -z-10 size-80 rounded-full bg-shell-accent/6 blur-3xl"
      />
      <div>
        <p className="inline-flex max-w-full rounded-full border border-shell-accent/20 bg-shell-accent/5 px-3 py-1 font-mono text-sm leading-6 text-shell-muted wrap-anywhere">
          {eyebrow}
        </p>
        <TextReveal as="h1" className={"mt-5 " + ui.heroTitle}>
          {title}
          <br />
          <span className="text-shell-accent">{accent}</span>
        </TextReveal>
      </div>
      <TextReveal className={"max-w-lg " + ui.body}>{description}</TextReveal>
    </header>
  );
}
