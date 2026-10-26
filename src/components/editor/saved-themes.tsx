import { useThemeFont } from "@/lib/use-theme-font";
import { useId, useState, type Dispatch, type SetStateAction } from "react";
import { Check, Copy, Pencil, Save, Trash2 } from "lucide-react";
import { controlClasses as controls } from "@/components/editor/control-classes";
import { SelectionFeedback } from "@/components/editor/selection-feedback";
import { fontFamilies } from "@/lib/site-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cloneTheme,
  MAX_SAVED_THEMES,
  type ThemeWorkspace,
} from "@/lib/use-theme-workspace";

type SavedThemesProps = {
  workspace: ThemeWorkspace;
  onChange: Dispatch<SetStateAction<ThemeWorkspace>>;
  onSelect: () => void;
};
export function SavedThemes(props: SavedThemesProps) {
  const selected = props.workspace.savedThemes.find(
    (item) => item.id === props.workspace.selectedId,
  );
  return (
    <SavedThemesForm
      key={`${selected?.id ?? "draft"}:${selected?.name ?? ""}`}
      {...props}
    />
  );
}
function SavedThemesForm({ workspace, onChange, onSelect }: SavedThemesProps) {
  const id = useId();
  const selected = workspace.savedThemes.find(
    (item) => item.id === workspace.selectedId,
  );
  useThemeFont(selected?.theme.typography.font);
  const [name, setName] = useState(selected?.name ?? "");
  const [message, setMessage] = useState("");
  const [feedbackRevision, setFeedbackRevision] = useState(0);
  const [error, setError] = useState("");
  const dirty =
    selected &&
    JSON.stringify(selected.theme) !== JSON.stringify(workspace.theme);
  const options = [
    { value: "draft", label: "Рабочий черновик" },
    ...workspace.savedThemes.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  ];
  const buttonClass = controls.action;
  function validName(excludeId?: string) {
    const result = name.trim();
    if (!result || result.length > 60) {
      setError("Введите название от 1 до 60 символов.");
      return null;
    }
    if (
      workspace.savedThemes.some(
        (item) =>
          item.id !== excludeId &&
          item.name.toLocaleLowerCase() === result.toLocaleLowerCase(),
      )
    ) {
      setError("Тема с таким названием уже есть. Выберите другое название.");
      return null;
    }
    setError("");
    return result;
  }
  function createCopy() {
    if (workspace.savedThemes.length >= MAX_SAVED_THEMES) {
      setError(
        `Можно сохранить до ${MAX_SAVED_THEMES} тем. Удалите ненужную копию.`,
      );
      return;
    }
    const title = validName();
    if (!title) return;
    const themeId = `theme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    onChange((current) => ({
      ...current,
      selectedId: themeId,
      savedThemes: [
        ...current.savedThemes,
        { id: themeId, name: title, theme: cloneTheme(current.theme) },
      ],
    }));
    onSelect();
  }
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${id}-select`} className="mb-2 text-sm">
          Сохранённая тема
        </Label>
        <Select
          items={options}
          value={workspace.selectedId ?? "draft"}
          onValueChange={(value) => {
            if (typeof value !== "string") return;
            onChange((current) => {
              if (value === "draft") return { ...current, selectedId: null };
              const saved = current.savedThemes.find(
                (item) => item.id === value,
              );
              return saved
                ? {
                    ...current,
                    selectedId: saved.id,
                    theme: cloneTheme(saved.theme),
                  }
                : current;
            });
            onSelect();
          }}
        >
          <SelectTrigger id={`${id}-select`} className={controls.trigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className={controls.popup}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={controls.option}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border border-shell-divider/15 bg-shell-deep p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm leading-6 text-shell-muted">
              {selected ? "Выбранная копия" : "Рабочий вариант"}
            </p>
            <p className="mt-1 text-base leading-7 font-medium wrap-anywhere">
              {selected?.name ?? "Без названия"}
            </p>
          </div>
          {selected && (
            <SelectionFeedback className="mt-1 inline-flex shrink-0 rounded-full bg-shell-accent/10 p-1.5 text-shell-accent">
              <Check size={16} aria-hidden="true" />
            </SelectionFeedback>
          )}
        </div>
        {selected && (
          <div
            className="mt-3 grid grid-cols-2 gap-2"
            aria-label="Палитры сохранённой копии"
          >
            {(["light", "dark"] as const).map((mode) => (
              <div
                key={mode}
                className="min-w-0 rounded-lg border border-shell-divider/10 p-2"
              >
                <p className="text-sm leading-6 text-shell-muted">
                  {mode === "light" ? "Светлая" : "Тёмная"}
                </p>
                <div
                  className="mt-1 flex overflow-hidden rounded-md border border-shell-divider/15"
                  aria-hidden="true"
                >
                  {(["background", "card", "primary"] as const).map((token) => (
                    <span
                      key={token}
                      className="h-6 flex-1"
                      style={{
                        backgroundColor: selected.theme.palettes[mode][token],
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <p
            className="mt-2 text-base leading-7 wrap-anywhere"
            style={{ fontFamily: fontFamilies[selected.theme.typography.font] }}
          >
            {selected.theme.typography.font} · Аа / Aa
          </p>
        )}
        <p
          className={
            "mt-3 min-h-24 rounded-lg border px-3 py-2 text-sm leading-6 " +
            (dirty
              ? "border-shell-warning/25 bg-shell-warning/5 text-shell-warning"
              : "border-shell-accent/20 bg-shell-accent/5 text-shell-accent")
          }
        >
          {selected
            ? dirty
              ? "Есть изменения. Копия ещё не обновлена."
              : "Рабочая тема совпадает с копией."
            : "Черновик сохраняется автоматически в этом браузере."}
        </p>
      </div>
      <p className="text-sm leading-6 text-shell-muted">
        {selected &&
          "Изменения автоматически сохраняются в рабочем варианте. Нажмите «Обновить копию», чтобы записать их в выбранную тему. "}
        Выбор другой копии заменяет рабочий вариант. Чтобы сохранить несколько
        вариантов, создайте именованные копии.
      </p>
      <div>
        <Label htmlFor={`${id}-name`} className="mb-2 text-sm">
          Название темы
        </Label>
        <Input
          id={`${id}-name`}
          value={name}
          maxLength={60}
          autoComplete="off"
          placeholder="Например, Океан для портфолио"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className={controls.input + " w-full"}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className={
            buttonClass +
            " border-shell-accent/40 bg-shell-accent text-shell-accent-ink hover:bg-shell-accent-hover hover:text-shell-accent-ink dark:border-shell-accent/40 dark:bg-shell-accent dark:hover:bg-shell-accent-hover"
          }
          disabled={workspace.savedThemes.length >= MAX_SAVED_THEMES}
          onClick={createCopy}
        >
          <Copy size={16} aria-hidden="true" className="shrink-0" />
          Создать копию
        </Button>
        <Button
          type="button"
          variant="outline"
          className={buttonClass}
          disabled={!selected || !dirty}
          onClick={() => {
            onChange((current) => ({
              ...current,
              savedThemes: current.savedThemes.map((item) =>
                item.id === current.selectedId
                  ? { ...item, theme: cloneTheme(current.theme) }
                  : item,
              ),
            }));
            setMessage("Выбранная копия обновлена.");
            setFeedbackRevision((revision) => revision + 1);
          }}
        >
          <Save size={16} aria-hidden="true" className="shrink-0" />
          Обновить копию
        </Button>
        <Button
          type="button"
          variant="outline"
          className={buttonClass}
          disabled={!selected}
          onClick={() => {
            const title = validName(selected?.id);
            if (!title) return;
            onChange((current) => ({
              ...current,
              savedThemes: current.savedThemes.map((item) =>
                item.id === current.selectedId
                  ? { ...item, name: title }
                  : item,
              ),
            }));
          }}
        >
          <Pencil size={16} aria-hidden="true" className="shrink-0" />
          Переименовать
        </Button>
        <Button
          type="button"
          variant="outline"
          className={
            buttonClass +
            " border-shell-danger/25 text-shell-danger hover:border-shell-danger/50 hover:bg-shell-danger/10 hover:text-shell-danger dark:border-shell-danger/25 dark:hover:bg-shell-danger/10"
          }
          disabled={!selected}
          onClick={() => {
            onChange((current) => ({
              ...current,
              selectedId: null,
              savedThemes: current.savedThemes.filter(
                (item) => item.id !== current.selectedId,
              ),
            }));
            onSelect();
          }}
        >
          <Trash2 size={16} aria-hidden="true" className="shrink-0" />
          Удалить копию
        </Button>
      </div>
      <p className="text-sm leading-6 text-shell-muted">
        Копий: {workspace.savedThemes.length} / {MAX_SAVED_THEMES}. Удаление
        копии сохраняет её текущий рабочий вариант в черновике. Сброс всей темы
        также не удаляет копии. Данные доступны в этом браузере по текущему
        адресу сайта.
      </p>
      <div className="min-h-18 text-sm leading-6">
        <p id={id + "-error"} role="alert" className="text-shell-danger">
          {error}
        </p>
        <p role="status" className="text-shell-success">
          {message && !dirty && (
            <SelectionFeedback
              key={feedbackRevision}
              className="inline-flex items-start gap-2"
            >
              <Check size={16} aria-hidden="true" className="mt-1 shrink-0" />
              {message}
            </SelectionFeedback>
          )}
        </p>
      </div>
    </div>
  );
}
