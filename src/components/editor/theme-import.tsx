import { TextReveal } from "@/components/motion/text-reveal";
import { controlClasses as controls } from "@/components/editor/control-classes";
import { TransferStatus } from "@/components/editor/transfer-status";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteTheme } from "@/lib/site-theme";
import { MAX_THEME_IMPORT_BYTES, parseThemeJSON } from "@/lib/theme-transfer";
import { useId, useMemo, useRef, useState } from "react";

export function ThemeImport({
  onImport,
}: {
  onImport: (theme: SiteTheme) => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const request = useRef(0);
  const result = useMemo(
    () => (text.trim() ? parseThemeJSON(text) : null),
    [text],
  );
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="mt-6 min-w-0 rounded-xl border border-shell-divider/15 bg-shell-surface p-4 sm:p-5"
    >
      <TextReveal className="mb-2 inline-flex items-center gap-2 text-sm leading-6 text-shell-muted">
        Из JSON в редактор
      </TextReveal>
      <TextReveal as="h3" id={`${id}-title`} className="text-lg font-medium">
        Импорт темы
      </TextReveal>
      <p className="mt-2 text-sm leading-6 text-shell-muted">
        Выберите JSON LePear или вставьте его содержимое. Сначала проверьте
        параметры ниже, затем примените тему к рабочему черновику. Именованные
        копии сохраняются.
      </p>
      <Label htmlFor={`${id}-choose`} className="mt-4 mb-2 text-sm">
        Файл JSON (до 1 МБ)
      </Label>
      <input
        id={`${id}-file`}
        ref={fileInput}
        type="file"
        hidden
        accept=".json,application/json"
        aria-describedby={fileError ? `${id}-file-error` : undefined}
        aria-invalid={!!fileError}
        onChange={async (event) => {
          const token = ++request.current;
          const file = event.target.files?.[0];
          event.target.value = "";
          setReading(false);
          setFileError("");
          if (!file) return;
          setFileName(file.name);
          setMessage("");
          setText("");
          if (file.size > MAX_THEME_IMPORT_BYTES) {
            setFileError("Файл слишком большой. Максимум — 1 МБ.");
            return;
          }
          setReading(true);
          try {
            const content = await file.text();
            if (request.current === token) {
              setText(content);
              if (!content.trim())
                setFileError("Файл пуст. Выберите JSON с темой.");
            }
          } catch {
            if (request.current === token)
              setFileError(
                "Не удалось прочитать файл. Вставьте JSON в поле ниже.",
              );
          } finally {
            if (request.current === token) setReading(false);
          }
        }}
      />
      <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-dashed border-shell-divider/25 bg-shell-deep p-4">
        <Button
          id={`${id}-choose`}
          type="button"
          variant="outline"
          onClick={() => fileInput.current?.click()}
          aria-invalid={!!fileError}
          aria-busy={reading}
          aria-describedby={`${id}-filename${fileError ? ` ${id}-file-error` : ""}`}
          className={controls.action}
        >
          Выбрать JSON
        </Button>
        <span
          id={`${id}-filename`}
          role="status"
          className="min-w-0 text-sm leading-6 text-shell-muted wrap-anywhere"
        >
          {fileName || "Файл не выбран"}
        </span>
      </div>
      <div id={id + "-file-error"} className="mt-3">
        {fileError && <TransferStatus tone="error" message={fileError} />}
        {reading && (
          <TransferStatus
            tone="loading"
            message="Читаем JSON. Текущая тема пока не меняется."
          />
        )}
      </div>
      <Label htmlFor={`${id}-text`} className="mt-4 mb-2 text-sm">
        Содержимое JSON
      </Label>
      <Textarea
        id={`${id}-text`}
        value={text}
        spellCheck={false}
        aria-invalid={result?.success === false}
        aria-describedby={
          result?.success === false ? `${id}-errors` : `${id}-hint`
        }
        onChange={(event) => {
          ++request.current;
          setReading(false);
          setFileError("");
          setMessage("");
          setFileName("");
          setText(event.target.value);
        }}
        className={
          controls.input +
          " h-48 max-h-80 max-w-full resize-y field-sizing-fixed font-mono text-sm leading-6 md:text-sm"
        }
        placeholder={'{ "version": 2, ... }'}
      />
      <p id={`${id}-hint`} className="mt-2 text-sm leading-6 text-shell-muted">
        Поддерживается схема темы v2. CSS и файлы локального хранилища не
        импортируются. Некорректные значения не меняют тему.
      </p>
      {result?.success === false && (
        <div
          id={`${id}-errors`}
          role="alert"
          className="mt-3 min-w-0 rounded-xl border border-shell-danger/25 bg-shell-danger/5 p-4 text-sm leading-6 text-shell-danger wrap-anywhere"
        >
          <p className="mb-2 font-medium">
            JSON не применён. Исправьте ошибки:
          </p>
          <ul className="space-y-2">
            {result.errors.slice(0, 6).map((error) => (
              <li key={error.path}>
                {error.path}: {error.message}
              </li>
            ))}
          </ul>
          {result.errors.length > 6 && (
            <p>Ещё ошибок: {result.errors.length - 6}.</p>
          )}
        </div>
      )}
      {result?.success && (
        <div className="mt-4 rounded-xl border border-shell-accent/25 bg-shell-deep p-4">
          <p
            role="status"
            className="text-base leading-7 font-medium text-shell-accent"
          >
            Тема готова к применению
          </p>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm leading-6 min-[440px]:grid-cols-2">
            {[
              ["Режим", result.theme.mode === "dark" ? "Тёмный" : "Светлый"],
              ["Палитры", "Светлая и тёмная"],
              ["Шрифт", result.theme.typography.font],
              ["Размер текста", result.theme.typography.fontSize + " px"],
              ["Закругление", result.theme.shape.radius + " px"],
              ["Формат", "LePear · schema v2"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-shell-muted">{label}</dt>
                <dd className="mt-0.5 text-shell-text wrap-anywhere">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-shell-divider/10 pt-3 text-sm leading-6 text-shell-muted">
            Будут заменены все настройки рабочего варианта. Именованные копии
            останутся в библиотеке.
          </p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={reading || !result?.success}
          onClick={() => {
            if (!result?.success) return;
            onImport(result.theme);
            setMessage(
              "Тема импортирована в рабочий черновик. При необходимости создайте именованную копию.",
            );
          }}
          className={
            controls.action +
            " border-shell-accent/40 bg-shell-accent text-shell-accent-ink hover:bg-shell-accent-hover hover:text-shell-accent-ink dark:border-shell-accent/40 dark:bg-shell-accent dark:hover:bg-shell-accent-hover"
          }
        >
          {reading ? "Чтение файла…" : "Применить тему"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={controls.action}
          onClick={() => {
            ++request.current;
            setReading(false);
            setText("");
            setFileName("");
            setFileError("");
            setMessage("");
          }}
        >
          Очистить ввод
        </Button>
      </div>
      <div className="mt-4 min-h-14">
        {message && <TransferStatus tone="success" message={message} />}
      </div>
    </section>
  );
}
