import { useId, useState } from "react";
import { Check, Layers3, PanelLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { initialTheme, previewStyle, type SiteTheme } from "@/lib/site-theme";

export function ThemePreview({
  theme = initialTheme,
  staticView = false,
}: {
  theme?: SiteTheme;
  staticView?: boolean;
}) {
  const id = useId();
  const [submitted, setSubmitted] = useState(false);
  return (
    <div
      className={`${theme.mode === "dark" ? "dark" : ""} min-w-0 bg-background text-foreground transition-colors duration-200 motion-reduce:transition-none`}
      style={previewStyle(theme)}
    >
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-5 py-3 text-sm text-muted-foreground sm:px-7">
        <span className="flex items-center gap-2">
          <PanelLeft size={16} aria-hidden="true" />
          Workspace<span className="mx-1 opacity-50">/</span>Overview
        </span>
        <Badge
          variant="outline"
          className="rounded px-2 text-xs text-muted-foreground"
        >
          shadcn/ui
        </Badge>
      </div>
      <div className="p-5 text-[length:var(--preview-font-size)] sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs leading-6 tracking-widest text-muted-foreground">
              ВАШ СЛЕДУЮЩИЙ ПРОЕКТ
            </p>
            <h3 className="mt-2 text-[1.5em] leading-tight font-medium tracking-tight">
              Хороший день для идей.
            </h3>
            <p className="mt-2 text-[.9em] leading-relaxed text-muted-foreground">
              Всё знакомое. Уже в вашем стиле.
            </p>
          </div>
          <Sparkles
            className="shrink-0 text-primary"
            size={24}
            aria-hidden="true"
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="justify-between gap-5 rounded-[var(--radius)] border p-5 text-[1em] shadow-none ring-0">
            <CardContent className="p-0">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-[calc(var(--radius)*.7)] border bg-primary/10 text-primary">
                  <Layers3 size={22} />
                </span>
                <span className="text-xs text-muted-foreground">
                  Пример интерфейса
                </span>
              </div>
              <h4 className="text-[1.05em] leading-snug font-medium">
                Пространство для нового
              </h4>
              <p className="mt-3 text-[.875em] leading-7 text-muted-foreground">
                Соберите команду, сохраните идеи и дайте проекту свой характер.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded-[calc(var(--radius)*.5)] text-xs"
                >
                  Дизайн
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-[calc(var(--radius)*.5)] text-xs"
                >
                  В разработке
                </Badge>
              </div>
            </CardContent>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
              <span className="flex -space-x-2" aria-label="Пример участников">
                {["АЛ", "МК", "+2"].map((text, i) => (
                  <span
                    key={text}
                    className={`grid size-8 place-items-center rounded-full border-2 border-card font-mono text-xs ${i === 0 ? "bg-[#79634f] text-white" : i === 1 ? "bg-[#54634a] text-white" : "bg-secondary text-secondary-foreground"}`}
                  >
                    {text}
                  </span>
                ))}
              </span>
              {staticView ? (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-[calc(var(--radius)*.7)] bg-primary px-3 text-sm font-medium text-primary-foreground">
                  Создать проект
                  <Plus size={15} />
                </span>
              ) : (
                <Button
                  className="h-10 rounded-[calc(var(--radius)*.7)] px-3 text-sm"
                  onClick={() => {
                    setSubmitted(false);
                    document.getElementById(`${id}-email`)?.focus();
                  }}
                >
                  Создать проект
                  <Plus size={15} />
                </Button>
              )}
            </div>
          </Card>
          <Card className="gap-0 rounded-[var(--radius)] border p-5 text-[1em] shadow-none ring-0">
            <CardContent className="flex h-full flex-col p-0">
              <h4 className="text-[1.05em] font-medium">
                Пригласить в команду
              </h4>
              <p className="mt-2 text-[.875em] leading-7 text-muted-foreground">
                Лучшие идеи рождаются вместе.
              </p>
              {staticView ? (
                <div className="mt-5">
                  <span className="text-sm text-muted-foreground">
                    Email участника
                  </span>
                  <div className="mt-2 flex min-h-11 items-center rounded-[calc(var(--radius)*.7)] border bg-background px-3 text-sm text-muted-foreground">
                    hello@example.com
                  </div>
                  <span className="my-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary" />
                    Уведомлять об обновлениях
                  </span>
                  <span className="flex min-h-11 items-center justify-center rounded-[calc(var(--radius)*.7)] border bg-secondary text-sm">
                    Пригласить
                  </span>
                </div>
              ) : (
                <form
                  className="mt-5 flex flex-1 flex-col"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <Label
                    htmlFor={`${id}-email`}
                    className="text-sm text-muted-foreground"
                  >
                    Email участника
                  </Label>
                  <Input
                    id={`${id}-email`}
                    className="mt-2 h-11 rounded-[calc(var(--radius)*.7)] px-3 text-base md:text-base"
                    type="email"
                    placeholder="hello@example.com"
                    required
                    onChange={() => setSubmitted(false)}
                  />
                  <div className="my-4 flex items-center gap-3">
                    <Switch id={`${id}-notify`} defaultChecked />
                    <Label
                      htmlFor={`${id}-notify`}
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Уведомлять об обновлениях
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="mt-auto min-h-11 rounded-[calc(var(--radius)*.7)] text-sm"
                  >
                    {submitted ? "Готово, это пример" : "Пригласить"}
                  </Button>
                  <p
                    className="mt-3 text-xs leading-5 text-muted-foreground"
                    role="status"
                  >
                    {submitted
                      ? "Приглашение не отправляется."
                      : "Пример интерфейса · без отправки данных"}
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          {staticView
            ? "Пример темы · Lime / Dark"
            : "Все изменения применены к предпросмотру"}
        </div>
      </div>
    </div>
  );
}
