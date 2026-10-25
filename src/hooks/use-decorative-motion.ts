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
export function useDecorativeMotionState(scope: RefObject<Element | null>) {
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
  const supported = reduced === false && desktop;
  return { supported, active: supported && inView && visible };
}

/** Existing effects retain their active-only contract. */
export function useDecorativeMotion(scope: RefObject<Element | null>) {
  return useDecorativeMotionState(scope).active;
}
