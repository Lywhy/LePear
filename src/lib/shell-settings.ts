import { useSyncExternalStore } from "react";
import { installShellPalette } from "@/lib/shell-palette";
import {
  findShellSeason,
  paletteForSeason,
  resolveShellSeason,
  type ShellSeasonId,
} from "@/lib/shell-seasons";

const storageKey = "lepear.shell-settings.v1";
interface ShellSettings {
  season: ShellSeasonId;
  saved: boolean;
}
const initial: ShellSettings = { season: "autumn", saved: true };
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
function persist(season: ShellSeasonId) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, season }));
    return true;
  } catch {
    return false;
  }
}
/** Called before React mounts; reads only this feature's versioned storage key. */
export function initializeShellSettings() {
  let season: ShellSeasonId = "autumn";
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (value?.version === 1) season = resolveShellSeason(value.season);
  } catch {
    /* Malformed or unavailable storage falls back to the accepted autumn. */
  }
  installShellPalette(paletteForSeason(season), season);
  snapshot = { season, saved: persist(season) };
}
export function selectShellSeason(value: string) {
  const season = findShellSeason(value);
  if (!season?.palette) return;
  installShellPalette(season.palette, season.id);
  snapshot = { season: season.id, saved: persist(season.id) };
  for (const listener of listeners) listener();
}
export function useShellSettings() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initial);
}
export function useShellPalette() {
  return paletteForSeason(useShellSettings().season);
}
