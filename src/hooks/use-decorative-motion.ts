import { useInView, useReducedMotion } from "motion/react";
import { useSyncExternalStore, type RefObject } from "react";

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function isDocumentVisible() {
  return document.visibilityState === "visible";
}
const desktopQuery = "(min-width: 768px) and (pointer: fine)";
function subscribeDesktop(callback: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function isDesktop() {
  return window.matchMedia(desktopQuery).matches;
}
function disabledOnServer() {
  return false;
}

/** Mount a looping React Bits effect only while true; otherwise render its static fallback. */
export function useDecorativeMotion(scope: RefObject<Element | null>) {
  const reduced = useReducedMotion();
  const inView = useInView(scope, { amount: 0.1 });
  const visible = useSyncExternalStore(
    subscribeVisibility,
    isDocumentVisible,
    disabledOnServer,
  );
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    isDesktop,
    disabledOnServer,
  );
  return reduced === false && inView && visible && desktop;
}
