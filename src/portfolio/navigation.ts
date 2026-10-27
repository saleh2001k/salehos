import { useEffect, useState, useSyncExternalStore } from "react";
import { animate } from "motion/react";
import { EASE_IN_OUT } from "./motion";

/* ------------------------------------------------------------------ */
/* Scroll-spy with a click lock                                        */
/*                                                                     */
/* Clicking a nav item scrolls past every section in between. Without  */
/* a lock the spy lights each one up on the way, so the pill wanders.  */
/* While a programmatic scroll runs, the target stays active; the spy  */
/* resumes once it lands (or the visitor takes over the wheel).        */
/* ------------------------------------------------------------------ */

let active = "";
let locked: string | null = null;
const listeners = new Set<() => void>();
const setActive = (id: string) => {
  if (id === active) return;
  active = id;
  listeners.forEach((l) => l());
};

export function useActiveSection(ids: string[]) {
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (locked) return;
      const line = window.innerHeight * 0.38;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? ids[ids.length - 1] : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => active,
  );
}

let stop: (() => void) | null = null;

/** True while a nav click is driving the scroll. */
export const isNavigating = () => locked !== null;

/** Eased scroll to a section; the nav shows the destination right away. */
export function scrollToSection(id: string) {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return;
  const offset = id === "top" ? 0 : 84;
  // Layout position, not the painted one: sections are transformed while
  // they enter and leave, which would skew getBoundingClientRect.
  let layoutTop = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) layoutTop += n.offsetTop;
  const target = Math.max(
    0,
    Math.min(id === "top" ? 0 : layoutTop - offset, document.documentElement.scrollHeight - window.innerHeight),
  );
  stop?.();
  locked = id;
  setActive(id === "top" ? "" : id);
  history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const distance = Math.abs(target - window.scrollY);
  const release = () => {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
    // Let the spy re-measure after the final frame lands.
    requestAnimationFrame(() => {
      locked = null;
      window.dispatchEvent(new Event("scroll"));
    });
    stop = null;
  };
  const cancel = () => {
    controls.stop();
    // The visitor took over before arriving: don't leave a hash that lies.
    history.replaceState(null, "", window.location.pathname);
    release();
  };
  const controls = animate(window.scrollY, target, {
    duration: reduced ? 0 : Math.min(1.5, Math.max(0.7, distance / 2600)),
    ease: EASE_IN_OUT,
    onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }),
    onComplete: release,
  });
  window.addEventListener("wheel", cancel, { passive: true, once: true });
  window.addEventListener("touchstart", cancel, { passive: true, once: true });
  window.addEventListener("keydown", cancel, { once: true });
  stop = cancel;
}

/* ------------------------------------------------------------------ */
/* Page curtain — covers the screen before leaving for another route   */
/* ------------------------------------------------------------------ */

let curtain: { label: string } | null = null;
const curtainListeners = new Set<() => void>();

export function useCurtain() {
  return useSyncExternalStore(
    (cb) => {
      curtainListeners.add(cb);
      return () => curtainListeners.delete(cb);
    },
    () => curtain,
  );
}

export function leaveTo(url: string, label: string) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    window.location.assign(url);
    return;
  }
  curtain = { label };
  curtainListeners.forEach((l) => l());
  window.setTimeout(() => window.location.assign(url), 900);
}

// Coming back through the back/forward cache restores the covered page.
window.addEventListener("pageshow", (e) => {
  if (e.persisted && curtain) {
    curtain = null;
    curtainListeners.forEach((l) => l());
  }
});

/** Local time in Amman, ticking each minute. */
export function useAmmanTime() {
  const fmt = () =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Amman",
    }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}
