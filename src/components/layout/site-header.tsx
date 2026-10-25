import { shellThemeStyle } from "@/lib/shell-palette";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const pendingTo = useRef<string | null>(null);
  const skipReturnFocus = useRef(false);
  function closeAndNavigate(event: MouseEvent<HTMLAnchorElement>, to: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    pendingTo.current = to;
    skipReturnFocus.current = true;
    setOpen(false);
  }
  function changeOpen(next: boolean) {
    if (next) {
      pendingTo.current = null;
      skipReturnFocus.current = false;
    }
    setOpen(next);
  }
  function afterOpenChange(next: boolean) {
    if (next || !pendingTo.current) return;
    const to = pendingTo.current;
    pendingTo.current = null;
    const same =
      to ===
      window.location.pathname + window.location.search + window.location.hash;
    void navigate(to, { replace: same });
  }
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
    <header className="relative z-30 border-b border-white/10 bg-shell-background">
      <div
        className={`${ui.container} flex min-h-20 items-center justify-between gap-3 py-3`}
      >
        <div className="min-w-0 lg:hidden">
          {pathname !== "/" ? (
            <Link
              to="/"
              className={`inline-flex min-h-11 items-center gap-2 text-sm text-shell-soft ${ui.focus}`}
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
                `inline-flex min-h-11 items-center rounded-lg px-4 text-sm ${ui.focus} ${isActive ? "bg-shell-raised text-shell-accent" : "text-shell-muted hover:bg-white/5 hover:text-shell-text"}`
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
          <Sheet
            open={open}
            onOpenChange={changeOpen}
            onOpenChangeComplete={afterOpenChange}
          >
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 text-shell-soft lg:hidden focus-visible:ring-shell-accent/40"
                />
              }
              aria-label="Открыть меню"
              aria-expanded={open}
              aria-controls="site-mobile-navigation"
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              style={shellThemeStyle}
              finalFocus={() => (skipReturnFocus.current ? false : true)}
              id="site-mobile-navigation"
              side="right"
              showCloseButton={false}
              className="dark w-[min(100%,24rem)] gap-0 border-white/15 bg-shell-surface text-shell-text data-[side=right]:w-[min(100%,24rem)] motion-reduce:transition-none motion-reduce:data-starting-style:translate-x-0 motion-reduce:data-ending-style:translate-x-0"
            >
              <SheetHeader className="relative border-b border-white/10 p-5 pr-16">
                <SheetTitle className="text-xl text-shell-text">
                  Навигация
                </SheetTitle>
                <SheetDescription className="mt-2 text-sm leading-6 text-shell-muted">
                  Сейчас: {current.label}
                </SheetDescription>
                <SheetClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 size-11 text-shell-soft focus-visible:ring-shell-accent/40"
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
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={(event) => closeAndNavigate(event, link.to)}
                      aria-current={pathname === link.to ? "page" : undefined}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-lg px-4 py-3 text-base ${ui.focus} ${pathname === link.to ? "bg-shell-raised text-shell-accent" : "text-shell-soft hover:bg-white/5"}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <nav
                  className="mt-6 space-y-1 border-t border-white/10 pt-5"
                  aria-label="Разделы главной страницы"
                >
                  {landingLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={(event) => closeAndNavigate(event, link.to)}
                      className={`flex min-h-11 items-center rounded-lg px-4 py-2 text-sm text-shell-muted hover:bg-white/5 hover:text-shell-text ${ui.focus}`}
                    >
                      {link.label}
                    </Link>
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
