import { ToolPageHeader } from "@/components/layout/tool-page-header";
import { useId } from "react";
import { Check } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
} from "@/components/ui/radio-group";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

import { designClasses as ui } from "@/lib/design-system";
import {
  shellSeasons,
  findShellSeason,
  paletteForSeason,
} from "@/lib/shell-seasons";
import {
  selectShellMode,
  selectShellSeason,
  useShellSettings,
} from "@/lib/shell-settings";
export default function SettingsPage() {
  const id = useId();
  const { season, mode, saved } = useShellSettings();
  const current = findShellSeason(season);
  const availableSeasons = shellSeasons.filter((item) => item.palette);
  const hasUpcoming = availableSeasons.length < shellSeasons.length;
  return (
    <main className={ui.container + " py-8 sm:py-12 lg:py-16"}>
      <ToolPageHeader
        eyebrow="LEPEAR / НАСТРОЙКИ"
        title="Настройки."
        accent="По-вашему."
        description="Настройте внешний вид LePear. Выбор сохраняется в этом браузере и остаётся с вами на всех страницах."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.7fr)]">
        <ScrollReveal
          as="section"
          aria-labelledby={id + "-appearance"}
          className={ui.surface + " sm:p-8"}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={ui.eyebrow}>01 / ОФОРМЛЕНИЕ</p>
              <h2 id={id + "-appearance"} className={"mt-2 " + ui.cardTitle}>
                Сезонная тема
              </h2>
            </div>
          </div>
          <p id={id + "-description"} className={ui.body + " mt-3 max-w-2xl"}>
            Палитра для всего приложения: фон, текст, кнопки и декоративные
            эффекты. Доступны:{" "}
            {availableSeasons.map((item) => item.name).join(", ")}.
            {hasUpcoming &&
              " Остальные сезоны появятся в следующих обновлениях."}
          </p>
          <fieldset className="mt-6">
            <legend className="mb-3 text-base font-medium text-shell-text">
              Режим оформления
            </legend>
            <RadioGroup
              value={mode}
              onValueChange={selectShellMode}
              aria-label="Светлая или тёмная тема LePear"
              className="grid-cols-2 gap-1 rounded-full border border-shell-divider/10 bg-shell-deep p-1"
            >
              {[
                { value: "light", label: "Светлая" },
                { value: "dark", label: "Тёмная" },
              ].map((item) => (
                <RadioGroupItem
                  key={item.value}
                  value={item.value}
                  className="rounded-full border-0 px-4 py-3 data-checked:bg-shell-accent data-checked:text-shell-accent-ink"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{item.label}</span>
                    <RadioGroupIndicator>
                      <Check size={16} aria-hidden="true" />
                    </RadioGroupIndicator>
                  </span>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </fieldset>
          <RadioGroup
            value={season}
            onValueChange={selectShellSeason}
            aria-labelledby={id + "-appearance"}
            aria-describedby={id + "-description"}
            className="mt-6 sm:grid-cols-2"
          >
            {shellSeasons.map((item) => {
              const available = item.palette !== null;
              const selected = season === item.id;
              const colors = paletteForSeason(item.id, mode);
              const preview = [
                colors.background,
                colors.accent,
                colors.teal,
                colors.sand,
              ];
              return (
                <RadioGroupItem
                  key={item.id}
                  value={item.id}
                  disabled={!available}
                  aria-labelledby={id + "-" + item.id + "-name"}
                  aria-describedby={id + "-" + item.id + "-description"}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      id={id + "-" + item.id + "-name"}
                      className="flex items-center gap-2 text-lg font-medium text-shell-text"
                    >
                      {item.name}
                    </span>
                    <span
                      className={
                        "rounded-full border px-2.5 py-1 text-sm leading-6 " +
                        (selected
                          ? "border-shell-accent/30 text-shell-accent"
                          : "border-shell-divider/15 text-shell-muted")
                      }
                    >
                      {available
                        ? selected
                          ? "Выбрана"
                          : "Доступна"
                        : "Скоро"}
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className={
                      "mt-5 grid grid-cols-4 gap-2 " +
                      (available ? "" : "opacity-60")
                    }
                  >
                    {preview.map((color, index) => (
                      <span
                        key={index}
                        className="h-12 rounded-md border border-shell-divider/15"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p
                    id={id + "-" + item.id + "-description"}
                    className={ui.caption + " mt-4"}
                  >
                    {item.description}
                    {!available && " Пока недоступна."}
                  </p>
                  <div className="mt-4 flex min-h-6 items-center gap-2 text-sm text-shell-accent">
                    <RadioGroupIndicator className="inline-flex items-center gap-2">
                      <Check aria-hidden="true" className="size-4" />
                      <span>Текущая тема</span>
                    </RadioGroupIndicator>
                  </div>
                </RadioGroupItem>
              );
            })}
          </RadioGroup>
          <p
            role="status"
            className={
              "mt-5 text-sm leading-7 " +
              (saved ? "text-shell-muted" : "text-shell-warning")
            }
          >
            {saved
              ? "Выбрана тема «" +
                current?.name +
                "», " +
                (mode === "light" ? "светлый" : "тёмный") +
                " режим. Сохранено в этом браузере."
              : "Тема применяется, но браузер не разрешил сохранить настройки. После перезагрузки вернутся настройки по умолчанию."}
          </p>
        </ScrollReveal>
        <ScrollReveal
          as="aside"
          delay={0.12}
          className={ui.surface + " space-y-6 sm:p-7"}
          aria-label="Как работают настройки оформления"
        >
          <div>
            <h2 className={ui.cardTitle + " mt-4"}>Ваш LePear</h2>
            <p className={ui.body + " mt-3"}>
              Оформление едино для главной, редактора, YouTube, конвертера и
              настроек.
            </p>
          </div>
          <div className={ui.inset}>
            <h3 className="text-base font-medium">
              Тема вашего сайта — отдельно
            </h3>
            <p className={ui.caption + " mt-2"}>
              Цвета и шрифты, которые вы создаёте в редакторе, не меняются.
              Сохранённые темы, CSS и JSON остаются вашими.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <p className={ui.caption}>
              Выбор хранится на этом устройстве без аккаунта. Очистка данных
              сайта удалит и настройки оформления.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
