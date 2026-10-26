import { useThemeFont } from "@/lib/use-theme-font";
import { useId, useRef, useState, type CSSProperties } from "react";
import { Check, Layers3, PanelLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { initialTheme, previewStyle, type SiteTheme } from "@/lib/site-theme";
import { TypographySpecimen } from "@/components/preview/typography-specimen";
import { PreviewGallery } from "@/components/preview/preview-gallery";

export function ThemePreview({
  theme = initialTheme,
  staticView = false,
  narrowView = false,
}: {
  theme?: SiteTheme;
  staticView?: boolean;
  narrowView?: boolean;
}) {
  useThemeFont(theme.typography.font);
  const id = useId();
  const previewScope = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div
      className={`${theme.mode === "dark" ? "dark" : ""} min-w-0 [overflow-wrap:anywhere] bg-background text-foreground text-[length:var(--preview-font-size)] font-[number:var(--preview-font-weight)] leading-[var(--preview-line-height)] tracking-[var(--preview-letter-spacing)] [&_*]:font-[family-name:var(--font-sans)] [&_*]:font-[number:var(--preview-font-weight)] [&_*]:leading-[var(--preview-line-height)] [&_*]:tracking-[var(--preview-letter-spacing)] [&_h3]:font-[number:var(--preview-heading-weight)] [&_h4]:font-[number:var(--preview-heading-weight)] transition-colors duration-200 motion-reduce:transition-none`}
      ref={previewScope}
      data-theme={theme.mode}
      style={
        {
          ...previewStyle(theme),
          "--preview-dialog-max-width": narrowView ? "358px" : "512px",
        } as CSSProperties
      }
    >
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-[var(--preview-component-gap)] border-b px-[var(--preview-component-padding)] py-[var(--preview-control-padding-block)] text-[length:var(--preview-small-size)] text-muted-foreground">
        <span className="flex items-center gap-2">
          <PanelLeft size={16} aria-hidden="true" />
          Пространство<span className="mx-1 opacity-50">/</span>Обзор
        </span>
        <Badge
          variant="outline"
          className="rounded px-2 text-[length:var(--preview-small-size)] text-muted-foreground"
        >
          shadcn/ui
        </Badge>
      </div>
      <div className="@container p-[var(--preview-component-padding)] text-[length:var(--preview-font-size)] font-[number:var(--preview-font-weight)] leading-[var(--preview-line-height)] tracking-[var(--preview-letter-spacing)]">
        <div className="mb-6 flex items-center justify-between gap-[var(--preview-component-gap)]">
          <div>
            <p className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground">
              ВАШ СЛЕДУЮЩИЙ ПРОЕКТ
            </p>
            <h3 className="mt-2 [overflow-wrap:anywhere] text-[length:var(--preview-heading-size)] leading-[var(--preview-line-height)] font-[number:var(--preview-heading-weight)]">
              Хороший день для идей.
            </h3>
            <p className="mt-2 text-[length:var(--preview-font-size)] leading-[var(--preview-line-height)] text-muted-foreground">
              Всё знакомое. Уже в вашем стиле.
            </p>
          </div>
          <Sparkles
            className="shrink-0 text-primary"
            size={24}
            aria-hidden="true"
          />
        </div>
        {!staticView && <TypographySpecimen />}
        {!staticView && (
          <div className="mt-[calc(var(--preview-component-gap)*2)] mb-[var(--preview-component-gap)] border-t pt-[var(--preview-component-padding)]">
            <p className="text-[length:var(--preview-small-size)] text-muted-foreground">
              02 / В контексте
            </p>
            <h3 className="mt-2 text-[length:var(--preview-subheading-size)] font-[number:var(--preview-heading-weight)]">
              Небольшой рабочий интерфейс
            </h3>
            <p className="mt-2 text-[length:var(--preview-small-size)] text-muted-foreground">
              Карточки, поля и действия вместе — чтобы оценить сочетание
              настроек.
            </p>
          </div>
        )}
        <div
          className={`grid gap-[var(--preview-component-gap)] ${staticView ? "xl:grid-cols-2" : "@min-[650px]:grid-cols-2"}`}
        >
          <Card className="justify-between gap-[var(--preview-component-gap)] min-w-0 rounded-[var(--radius)] border p-[var(--preview-component-padding)] text-[length:var(--preview-font-size)] shadow-none ring-0">
            <CardContent className="p-0">
              <div className="mb-[var(--preview-component-gap)] flex items-center justify-between gap-[var(--preview-component-gap)]">
                <span className="grid size-10 place-items-center rounded-[calc(var(--radius)*.7)] border bg-primary/10 text-primary">
                  <Layers3 size={22} />
                </span>
                <span className="text-[length:var(--preview-small-size)] text-muted-foreground">
                  Пример интерфейса
                </span>
              </div>
              <h4 className="text-[length:var(--preview-subheading-size)] leading-[var(--preview-line-height)] font-[number:var(--preview-heading-weight)]">
                Пространство для нового
              </h4>
              <p className="mt-3 text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground">
                Соберите команду, сохраните идеи и дайте проекту свой характер.
              </p>
              <div className="mt-[var(--preview-component-gap)] flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded-[calc(var(--radius)*.5)] text-[length:var(--preview-small-size)]"
                >
                  Дизайн
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-[calc(var(--radius)*.5)] text-[length:var(--preview-small-size)]"
                >
                  В разработке
                </Badge>
              </div>
            </CardContent>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-[var(--preview-component-gap)] border-t pt-[var(--preview-component-gap)]">
              <span className="flex -space-x-2" aria-label="Пример участников">
                {["АЛ", "МК", "+2"].map((text, i) => (
                  <span
                    key={text}
                    className={`grid size-8 place-items-center rounded-full border-2 border-card text-[length:var(--preview-small-size)] ${i === 0 ? "bg-primary text-primary-foreground" : i === 1 ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}
                  >
                    {text}
                  </span>
                ))}
              </span>
              {staticView ? (
                <span className="inline-flex min-h-[var(--preview-control-safe-height)] items-center gap-2 rounded-[calc(var(--radius)*.7)] bg-primary px-[var(--preview-control-padding)] text-[length:var(--preview-small-size)] font-[number:var(--preview-font-weight)] text-primary-foreground">
                  Создать проект
                  <Plus size={15} />
                </span>
              ) : (
                <Button
                  className="min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere] h-auto min-h-[var(--preview-control-safe-height)] rounded-[calc(var(--radius)*.7)] px-[var(--preview-control-padding)] py-[var(--preview-control-padding-block)] text-[length:var(--preview-small-size)]"
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
          <Card className="gap-0 min-w-0 rounded-[var(--radius)] border p-[var(--preview-component-padding)] text-[length:var(--preview-font-size)] shadow-none ring-0">
            <CardContent className="flex h-full flex-col p-0">
              <h4 className="text-[length:var(--preview-subheading-size)] font-[number:var(--preview-heading-weight)]">
                Пригласить в команду
              </h4>
              <p className="mt-2 text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground">
                Лучшие идеи рождаются вместе.
              </p>
              {staticView ? (
                <div className="mt-[var(--preview-component-gap)]">
                  <span className="text-[length:var(--preview-small-size)] text-muted-foreground">
                    Email участника
                  </span>
                  <div className="mt-2 flex min-h-[var(--preview-control-safe-height)] items-center rounded-[calc(var(--radius)*.7)] border bg-background px-[var(--preview-control-padding)] text-[length:var(--preview-font-size)] text-muted-foreground">
                    hello@example.com
                  </div>
                  <span className="my-[var(--preview-component-gap)] min-h-[var(--preview-control-safe-height)] flex items-center gap-2 text-[length:var(--preview-small-size)] text-muted-foreground">
                    <Check size={16} className="text-primary" />
                    Уведомлять об обновлениях
                  </span>
                  <span className="flex min-h-[var(--preview-control-safe-height)] items-center justify-center rounded-[calc(var(--radius)*.7)] border bg-secondary text-[length:var(--preview-small-size)]">
                    Пригласить
                  </span>
                </div>
              ) : (
                <form
                  className="mt-[var(--preview-component-gap)] flex flex-1 flex-col"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <Label
                    htmlFor={`${id}-email`}
                    className="text-[length:var(--preview-small-size)] text-muted-foreground"
                  >
                    Email участника
                  </Label>
                  <Input
                    id={`${id}-email`}
                    className="mt-2 h-auto min-h-[var(--preview-control-safe-height)] rounded-[calc(var(--radius)*.7)] px-[var(--preview-control-padding)] py-[var(--preview-control-padding-block)] text-[length:var(--preview-font-size)] md:text-[length:var(--preview-font-size)]"
                    type="email"
                    placeholder="hello@example.com"
                    required
                    onChange={() => setSubmitted(false)}
                  />
                  <div className="my-[var(--preview-component-gap)] min-h-[var(--preview-control-safe-height)] flex items-center gap-[var(--preview-component-gap)]">
                    <Switch id={`${id}-notify`} defaultChecked />
                    <Label
                      htmlFor={`${id}-notify`}
                      className="text-[length:var(--preview-small-size)] font-[number:var(--preview-font-weight)] text-muted-foreground"
                    >
                      Уведомлять об обновлениях
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="mt-auto min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere] h-auto min-h-[var(--preview-control-safe-height)] rounded-[calc(var(--radius)*.7)] px-[var(--preview-control-padding)] py-[var(--preview-control-padding-block)] text-[length:var(--preview-small-size)]"
                  >
                    {submitted ? "Готово, это пример" : "Пригласить"}
                  </Button>
                  <p
                    className="mt-3 text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground"
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
        {!staticView && (
          <>
            <PreviewGallery portalContainer={previewScope} />
          </>
        )}
        <div className="mt-6 flex items-center gap-2 text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          {staticView
            ? "Пример темы · Lime / Dark"
            : "Все изменения применены к предпросмотру"}
        </div>
      </div>
    </div>
  );
}
