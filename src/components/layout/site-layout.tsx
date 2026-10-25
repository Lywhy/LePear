import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { SiteBackdrop } from "@/components/layout/site-backdrop";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { designClasses as ui } from "@/lib/design-system";
import { motionTransitions } from "@/lib/motion-presets";
import { pageLinks } from "@/lib/navigation";

export function SiteLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const previousPath = useRef(location.pathname);
  useLayoutEffect(() => {
    const changed = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    document.title =
      pageLinks.find((link) => link.to === location.pathname)?.title ??
      pageLinks[0].title;
    const frame = window.requestAnimationFrame(() => {
      let anchor: HTMLElement | null = null;
      try {
        anchor = location.hash
          ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
          : null;
      } catch {
        /* Ignore malformed external hash. */
      }
      if (anchor) {
        anchor.tabIndex = -1;
        anchor.focus({ preventScroll: true });
        anchor.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (changed) {
        window.scrollTo({ top: 0, behavior: "auto" });
        content.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, location.key]);
  return (
    <div className={ui.page + " relative isolate"}>
      <SiteBackdrop />
      <a
        href="#page-content"
        className={`fixed top-3 left-3 z-[100] -translate-y-24 rounded-lg bg-[#d3ed9a] px-4 py-3 text-sm text-[#182112] focus:translate-y-0 ${ui.focus}`}
      >
        К содержимому
      </a>
      <SiteHeader
        key={`header:${location.pathname}${location.hash}`}
        pathname={location.pathname}
      />
      <motion.div
        id="page-content"
        ref={content}
        key={`page:${location.pathname}`}
        tabIndex={-1}
        className="outline-none"
        initial={reduced !== false ? false : { opacity: 0.92 }}
        animate={{ opacity: 1 }}
        transition={
          reduced !== false ? { duration: 0 } : motionTransitions.enter
        }
      >
        <Outlet />
      </motion.div>
      <SiteFooter />
    </div>
  );
}
