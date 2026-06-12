import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "../../data/content";

const PHRASES = [
  site.name,
  "Senior Mobile Engineer",
  "React Native, down to the metal",
  "Full-Stack Web & Mobile",
  "10+ apps shipped to the stores",
  "Welcome to the portfolio",
];

const CYCLE_MS = 4600;

/** Rotating display title in the middle of the desktop. Blend + mask keep it
    part of the wallpaper rather than an element sitting on top of it. */
export function DesktopHero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((value) => (value + 1) % PHRASES.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[34%] flex justify-center"
      aria-hidden="true"
      style={{
        maskImage: "radial-gradient(60% 100% at 50% 50%, black 55%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(60% 100% at 50% 50%, black 55%, transparent 100%)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          className="px-8 text-center font-display text-5xl font-semibold tracking-tight text-[#fff]/85 mix-blend-overlay lg:text-7xl"
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -22, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          {PHRASES[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
