import { useEffect, useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { designClasses as ui } from "@/lib/design-system";
import { pageLinks, landingLinks } from "@/lib/navigation";

export function SiteHeader({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const current =
    pageLinks.find((link) => link.to === pathname) ?? pageLinks[0];
  const editor = pathname === "/editor";
  return (
    <header className="relative z-30 border-b border-white/10 bg-[#0e100f]">
      <div
        className={`${ui.container} flex min-h-20 items-center justify-between gap-3 py-3`}
      >
        <div className="min-w-0 lg:hidden">
          {pathname !== "/" ? (
            <Link
              to="/"
              className={`inline-flex min-h-11 items-center gap-2 text-sm text-[#c5d1b9] ${ui.focus}`}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span className="sm:hidden">Домой</span>
              <span className="hidden sm:inline">На главную</span>
            </Link>
          ) : (
            <span className="text-base font-medium">Главная</span>
          )}
        </div>
        <nav
          className="hidden items-center gap-2 lg:flex"
          aria-label="Основная навигация"
        >
          {pageLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center rounded-lg px-4 text-sm ${ui.focus} ${isActive ? "bg-[#22291e] text-[#d3ed9a]" : "text-[#b1bda7] hover:bg-white/5 hover:text-[#f2f3ed]"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {editor && (
            <span className={`hidden sm:inline ${ui.caption}`}>
              Рабочее пространство
            </span>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 text-[#dbe4d2] lg:hidden focus-visible:ring-[#d3ed9a]/40"
                />
              }
              aria-label="Открыть меню"
              aria-expanded={open}
              aria-controls="site-mobile-navigation"
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              id="site-mobile-navigation"
              side="right"
              showCloseButton={false}
              className="dark w-[min(100%,24rem)] gap-0 border-white/15 bg-[#171c17] text-[#f2f3ed] data-[side=right]:w-[min(100%,24rem)] motion-reduce:transition-none motion-reduce:data-starting-style:translate-x-0 motion-reduce:data-ending-style:translate-x-0"
            >
              <SheetHeader className="relative border-b border-white/10 p-5 pr-16">
                <SheetTitle className="text-xl text-[#f2f3ed]">
                  Навигация
                </SheetTitle>
                <SheetDescription className="mt-2 text-sm leading-6 text-[#b1bda7]">
                  Сейчас: {current.label}
                </SheetDescription>
                <SheetClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 size-11 text-[#dbe4d2] focus-visible:ring-[#d3ed9a]/40"
                    />
                  }
                  aria-label="Закрыть меню"
                >
                  <X aria-hidden="true" />
                </SheetClose>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <nav className="space-y-2" aria-label="Мобильная навигация">
                  {pageLinks.map((link) => (
                    <SheetClose
                      key={link.to}
                      nativeButton={false}
                      render={<Link to={link.to} />}
                      aria-current={pathname === link.to ? "page" : undefined}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-lg px-4 py-3 text-base ${ui.focus} ${pathname === link.to ? "bg-[#22291e] text-[#d3ed9a]" : "text-[#dbe4d2] hover:bg-white/5"}`}
                    >
                      {link.label}
                    </SheetClose>
                  ))}
                </nav>
                <nav
                  className="mt-6 space-y-1 border-t border-white/10 pt-5"
                  aria-label="Разделы главной страницы"
                >
                  {landingLinks.map((link) => (
                    <SheetClose
                      key={link.to}
                      nativeButton={false}
                      render={<Link to={link.to} />}
                      className={`flex min-h-11 items-center rounded-lg px-4 py-2 text-sm text-[#b1bda7] hover:bg-white/5 hover:text-white ${ui.focus}`}
                    >
                      {link.label}
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
