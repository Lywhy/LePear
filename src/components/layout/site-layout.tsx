import { useSiteScroll } from "@/hooks/use-site-scroll";
import { focusAndScrollTo } from "@/lib/anchor-scroll";
import { shellThemeStyle } from "@/lib/shell-palette";
import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { SiteBackdrop } from "@/components/layout/site-backdrop";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { designClasses as ui } from "@/lib/design-system";
import { motionTransitions } from "@/lib/motion-presets";
import { allPageLinks } from "@/lib/navigation";

export function SiteLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  useSiteScroll(content);
  useLayoutEffect(() => {
    document.title =
      allPageLinks.find((link) => link.to === location.pathname)?.title ??
      allPageLinks[0].title;
  }, [location.pathname]);
  return (
    <div
      style={shellThemeStyle}
      className={ui.page + " relative isolate flex flex-col"}
    >
      <SiteBackdrop />
      <a
        href="#page-content"
        onClick={(event) => {
          event.preventDefault();
          if (content.current) focusAndScrollTo(content.current, true);
        }}
        className={`fixed top-3 left-3 z-[100] -translate-y-24 rounded-lg bg-shell-accent px-4 py-3 text-sm text-shell-accent-ink focus:translate-y-0 ${ui.focus}`}
      >
        К содержимому
      </a>
      <SiteHeader key={location.pathname} pathname={location.pathname} />
      <motion.div
        id="page-content"
        ref={content}
        key={`page:${location.pathname}`}
        tabIndex={-1}
        className="min-w-0 flex-1 scroll-mt-6 outline-none"
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
