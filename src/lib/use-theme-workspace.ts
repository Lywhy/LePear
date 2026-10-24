import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  createInitialTheme,
  validateTheme,
  type SiteTheme,
} from "@/lib/site-theme";

export const WORKSPACE_STORAGE_KEY = "lepear.workspace";
export const MAX_SAVED_THEMES = 20;
export const settingsSections = [
  "library",
  "mode",
  "colors",
  "typography",
  "layout",
] as const;
export type SavedTheme = { id: string; name: string; theme: SiteTheme };
export type ThemeWorkspace = {
  version: 1;
  theme: SiteTheme;
  savedThemes: SavedTheme[];
  selectedId: string | null;
  editor: {
    view: "components" | "css";
    previewWidth: "wide" | "narrow";
    openSettings: string[];
  };
};
function freshWorkspace(): ThemeWorkspace {
  return {
    version: 1,
    theme: createInitialTheme(),
    savedThemes: [],
    selectedId: null,
    editor: {
      view: "components",
      previewWidth: "wide",
      openSettings: ["library", "mode"],
    },
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function cloneTheme(theme: SiteTheme): SiteTheme {
  return JSON.parse(JSON.stringify(theme)) as SiteTheme;
}
/** Stored input is unknown: validate every theme, reference and UI setting. */
function readWorkspace() {
  const fallback = freshWorkspace();
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw === null)
      return { workspace: fallback, blocked: false, notice: "" };
    if (raw.length > 1_000_000) throw new Error("oversize");
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1) throw new Error("version");
    const current = validateTheme(value.theme);
    if (
      !current.success ||
      !Array.isArray(value.savedThemes) ||
      value.savedThemes.length > MAX_SAVED_THEMES
    )
      throw new Error("themes");
    const ids = new Set<string>();
    const names = new Set<string>();
    const savedThemes: SavedTheme[] = value.savedThemes.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== "string" ||
        !/^theme-[a-z0-9-]{1,100}$/i.test(item.id) ||
        ids.has(item.id) ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        item.name.trim().length > 60 ||
        names.has(item.name.trim().toLocaleLowerCase())
      )
        throw new Error("saved theme");
      const theme = validateTheme(item.theme);
      if (!theme.success) throw new Error("saved theme version");
      ids.add(item.id);
      names.add(item.name.trim().toLocaleLowerCase());
      return { id: item.id, name: item.name.trim(), theme: theme.theme };
    });
    if (
      value.selectedId !== null &&
      (typeof value.selectedId !== "string" || !ids.has(value.selectedId))
    )
      throw new Error("selection");
    const editor = value.editor;
    if (
      !isRecord(editor) ||
      (editor.view !== "components" && editor.view !== "css") ||
      (editor.previewWidth !== "wide" && editor.previewWidth !== "narrow") ||
      !Array.isArray(editor.openSettings) ||
      !editor.openSettings.every(
        (key: unknown) =>
          typeof key === "string" &&
          (settingsSections as readonly string[]).includes(key),
      )
    )
      throw new Error("editor");
    const workspace: ThemeWorkspace = {
      version: 1,
      theme: current.theme,
      savedThemes,
      selectedId: value.selectedId as string | null,
      editor: {
        view: editor.view,
        previewWidth: editor.previewWidth,
        openSettings: [...new Set(editor.openSettings as string[])],
      },
    };
    return {
      workspace,
      blocked: false,
      notice: "Рабочее состояние восстановлено.",
    };
  } catch (error) {
    // Access failures are retriable; malformed data is preserved until explicit replacement.
    const inaccessible =
      error instanceof DOMException &&
      (error.name === "SecurityError" || error.name === "QuotaExceededError");
    return {
      workspace: fallback,
      blocked: !inaccessible,
      notice: inaccessible
        ? "Хранилище недоступно. Можно продолжить работу и скачать тему."
        : "Сохранённые данные повреждены или имеют неподдерживаемую версию. Открыта исходная тема; старые данные не перезаписываются.",
    };
  }
}

export function useThemeWorkspace() {
  const [initial] = useState(readWorkspace);
  const [workspace, setWorkspaceState] = useState(initial.workspace);
  const currentWorkspace = useRef(initial.workspace);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [storageMessage, setStorageMessage] = useState(
    initial.notice ||
      "Автосохранение включено. Изменения сохранятся в этом браузере.",
  );
  const [storageOk, setStorageOk] = useState(
    !initial.blocked &&
      (initial.notice === "" ||
        initial.notice === "Рабочее состояние восстановлено."),
  );

  const persist = useCallback(
    (next: ThemeWorkspace, replaceInvalid = false) => {
      if (blocked && !replaceInvalid) return;
      try {
        window.localStorage.setItem(
          WORKSPACE_STORAGE_KEY,
          JSON.stringify(next),
        );
        setStorageOk(true);
        setStorageMessage("Сохранено в этом браузере.");
      } catch {
        setStorageOk(false);
        setStorageMessage(
          "Не удалось сохранить изменения в браузере. Работа продолжается в памяти; скачайте JSON, чтобы сохранить копию.",
        );
      }
    },
    [blocked],
  );

  // Persist at the update boundary, outside a React updater/effect. The ref lets
  // consecutive event updates use the latest workspace before React commits.
  const setWorkspace: Dispatch<SetStateAction<ThemeWorkspace>> = useCallback(
    (next) => {
      const updated =
        typeof next === "function" ? next(currentWorkspace.current) : next;
      currentWorkspace.current = updated;
      setWorkspaceState(updated);
      persist(updated);
    },
    [persist],
  );

  return {
    workspace,
    setWorkspace,
    storageMessage,
    storageOk,
    blocked,
    retrySaving: () => {
      setBlocked(false);
      persist(currentWorkspace.current, true);
    },
  };
}
