/** Shared section focus/scroll. No CSS smooth-scroll competing with router navigation. */
let pendingFrame: number | null = null;
export function prefersInstantScroll() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function focusAndScrollTo(target: HTMLElement, instant = false) {
  if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
  if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
  target.focus({ preventScroll: true });
  // Focus can reveal a Motion block; let that commit before measuring its final position.
  const frame = requestAnimationFrame(() => {
    if (pendingFrame === frame) pendingFrame = null;
    if (target.isConnected)
      target.scrollIntoView({
        block: "start",
        behavior: instant || prefersInstantScroll() ? "auto" : "smooth",
      });
  });
  pendingFrame = frame;
  return () => {
    cancelAnimationFrame(frame);
    if (pendingFrame === frame) pendingFrame = null;
  };
}
export function scrollToSection(id: string, instant = false) {
  const target = document.getElementById(id);
  return target ? focusAndScrollTo(target, instant) : () => {};
}
