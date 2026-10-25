import { NavLink, Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { designClasses as ui } from "@/lib/design-system";
import { pageLinks, landingLinks } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-[#0e100f]">
      <div
        className={`${ui.container} flex flex-wrap items-start justify-between gap-6 py-8`}
      >
        <div className="space-y-2">
          <p className="text-sm text-[#dbe4d2]">© 2026 LePear</p>
          <a
            className={`inline-flex min-h-11 items-center gap-2 text-sm text-[#b1bda7] hover:text-white ${ui.focus}`}
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
          >
            На основе shadcn/ui
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only"> (в новой вкладке)</span>
          </a>
        </div>
        <nav
          aria-label="Навигация в подвале"
          className="flex flex-wrap gap-x-6 gap-y-1"
        >
          {pageLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center text-sm ${ui.focus} ${isActive ? "text-[#d3ed9a]" : "text-[#b1bda7] hover:text-white"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <nav
          aria-label="Разделы главной в подвале"
          className="flex flex-wrap gap-x-6 gap-y-1"
        >
          {landingLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex min-h-11 items-center text-sm text-[#b1bda7] hover:text-white ${ui.focus}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
