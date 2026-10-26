import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
function notify() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  if (!listeners.size) document.addEventListener("visibilitychange", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size)
      document.removeEventListener("visibilitychange", notify);
  };
}
const getSnapshot = () => document.visibilityState === "visible";
const getServerSnapshot = () => false;

/** One document listener shared by backgrounds and functional loading indicators. */
export function useDocumentVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
