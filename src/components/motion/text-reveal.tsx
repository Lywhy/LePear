import { BlockRevealContext } from "@/components/motion/reveal-context";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

const elements = {
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  span: motion.span,
};
const hidden = { opacity: 0, y: 14, filter: "blur(4px)" };
const visible = { opacity: 1, y: 0, filter: "blur(0px)" };
type TextRevealProps = {
  as?: keyof typeof elements;
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
};

/** Actual fade-in, once per mount. Keep the original semantic element and accessible text. */
export function TextReveal({ as = "p", ...props }: TextRevealProps) {
  const preference = useReducedMotion();
  const blockOwnsEntry = useContext(BlockRevealContext);
  const [initialReduced] = useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [canObserve] = useState(
    () => typeof IntersectionObserver !== "undefined",
  );
  const classes =
    as === "span" ? "inline-block " + (props.className ?? "") : props.className;
  if (blockOwnsEntry || (preference ?? initialReduced) || !canObserve) {
    const Tag = as;
    return (
      <Tag id={props.id} className={classes}>
        {props.children}
      </Tag>
    );
  }
  return <AnimatedText {...props} as={as} className={classes} />;
}
function AnimatedText({
  as = "p",
  children,
  className,
  id,
  delay,
}: TextRevealProps) {
  const scope = useRef<HTMLElement | null>(null);
  const attach = useCallback((element: HTMLElement | null) => {
    scope.current = element;
  }, []);
  const inView = useInView(scope, { once: true, amount: 0.15 });
  const Tag = elements[as];
  return (
    <Tag
      ref={attach}
      id={id}
      className={className}
      initial={hidden}
      animate={inView ? visible : hidden}
      transition={{
        duration: 0.65,
        delay: inView ? (delay ?? (as === "p" ? 0.12 : 0)) : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Tag>
  );
}
