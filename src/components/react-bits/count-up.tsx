// Source: React Bits CountUp-TS-TW, https://reactbits.dev/r/CountUp-TS-TW.json
// Local adaptation: count mode only; stable accessible final value and reactive reduced motion.
import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export default function CountUp({
  to,
  from = 0,
  duration = 0.8,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
}) {
  const scope = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const inView = useInView(scope, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = text.current;
    if (!node || !inView || reduced !== false) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        node.textContent = String(Math.round(value));
      },
      onComplete: () => {
        node.textContent = String(to);
      },
    });
    return () => {
      controls.stop();
      node.textContent = String(to);
    };
  }, [from, to, duration, inView, reduced]);
  return (
    <span ref={scope} className={className}>
      <span aria-hidden="true" ref={text}>
        {to}
      </span>
      <span className="sr-only">{to}</span>
    </span>
  );
}
