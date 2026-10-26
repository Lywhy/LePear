import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { cn } from "cn";

function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props<string>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-4", className)}
      {...props}
    />
  );
}
function RadioGroupItem({
  className,
  ...props
}: RadioPrimitive.Root.Props<string>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      nativeButton={false}
      render={<div />}
      className={cn(
        "min-w-0 cursor-pointer rounded-xl border border-shell-divider/15 bg-shell-deep p-5 outline-none data-checked:border-shell-accent data-checked:bg-shell-raised focus-visible:ring-2 focus-visible:ring-shell-accent focus-visible:ring-offset-4 focus-visible:ring-offset-shell-surface data-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}
const RadioGroupIndicator = RadioPrimitive.Indicator;
export { RadioGroup, RadioGroupItem, RadioGroupIndicator };
