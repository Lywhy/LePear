import { useId, useState, type Dispatch, type SetStateAction } from "react";
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
  const [name, setName] = useState(selected?.name ?? "");
  const [message, setMessage] = useState("");
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
  const buttonClass =
    "h-auto min-h-11 border-white/20 bg-transparent px-3 py-2 text-sm whitespace-normal";
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
          <SelectTrigger
            id={`${id}-select`}
            className="h-auto min-h-11 w-full border-white/20 bg-[#22291e] px-3 text-base text-[#edf1e7] dark:bg-[#22291e] *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:whitespace-normal"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className="dark rounded-lg border border-white/15 bg-[#22291e] p-1 font-sans text-[#edf1e7] shadow-xl ring-0 motion-reduce:animate-none [&_[data-slot=select-scroll-up-button]]:bg-[#22291e] [&_[data-slot=select-scroll-down-button]]:bg-[#22291e]"
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-11 rounded-md pl-3 text-base text-[#edf1e7] data-highlighted:bg-[#343e2a] data-highlighted:text-[#edf1e7] data-selected:text-[#d3ed9a] *:min-w-0 *:shrink *:whitespace-normal *:break-words"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm leading-6 text-[#b1bda7]">
        {selected
          ? dirty
            ? "Есть изменения относительно копии. Рабочий вариант сохраняется автоматически; обновите копию отдельной кнопкой."
            : "Рабочий вариант совпадает с выбранной копией."
          : "Рабочий черновик сохраняется автоматически."}{" "}
        Выбор другой темы заменяет рабочий вариант. Для сохранения нескольких
        вариантов создавайте именованные копии.
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
          className="h-11 w-full text-base"
        />
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-2 text-sm leading-6 text-[#ffb4b0]"
          >
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className={buttonClass}
          disabled={workspace.savedThemes.length >= MAX_SAVED_THEMES}
          onClick={createCopy}
        >
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
          }}
        >
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
          Переименовать
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`${buttonClass} text-[#ffb4b0]`}
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
          Удалить копию
        </Button>
      </div>
      <p className="text-sm leading-6 text-[#b1bda7]">
        Копий: {workspace.savedThemes.length} / {MAX_SAVED_THEMES}. Удаление
        копии сохраняет её текущий рабочий вариант в черновике. Сброс всей темы
        также не удаляет копии. Данные доступны в этом браузере по текущему
        адресу сайта.
      </p>
      {message && (
        <p role="status" className="text-sm leading-6 text-[#c4dab0]">
          {message}
        </p>
      )}
    </div>
  );
}
