import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { site } from "../data/content";
import { WhatsAppIcon } from "./Icons";
import { useScrollLock } from "./Modal";
import { EASE, EASE_IN_OUT } from "./motion";
import { useCurtain } from "./navigation";

/* ------------------------------------------------------------------ */
/* Intro: a counter, the name, then the curtain lifts. Once a session. */
/* ------------------------------------------------------------------ */

const INTRO_KEY = "portfolio-intro-seen";

export function shouldPlayIntro() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return sessionStorage.getItem(INTRO_KEY) !== "1";
  } catch {
    return false;
  }
}

export function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useScrollLock(!leaving);
  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.5,
      ease: [0.5, 0, 0.2, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
          /* ignore */
        }
        setLeaving(true);
        window.setTimeout(onDone, 380);
      },
    });
    return () => controls.stop();
  }, [onDone]);

  const name = "Saleh Al-Mashni";
  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          className="preloader"
          aria-hidden="true"
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.9, ease: EASE_IN_OUT } }}
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <div className="pre-name">
            {name.split("").map((ch, i) => (
              <span className="rt-mask" key={i}>
                <motion.span
                  className={i > 5 ? "serif" : undefined}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-110%", transition: { duration: 0.5, ease: EASE_IN_OUT, delay: i * 0.012 } }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.03 }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              </span>
            ))}
          </div>
          <div className="pre-foot mono">
            <span>(Portfolio ©2026)</span>
            <span>React Native · Native · Web</span>
            <span className="pre-count">{String(count).padStart(3, "0")}</span>
          </div>
          <motion.i className="pre-bar" style={{ scaleX: count / 100 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Route curtain                                                       */
/* ------------------------------------------------------------------ */

export function Curtain() {
  const curtain = useCurtain();
  return (
    <AnimatePresence>
      {curtain && (
        <motion.div
          className="curtain"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.75, ease: EASE_IN_OUT }}
        >
          <div className="rt-mask">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
            >
              {curtain.label}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Cursor label — appears over anything with data-cursor               */
/* ------------------------------------------------------------------ */

export function CursorLabel() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });
  const [label, setLabel] = useState<string | null>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = () => setFine(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!fine) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target ? target.getAttribute("data-cursor") : null);
    };
    const leave = () => setLabel(null);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine, x, y]);

  if (!fine || reduced) return null;
  return (
    <motion.div className="cursor-label" style={{ x: sx, y: sy }} aria-hidden="true">
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating WhatsApp                                                   */
/* ------------------------------------------------------------------ */

export function WhatsAppButton({ show }: { show: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          className="wa-fab"
          href={site.whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label={`Chat on WhatsApp, ${site.phone}`}
          onHoverStart={() => setHover(true)}
          onHoverEnd={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          layout
          style={{ borderRadius: 999 }}
          initial={{ scale: 0, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          <motion.span layout="position" className="wa-icon">
            <WhatsAppIcon size={22} />
          </motion.span>
          <AnimatePresence mode="popLayout">
            {hover && (
              <motion.span
                className="wa-text"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.08 } }}
                exit={{ opacity: 0, x: -6, transition: { duration: 0.1 } }}
              >
                <strong>Chat on WhatsApp</strong>
                <small>{site.phone}</small>
              </motion.span>
            )}
          </AnimatePresence>
          <span className="wa-ping" aria-hidden="true" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
