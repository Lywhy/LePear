import { useSyncExternalStore } from "react";
import { installShellPalette } from "@/lib/shell-palette";
import {
  findShellSeason,
  paletteForSeason,
  resolveShellSeason,
  type ShellSeasonId,
  type ShellMode,
} from "@/lib/shell-seasons";
const storageKey = "lepear.shell-settings.v1";
interface ShellSettings {
  season: ShellSeasonId;
  mode: ShellMode;
  saved: boolean;
}
const initial: ShellSettings = { season: "autumn", mode: "dark", saved: true };
let snapshot = initial;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function getSnapshot() {
  return snapshot;
}
function persist(season: ShellSeasonId, mode: ShellMode) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ version: 1, season, mode }),
    );
    return true;
  } catch {
    return false;
  }
}
function apply(season: ShellSeasonId, mode: ShellMode) {
  installShellPalette(paletteForSeason(season, mode), season, mode);
  snapshot = { season, mode, saved: persist(season, mode) };
}
export function initializeShellSettings() {
  let season: ShellSeasonId = "autumn",
    mode: ShellMode = "dark";
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (value?.version === 1) {
      season = resolveShellSeason(value.season);
      mode = value.mode === "light" ? "light" : "dark";
    }
  } catch {
    /* Existing settings without mode keep the accepted dark appearance. */
  }
  apply(season, mode);
}
export function selectShellSeason(value: string) {
  const season = findShellSeason(value);
  if (!season?.palette) return;
  apply(season.id, snapshot.mode);
  for (const listener of listeners) listener();
}
export function selectShellMode(value: string) {
  if (value !== "light" && value !== "dark") return;
  apply(snapshot.season, value);
  for (const listener of listeners) listener();
}
export function useShellSettings() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initial);
}
export function useShellPalette() {
  const { season, mode } = useShellSettings();
  return paletteForSeason(season, mode);
}
