import { useId } from "react";
import { Slider } from "@/components/ui/slider";

export function SettingsRange({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-[#121810] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span id={id + "-label"} className="text-sm leading-6 font-medium">
          {label}
        </span>
        <output
          htmlFor={id}
          className="min-w-16 rounded-md border border-white/10 bg-[#22291e] px-2 py-1 text-right font-mono text-sm leading-5 text-[#e1edce] tabular-nums"
        >
          {Number(value.toFixed(3))}
          {unit && <span className="ml-1 text-[#b1bda7]">{unit}</span>}
        </output>
      </div>
      <Slider
        id={id}
        aria-labelledby={id + "-label"}
        aria-describedby={id + "-hint"}
        min={min}
        max={max}
        step={step}
        // Position from the value even when an accordion panel has zero width.
        thumbAlignment="center"
        value={[value]}
        onValueChange={(next) => {
          const number = typeof next === "number" ? next : next[0];
          if (number !== undefined) onChange(Number(number.toFixed(3)));
        }}
        className="py-4 **:data-[slot=slider-track]:bg-white/15 **:data-[slot=slider-range]:bg-[#d3ed9a] **:data-[slot=slider-thumb]:size-4 **:data-[slot=slider-thumb]:border-[#d3ed9a] **:data-[slot=slider-thumb]:bg-[#edf1e7] **:data-[slot=slider-thumb]:ring-[#d3ed9a]/30 motion-reduce:**:data-[slot=slider-thumb]:transition-none"
      />
      <div
        aria-hidden="true"
        className="flex justify-between gap-2 font-mono text-sm text-[#9da992] tabular-nums"
      >
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
      <p id={id + "-hint"} className="mt-2 text-sm leading-6 text-[#b1bda7]">
        {hint}
      </p>
    </div>
  );
}
