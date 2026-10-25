import { useLayoutEffect, useRef, type RefObject } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { focusAndScrollTo } from "@/lib/anchor-scroll";

type Position = { left: number; top: number };
export function useSiteScroll(content: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, Position>());
  const previousPath = useRef<string | null>(null);
  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    const claimRestoration = () => {
      history.scrollRestoration = "manual";
    };
    if (document.readyState === "complete") claimRestoration();
    else window.addEventListener("pageshow", claimRestoration, { once: true });
    return () => {
      window.removeEventListener("pageshow", claimRestoration);
      history.scrollRestoration = previous;
    };
  }, []);
  useLayoutEffect(() => {
    const first = previousPath.current === null;
    const changedPage = !first && previousPath.current !== location.pathname;
    if (!first) history.scrollRestoration = "manual";
    previousPath.current = location.pathname;
    let cancelled = false,
      frame = 0;
    let cancelAnchor: (() => void) | undefined;
    const storedPosition =
      navigationType === "POP"
        ? positions.current.get(location.key)
        : undefined;
    // End a previous native smooth scroll before scheduling another destination.
    if (!first)
      window.scrollTo({
        left: window.scrollX,
        top: window.scrollY,
        behavior: "auto",
      });
    const remember = () => {
      positions.current.set(location.key, {
        left: window.scrollX,
        top: window.scrollY,
      });
      if (positions.current.size > 100)
        positions.current.delete(positions.current.keys().next().value!);
    };
    window.addEventListener("scroll", remember, { passive: true });
    remember();
    const restore = () => {
      if (cancelled) return;
      const stored = storedPosition;
      if (stored) {
        window.scrollTo({ ...stored, behavior: "auto" });
        if (changedPage) content.current?.focus({ preventScroll: true });
        return;
      }
      let target: HTMLElement | null = null;
      try {
        if (location.hash)
          target = document.getElementById(
            decodeURIComponent(location.hash.slice(1)),
          );
      } catch {
        /* A malformed external hash has no target. */
      }
      if (target) cancelAnchor = focusAndScrollTo(target, first);
      else if (changedPage) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        content.current?.focus({ preventScroll: true });
      }
    };
    // Waiting here also lets a closing mobile Sheet release body scroll lock.
    const schedule = () => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(restore);
      });
    };
    if (document.fonts.status === "loading")
      void document.fonts.ready.then(schedule);
    else schedule();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cancelAnchor?.();
      window.removeEventListener("scroll", remember);
    };
  }, [location.key, location.pathname, location.hash, navigationType, content]);
}
