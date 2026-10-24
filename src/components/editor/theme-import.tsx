import { useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_THEME_IMPORT_BYTES, parseThemeJSON } from "@/lib/theme-transfer";
import type { SiteTheme } from "@/lib/site-theme";

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
      className="mt-7 rounded-xl border border-white/15 bg-[#171c17] p-5"
    >
      <h2 id={`${id}-title`} className="text-lg font-medium">
        Импорт темы
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#b1bda7]">
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
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <Button
          id={`${id}-choose`}
          type="button"
          variant="outline"
          onClick={() => fileInput.current?.click()}
          aria-describedby={`${id}-filename${fileError ? ` ${id}-file-error` : ""}`}
          className="min-h-11 shrink-0 border-white/20 bg-transparent px-4 text-sm"
        >
          Выбрать JSON
        </Button>
        <span
          id={`${id}-filename`}
          role="status"
          className="min-w-0 text-sm leading-6 text-[#b1bda7] [overflow-wrap:anywhere]"
        >
          {fileName || "Файл не выбран"}
        </span>
      </div>
      {fileError && (
        <p
          id={`${id}-file-error`}
          role="alert"
          className="mt-2 text-sm leading-6 text-[#ffb4b0]"
        >
          {fileError}
        </p>
      )}
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
        className="min-h-40 max-h-80 resize-y field-sizing-fixed font-mono text-sm md:text-sm"
        placeholder={'{ "version": 2, ... }'}
      />
      <p id={`${id}-hint`} className="mt-2 text-sm leading-6 text-[#b1bda7]">
        Поддерживается схема темы v2. CSS и файлы локального хранилища не
        импортируются. Некорректные значения не меняют тему.
      </p>
      {result?.success === false && (
        <div
          id={`${id}-errors`}
          role="alert"
          className="mt-3 text-sm leading-6 text-[#ffb4b0]"
        >
          <ul className="space-y-1">
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
        <p className="mt-3 text-sm leading-6 text-[#c4dab0]">
          Готова к импорту:{" "}
          {result.theme.mode === "dark" ? "тёмный" : "светлый"} режим, обе
          палитры, {result.theme.typography.font},{" "}
          {result.theme.typography.fontSize} px, радиус{" "}
          {result.theme.shape.radius} px. Будут заменены все настройки рабочей
          темы.
        </p>
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
          className="min-h-11 bg-[#d3ed9a] px-4 text-sm text-[#182112] hover:bg-[#e0f6b7]"
        >
          {reading ? "Чтение файла…" : "Применить тему"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-white/20 bg-transparent px-4 text-sm"
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
      {message && (
        <p role="status" className="mt-3 text-sm leading-6 text-[#c4dab0]">
          {message}
        </p>
      )}
    </section>
  );
}
