import type { ReactNode } from "react";
import {
  FolderOpen,
  Moon,
  Palette,
  Type,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const icons: Record<string, LucideIcon> = {
  library: FolderOpen,
  mode: Moon,
  colors: Palette,
  typography: Type,
  layout: SlidersHorizontal,
};

export function SettingsSection({
  value,
  title,
  summary,
  children,
}: {
  value: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  const Icon = icons[value] ?? SlidersHorizontal;
  return (
    <AccordionItem
      value={value}
      className="min-w-0 rounded-xl border border-white/10 bg-[#171c17]"
    >
      <AccordionTrigger className="min-h-20 items-center gap-3 rounded-xl px-4 py-4 text-base text-[#edf1e7] transition-none hover:no-underline focus-visible:border-[#d3ed9a] focus-visible:ring-[#d3ed9a]/30 **:data-[slot=accordion-trigger-icon]:text-[#c9dfa9]">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#22291e] text-[#c9dfa9]"
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-6">{title}</span>
          <span className="mt-1 block text-sm leading-6 font-normal text-[#b1bda7] [overflow-wrap:anywhere]">
            {summary}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="h-auto px-4 pt-1 pb-5 [&>fieldset]:border-0 [&>fieldset]:pt-0 [&>fieldset>legend]:sr-only">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
