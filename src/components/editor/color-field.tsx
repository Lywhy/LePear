import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { normalizeColor } from "@/lib/theme-palettes";

function editableColor(input: string, opaque: boolean) {
  let hex = input.trim().replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(hex) || (!opaque && /^[\da-f]{4}$/i.test(hex)))
    hex = [...hex].map((char) => char + char).join("");
  return normalizeColor("#" + hex, opaque);
}
export function ColorField({
  label,
  value,
  opaque = false,
  onChange,
}: {
  label: string;
  value: string;
  opaque?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const [field, setField] = useState({
    source: value,
    draft: value.slice(1).toUpperCase(),
    error: "",
  });
  // Keep incomplete local text until the parent actually replaces this color.
  if (field.source !== value)
    setField({ source: value, draft: value.slice(1).toUpperCase(), error: "" });
  const { draft, error } = field;
  const opacity = Math.round(
    (value.length === 9 ? parseInt(value.slice(7), 16) / 255 : 1) * 100,
  );
  function apply(color: string) {
    setField({ source: color, draft: color.slice(1).toUpperCase(), error: "" });
    onChange(color);
  }
  function edit(input: string) {
    const next = input.replace(/^#/, "").toUpperCase();
    // Short HEX is committed on blur/Enter, avoiding intermediate 3/4-digit changes.
    const full = /^(?:[\dA-F]{6}|[\dA-F]{8})$/.test(next)
      ? editableColor(next, opaque)
      : null;
    setField({ source: full ?? value, draft: next, error: "" });
    if (full) onChange(full);
  }
  function commit() {
    const color = editableColor(draft, opaque);
    if (color) apply(color);
    else
      setField({
        source: value,
        draft,
        error: opaque
          ? "Введите 3 или 6 символов HEX, например FF9B45."
          : "Введите 3, 4, 6 или 8 символов HEX. Последние два задают прозрачность.",
      });
  }
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-2 text-sm leading-5">
        {label}
      </Label>
      <div
        className={
          "flex min-h-12 min-w-0 items-center overflow-hidden rounded-lg border-0 bg-shell-deep transition-colors focus-within:border-shell-accent focus-within:ring-2 focus-within:ring-shell-accent/25 motion-reduce:transition-none " +
          (error ? "ring-2 ring-shell-danger/40" : "")
        }
      >
        <div className="relative m-1.5 size-9 shrink-0 overflow-hidden rounded-md bg-[conic-gradient(#ffffff24_25%,transparent_0_50%,#ffffff24_0_75%,transparent_0)] bg-size-[8px_8px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value.slice(0, 7)}
            aria-label={label + ": открыть выбор цвета"}
            onChange={(event) =>
              apply(event.target.value + (opaque ? "" : value.slice(7)))
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <span
          aria-hidden="true"
          className="pl-1 font-mono text-base text-shell-dim"
        >
          #
        </span>
        <Input
          id={id}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={9}
          aria-invalid={!!error}
          aria-describedby={error ? id + "-error" : id + "-hint"}
          onChange={(event) => edit(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setField({
                source: value,
                draft: value.slice(1).toUpperCase(),
                error: "",
              });
            }
          }}
          className="h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 font-mono text-base text-shell-text tabular-nums shadow-none ring-0 outline-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        />
        <span
          aria-hidden="true"
          className="pr-3 text-xs font-medium tracking-wide text-shell-dim"
        >
          HEX
        </span>
      </div>
      <p id={id + "-hint"} className="sr-only">
        Введите HEX с решёткой или без неё. Enter применяет, Escape возвращает
        последний корректный цвет.
      </p>
      {error && (
        <p
          id={id + "-error"}
          role="status"
          className="mt-2 text-sm leading-6 text-shell-danger"
        >
          {error} Сохраняется последний корректный цвет. Escape — отменить ввод.
        </p>
      )}
      {!opaque && (
        <details className="mt-2">
          <summary className="flex min-h-8 cursor-pointer items-center justify-between gap-3 rounded text-sm text-shell-muted outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/40">
            <span id={id + "-opacity-label"}>Непрозрачность</span>
            <span className="font-mono tabular-nums">{opacity}%</span>
          </summary>
          <div className="px-1 py-3">
            <Slider
              min={0}
              max={100}
              step={1}
              value={[opacity]}
              aria-labelledby={id + "-opacity-label"}
              thumbProps={{
                "aria-labelledby": id + "-opacity-label",
                "aria-valuetext": opacity + "%",
              }}
              onValueChange={(next) => {
                const amount = Array.isArray(next) ? next[0] : next;
                if (typeof amount !== "number") return;
                const alpha = Math.round((amount / 100) * 255)
                  .toString(16)
                  .padStart(2, "0");
                apply(value.slice(0, 7) + (amount === 100 ? "" : alpha));
              }}
              className="[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-shell-hover [&_[data-slot=slider-range]]:bg-shell-accent [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-shell-accent [&_[data-slot=slider-thumb]]:bg-shell-text [&_[data-slot=slider-thumb]]:ring-shell-accent/40"
            />
          </div>
        </details>
      )}
    </div>
  );
}
