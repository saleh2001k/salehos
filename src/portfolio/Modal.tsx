import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue, usePresence, useTransform } from "motion/react";
import { EASE } from "./motion";

let locks = 0;
function lockScroll() {
  if (locks++ === 0) {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--scrollbar-gap", `${gap}px`);
    document.documentElement.classList.add("scroll-locked");
  }
}
function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.documentElement.classList.remove("scroll-locked");
}

/** Locks page scroll while mounted. */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}

const PANEL_RADIUS = 24;

/**
 * Dialog shell: portal, backdrop, Escape, focus trap, scroll lock.
 *
 * Given an `origin` element, the panel morphs out of it: it starts centred
 * on the trigger and clipped to the trigger's size and corner radius, then
 * opens to full size — and closes back into the same spot. Clip-path rather
 * than scale, so nothing inside ever stretches.
 */
export function Modal({
  onClose,
  label,
  children,
  origin,
  originRadius = 14,
  className = "",
}: {
  onClose: () => void;
  label: string;
  children: ReactNode;
  origin?: HTMLElement | null;
  originRadius?: number;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  const [closing, setClosing] = useState(false);
  const geo = useRef({ dx: 0, dy: 0, ix: 0, iy: 0 });
  const p = useMotionValue(0);
  const morph = Boolean(origin);

  const clipPath = useTransform(p, (v) => {
    if (!morph || v >= 1) return "none";
    const { ix, iy } = geo.current;
    const k = Math.max(0, 1 - v);
    const r = originRadius + (PANEL_RADIUS - originRadius) * v;
    return `inset(${iy * k}px ${ix * k}px ${iy * k}px ${ix * k}px round ${r}px)`;
  });
  const x = useTransform(p, (v) => geo.current.dx * (1 - v));
  const y = useTransform(p, (v) => (morph ? geo.current.dy * (1 - v) : 48 * (1 - v)));
  const opacity = useTransform(p, (v) => (morph ? 1 : v));

  const measure = () => {
    const el = panel.current;
    if (!el || !origin?.isConnected) return false;
    const o = origin.getBoundingClientRect();
    if (!o.width) return false;
    // Panel's resting box (strip any transform currently applied).
    const r = el.getBoundingClientRect();
    const left = r.left - x.get();
    const top = r.top - y.get();
    geo.current = {
      dx: o.left + o.width / 2 - (left + r.width / 2),
      dy: o.top + o.height / 2 - (top + r.height / 2),
      ix: Math.max(0, (r.width - o.width) / 2),
      iy: Math.max(0, (r.height - o.height) / 2),
    };
    return true;
  };

  useLayoutEffect(() => {
    if (morph && !measure()) geo.current = { dx: 0, dy: 0, ix: 0, iy: 0 };
    p.set(0);
    const c = animate(p, 1, { type: "spring", stiffness: 260, damping: 32, mass: 0.9 });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPresent) return;
    setClosing(true);
    if (morph) measure();
    const c = animate(p, 0, { duration: morph ? 0.5 : 0.25, ease: [0.4, 0, 0.2, 1] });
    c.then(() => safeToRemove?.());
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  useScrollLock(!closing);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      panel.current?.querySelector<HTMLElement>("[data-autofocus], button, a[href]")?.focus({ preventScroll: true });
    }, 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [
        ...panel.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-root" style={closing ? { pointerEvents: "none" } : undefined}>
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.4 : 0.35 }}
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`modal-panel ${className}`}
        style={{ clipPath, x, y, opacity }}
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0 }}
          animate={{
            opacity: closing ? 0 : 1,
            transition: closing ? { duration: 0.12 } : { duration: 0.35, delay: morph ? 0.16 : 0.05, ease: EASE },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}
