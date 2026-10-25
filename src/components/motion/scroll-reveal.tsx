import { motion, useInView, useReducedMotion } from "motion/react";
import {
  useCallback,
  useContext,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { BlockRevealContext } from "@/components/motion/reveal-context";

const elements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  li: motion.li,
};
const hidden = { opacity: 0, y: 20 };
const visible = { opacity: 1, y: 0 };
type Props = Pick<
  HTMLAttributes<HTMLElement>,
  | "id"
  | "className"
  | "tabIndex"
  | "role"
  | "aria-label"
  | "aria-labelledby"
  | "aria-hidden"
  | "aria-busy"
> & {
  as?: keyof typeof elements;
  children: ReactNode;
  delay?: number;
};
export function ScrollReveal({
  as = "div",
  children,
  delay = 0,
  ...props
}: Props) {
  const preference = useReducedMotion();
  const [initialReduced] = useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [canObserve] = useState(
    () => typeof IntersectionObserver !== "undefined",
  );
  const nested = useContext(BlockRevealContext);
  if (nested || (preference ?? initialReduced) || !canObserve) {
    const Tag = as;
    return (
      <BlockRevealContext.Provider value={true}>
        <Tag {...props}>{children}</Tag>
      </BlockRevealContext.Provider>
    );
  }
  return (
    <AnimatedBlock {...props} as={as} delay={delay}>
      {children}
    </AnimatedBlock>
  );
}
function AnimatedBlock({ as = "div", children, delay = 0, ...props }: Props) {
  const scope = useRef<HTMLElement | null>(null);
  const attach = useCallback((element: HTMLElement | null) => {
    scope.current = element;
  }, []);
  const inView = useInView(scope, {
    once: true,
    amount: "some",
    margin: "0px 0px -24px 0px",
  });
  const [focused, setFocused] = useState(false);
  const Tag = elements[as];
  return (
    <BlockRevealContext.Provider value={true}>
      <Tag
        {...props}
        ref={attach}
        initial={hidden}
        animate={inView || focused ? visible : hidden}
        onFocusCapture={() => setFocused(true)}
        transition={
          focused
            ? { duration: 0 }
            : {
                duration: 0.65,
                delay: Math.min(0.24, Math.max(0, delay)),
                ease: [0.22, 1, 0.36, 1],
              }
        }
      >
        {children}
      </Tag>
    </BlockRevealContext.Provider>
  );
}
