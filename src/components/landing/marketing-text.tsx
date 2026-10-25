import { shellColors } from "@/lib/shell-palette";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import ShinyText from "@/components/react-bits/shiny-text";
import BlurText from "@/components/react-bits/blur-text";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";

export function AccentText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const scope = useRef<HTMLSpanElement>(null);
  const enabled = useDecorativeMotion(scope);
  return (
    <span ref={scope} className={className}>
      <ShinyText
        text={text}
        color={shellColors["accent"]}
        shineColor={shellColors.text}
        speed={1.8}
        trigger="view"
        glow={0}
        disabled={!enabled}
      />
    </span>
  );
}
export function RevealText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced !== false) return <span className={className}>{text}</span>;
  return (
    <BlurText
      text={text}
      className={className}
      delay={70}
      blur={5}
      distance={12}
      trigger="view"
      loop={false}
      stepDuration={0.45}
      animationFrom={{ filter: "blur(5px)", y: 12, opacity: 0.65 }}
      animationTo={[{ filter: "blur(0px)", y: 0, opacity: 1 }]}
    />
  );
}
