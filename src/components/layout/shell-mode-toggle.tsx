import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectShellMode, useShellSettings } from "@/lib/shell-settings";
import { designClasses as ui } from "@/lib/design-system";
export function ShellModeToggle() {
  const { mode } = useShellSettings();
  const next = mode === "dark" ? "light" : "dark";
  const Icon = next === "light" ? Sun : Moon;
  const label =
    next === "light"
      ? "Включить светлую тему LePear"
      : "Включить тёмную тему LePear";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={
        "size-11 text-shell-soft hover:bg-shell-divider/5 hover:text-shell-text " +
        ui.focus
      }
      onClick={() => selectShellMode(next)}
    >
      <Icon size={20} aria-hidden="true" />
    </Button>
  );
}
