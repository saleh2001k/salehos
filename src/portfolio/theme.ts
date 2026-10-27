import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

const KEY = "portfolio-theme";
const listeners = new Set<() => void>();

function read(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "dark" ? "dark" : "light";
}

function apply(next: Theme) {
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", next === "dark" ? "#0a0a0a" : "#f4f4f3");
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* private mode: the choice just won't persist */
  }
  listeners.forEach((l) => l());
}

/** Initial theme is set before paint by the inline script in index.html. */
export function useTheme() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "light" as Theme,
  );
}

/**
 * Switch theme with a circular reveal from `origin` (the toggle's centre).
 * Uses the View Transitions API: the old page is a frozen snapshot and the
 * new one grows out of the button — the same idea as the native package.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = read() === "dark" ? "light" : "dark";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };
  if (!doc.startViewTransition || reduced) {
    apply(next);
    return;
  }
  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 40;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document.documentElement.classList.add("theme-switching");
  // Safety net: never leave transitions disabled if the animation is skipped.
  const release = window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 1400);
  const t = doc.startViewTransition(() => flushSync(() => apply(next)));
  t.ready
    .then(() => {
      const anim = document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        {
          duration: 760,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
      anim.finished.finally(() => {
        clearTimeout(release);
        document.documentElement.classList.remove("theme-switching");
      });
    })
    .catch(() => document.documentElement.classList.remove("theme-switching"));
}
