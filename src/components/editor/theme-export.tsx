import { MotionIcon } from "@/components/motion/motion-icon";
import { fontInfo, type ThemeFont } from "@/lib/font-catalog";
import { TextReveal } from "@/components/motion/text-reveal";
import { controlClasses as controls } from "@/components/editor/control-classes";
import { TransferStatus } from "@/components/editor/transfer-status";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Copy, Download, FileJson, Check } from "lucide-react";

export function ThemeExport({
  themeFont,
  onCopy,
  onDownload,
  copied,
  manualCopy,
  status,
  statusTone,
}: {
  themeFont: ThemeFont;
  onCopy: (format: "css" | "json") => void;
  onDownload: (format: "css" | "json") => void;
  copied: boolean;
  manualCopy: string | null;
  status: string;
  statusTone: "info" | "success" | "warning" | "error";
}) {
  const font = fontInfo(themeFont);
  return (
    <div className="mt-5 min-w-0 space-y-4">
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        {(
          [
            {
              format: "css",
              title: "Для вашего сайта",
              name: "CSS",
              description:
                "Обе палитры, типографика и размеры для проекта на Tailwind v4.",
              Icon: Code2,
            },
            {
              format: "json",
              title: "Резервная копия",
              name: "JSON",
              description:
                "Все настройки темы. Можно импортировать обратно в LePear.",
              Icon: FileJson,
            },
          ] as const
        ).map(({ format, title, name, description, Icon }) => (
          <div
            key={format}
            className="flex min-w-0 flex-col rounded-xl border border-shell-divider/15 bg-shell-surface p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-lg border border-shell-divider/10 bg-shell-raised text-shell-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="rounded-md border border-shell-divider/15 px-2 py-1 font-mono text-sm text-shell-muted">
                {name}
              </span>
            </div>
            <TextReveal as="h3" className="text-base leading-7 font-medium">
              {title}
            </TextReveal>
            <p className="mt-2 mb-4 text-sm leading-6 text-shell-muted">
              {description}
            </p>
            <div className="mt-auto grid grid-cols-1 gap-2 min-[440px]:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className={controls.action}
                onClick={() => onDownload(format)}
              >
                <MotionIcon icon={Download} effect="download" size={16} />
                Скачать {name}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={controls.action}
                onClick={() => onCopy(format)}
              >
                <MotionIcon
                  icon={format === "css" && copied ? Check : Copy}
                  state={format === "css" && copied ? "success" : "idle"}
                  effect="press"
                  size={16}
                />
                {format === "css" && copied
                  ? "Скопировано"
                  : "Копировать " + name}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <TransferStatus
        tone={status ? statusTone : "info"}
        message={
          status ||
          "Экспортируется текущий рабочий вариант, включая обе палитры. Именованные копии в файл не входят."
        }
      />
      {manualCopy !== null && (
        <div className="min-w-0 rounded-xl border border-shell-warning/25 bg-shell-deep p-4">
          <Label htmlFor="theme-manual-copy" className="text-base leading-7">
            Ручное копирование
          </Label>
          <p
            id="theme-manual-copy-hint"
            className="mt-2 mb-3 text-sm leading-6 text-shell-muted"
          >
            Текст последней попытки копирования. Выберите поле — он выделится
            целиком. Нажмите Ctrl+C / Cmd+C. Кнопки скачивания выше также
            доступны.
          </p>
          <Textarea
            id="theme-manual-copy"
            aria-describedby="theme-manual-copy-hint"
            readOnly
            value={manualCopy}
            onFocus={(event) => event.currentTarget.select()}
            className={
              controls.input +
              " h-56 max-w-full resize-y field-sizing-fixed font-mono text-sm leading-6 md:text-sm"
            }
          />
        </div>
      )}
      <details
        id="theme-integration"
        className="rounded-xl border border-shell-divider/15 bg-shell-surface p-4"
      >
        <summary className="cursor-pointer rounded-md text-base leading-7 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-shell-accent">
          Как подключить CSS к проекту
        </summary>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-shell-muted marker:text-shell-accent">
          <li>
            Импортируйте скачанный CSS после Tailwind/shadcn в проекте на{" "}
            <span className="text-shell-text">Tailwind v4</span> и пересоберите
            проект. Файл содержит обе палитры и стили компонентов.
          </li>
          <li>
            Добавьте контейнеру{" "}
            <code className="text-shell-text">lepear-theme</code> и{" "}
            <code className="text-shell-text">data-theme="light"</code> или{" "}
            <code className="text-shell-text">data-theme="dark"</code>. Для
            тёмного режима также добавьте класс{" "}
            <code className="text-shell-text">dark</code>.
          </li>
          <li>
            Размещайте порталы меню и диалогов внутри контейнера темы, чтобы они
            наследовали настройки.
          </li>
          <li>
            {font.packageName ? (
              <>
                Для {font.label} установите{" "}
                <code className="text-shell-text wrap-anywhere">
                  {font.packageName}
                </code>{" "}
                и импортируйте его wght.css перед CSS темы. Шрифты в экспорт не
                встроены.
              </>
            ) : (
              <>
                Для {font.label} используется установленный шрифт устройства и
                запасная цепочка; файлы гарнитуры в экспорт не входят.
              </>
            )}
          </li>
        </ol>
        <p className="mt-4 border-t border-shell-divider/10 pt-3 text-sm leading-7 text-shell-muted">
          Пример в репозитории:{" "}
          <code className="text-shell-text wrap-anywhere">
            examples/theme-integration
          </code>
          . JSON служит для переноса настроек LePear и не подключается как CSS.
        </p>
      </details>
    </div>
  );
}
