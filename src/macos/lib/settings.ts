/**
 * User settings: appearance (dark/light/system), UI font, wallpaper.
 * Persisted to localStorage; applied via CSS variables + data attributes.
 */
import { useEffect, useSyncExternalStore } from "react";
import { sfx } from "./sfx";

export type Appearance = "dark" | "light" | "system";

export interface GradientSpec {
  angle: number;
  colors: string[];
}

export type Wallpaper =
  | { kind: "preset"; index: number }
  | { kind: "image"; url: string; name?: string }
  | { kind: "gradient"; gradient: GradientSpec };

export interface Settings {
  appearance: Appearance;
  font: string;
  wallpaper: Wallpaper;
  sound: boolean;
  /** Rotate through the photo wallpapers automatically. */
  shuffle: boolean;
}

export interface FontOption {
  id: string;
  label: string;
  stack: string;
  /** Google Fonts family query, when it needs loading. */
  google?: string;
}

export const FONTS: FontOption[] = [
  {
    id: "system",
    label: "San Francisco (System)",
    stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  { id: "inter", label: "Inter", stack: "'Inter', system-ui, sans-serif" },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    stack: "'Space Grotesk', system-ui, sans-serif",
    google: "Space+Grotesk:wght@400;500;600",
  },
  {
    id: "poppins",
    label: "Poppins",
    stack: "'Poppins', system-ui, sans-serif",
    google: "Poppins:wght@400;500;600",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    stack: "'DM Sans', system-ui, sans-serif",
    google: "DM+Sans:wght@400;500;600",
  },
  {
    id: "nunito",
    label: "Nunito",
    stack: "'Nunito', system-ui, sans-serif",
    google: "Nunito:wght@400;600;700",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    stack: "'Playfair Display', Georgia, serif",
    google: "Playfair+Display:wght@400;500;600",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    stack: "'JetBrains Mono', ui-monospace, monospace",
    google: "JetBrains+Mono:wght@400;500;600",
  },
];

export interface UnsplashWallpaper {
  id: string;
  name: string;
}

/** Direct Unsplash CDN photos — preview small, apply at 2560px. */
export const UNSPLASH: UnsplashWallpaper[] = [
  { id: "photo-1506905925346-21bda4d32df4", name: "Alpine Peak" },
  { id: "photo-1469474968028-56623f02e42e", name: "Golden Valley" },
  { id: "photo-1446776877081-d282a0f896e2", name: "Orbit" },
  { id: "photo-1462331940025-496dfbfc7564", name: "Nebula" },
  { id: "photo-1493246507139-91e8fad9978e", name: "Mirror Lake" },
  { id: "photo-1441974231531-c6227db76b6e", name: "Deep Forest" },
  { id: "photo-1419242902214-272b3f66ee7a", name: "Starfall" },
  { id: "photo-1472214103451-9374bd1c798e", name: "Sunrise Field" },
];

export const unsplashUrl = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const STORAGE_KEY = "macos-settings-v1";

const DEFAULTS: Settings = {
  appearance: "dark",
  font: "system",
  // A real photo by default — gradients are a choice, not the landing look.
  wallpaper: {
    kind: "image",
    url: unsplashUrl("photo-1506905925346-21bda4d32df4", 2560),
    name: "Alpine Peak",
  },
  sound: true,
  shuffle: true,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* fresh */
  }
  return DEFAULTS;
}

let settings: Settings = load();
const listeners = new Set<() => void>();
const loadedFonts = new Set<string>();
let systemWatch: MediaQueryList | null = null;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* quota — keep in memory (e.g. huge custom wallpaper) */
  }
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => settings,
  );
}

/** While shuffle is on, advance through the photo wallpapers every 30s. */
export function useWallpaperShuffle() {
  const { shuffle } = useSettings();
  useEffect(() => {
    if (!shuffle) return;
    const id = setInterval(() => {
      const current = settingsStore.get().wallpaper;
      const index =
        current.kind === "image"
          ? UNSPLASH.findIndex((photo) => current.url.includes(photo.id))
          : -1;
      const next = UNSPLASH[(index + 1) % UNSPLASH.length]!;
      settingsStore.setWallpaper(
        { kind: "image", url: unsplashUrl(next.id, 2560), name: next.name },
        { fromShuffle: true },
      );
    }, 30_000);
    return () => clearInterval(id);
  }, [shuffle]);
}

export function loadFont(option: FontOption) {
  if (!option.google || loadedFonts.has(option.id)) return;
  loadedFonts.add(option.id);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${option.google}&display=swap`;
  document.head.appendChild(link);
}

function applyFont() {
  const option = FONTS.find((font) => font.id === settings.font) ?? FONTS[0]!;
  loadFont(option);
  document.documentElement.style.setProperty("--font-sans", option.stack);
}

function resolveAppearance(): "dark" | "light" {
  if (settings.appearance !== "system") return settings.appearance;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyAppearance() {
  document.documentElement.dataset.appearance = resolveAppearance();
  if (settings.appearance === "system" && !systemWatch) {
    systemWatch = window.matchMedia("(prefers-color-scheme: light)");
    systemWatch.addEventListener("change", () => {
      if (settings.appearance === "system") applyAppearance();
    });
  }
}

export const settingsStore = {
  get: () => settings,
  setAppearance(appearance: Appearance) {
    settings = { ...settings, appearance };
    applyAppearance();
    emit();
  },
  setFont(font: string) {
    settings = { ...settings, font };
    applyFont();
    emit();
  },
  setWallpaper(wallpaper: Wallpaper, options?: { fromShuffle?: boolean }) {
    // An explicit pick wins over auto-rotation.
    const shuffle = options?.fromShuffle ? settings.shuffle : false;
    settings = { ...settings, wallpaper, shuffle };
    emit();
  },
  setShuffle(shuffle: boolean) {
    settings = { ...settings, shuffle };
    emit();
  },
  setSound(sound: boolean) {
    settings = { ...settings, sound };
    sfx.setMuted(!sound);
    emit();
  },
  /** Wipe persisted settings and return to defaults. */
  reset() {
    settings = DEFAULTS;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* fine */
    }
    applyFont();
    applyAppearance();
    listeners.forEach((listener) => listener());
  },
  /** Run once at startup to apply persisted values. */
  init() {
    applyFont();
    applyAppearance();
    sfx.setMuted(!settings.sound);
  },
};
