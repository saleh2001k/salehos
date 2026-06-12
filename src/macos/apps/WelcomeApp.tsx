import { AnimatePresence, motion } from "motion/react";
import {
  AppWindow,
  ChevronLeft,
  FolderOpen,
  Gamepad2,
  MousePointerClick,
  Search,
  Settings2,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { site } from "../../data/content";
import { sfx } from "../lib/sfx";

interface Step {
  Icon: LucideIcon;
  color: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    Icon: AppWindow,
    color: "#5aa7f2",
    title: `This is ${site.name}’s portfolio`,
    body: "Not a real Mac — a senior mobile & full-stack engineer’s website that behaves like one. Everything you see is built from scratch in React.",
  },
  {
    Icon: FolderOpen,
    color: "#34d058",
    title: "Browse like a Mac",
    body: "Double-click the desktop folders or open Finder for projects, experience, and skills. You can even create your own files and folders.",
  },
  {
    Icon: MousePointerClick,
    color: "#e8aa42",
    title: "Everything is interactive",
    body: "Drag, resize, minimize and maximize windows. Right-click the desktop, the icons, and the dock — there are menus everywhere.",
  },
  {
    Icon: Search,
    color: "#b07ef0",
    title: "Spotlight",
    body: "Press ⌘K (or the magnifier, top right) and type to jump anywhere — apps, projects, contact, games.",
  },
  {
    Icon: TerminalSquare,
    color: "#28c840",
    title: "A real terminal",
    body: "Open Terminal and type help. A few commands are not in the manual — try sudo, coffee, or doom.",
  },
  {
    Icon: Gamepad2,
    color: "#ff6b64",
    title: "The Arcade",
    body: "Twelve games behind the rocket in the dock — including DOOM, Prince of Persia, and Lemmings. Sound on.",
  },
  {
    Icon: Settings2,
    color: "#8f9aab",
    title: "Make it yours",
    body: "Open Settings to change the wallpaper, switch light or dark mode, and pick a different font. The Welcome file on the desktop brings this tour back.",
  },
];

export function WelcomeApp({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;

  const go = (next: number) => {
    sfx.click();
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="flex h-full flex-col items-center justify-center gap-5 text-center"
          >
            <motion.span
              className="flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ backgroundColor: `${current.color}26` }}
              initial={{ scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.08 }}
            >
              <current.Icon size={38} style={{ color: current.color }} />
            </motion.span>
            <motion.h2
              className="max-w-sm font-display text-xl font-semibold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              {current.title}
            </motion.h2>
            <motion.p
              className="max-w-sm text-sm leading-relaxed text-white/65"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              {current.body}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-4">
        {STEPS.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Step ${index + 1}`}
            className="p-0.5"
            onClick={() => go(index)}
          >
            <motion.span
              className="block h-1.5 rounded-full"
              animate={{
                width: index === step ? 18 : 6,
                backgroundColor: index === step ? "#5aa7f2" : "rgba(140,140,150,0.45)",
              }}
              transition={{ duration: 0.25 }}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-white/60 hover:text-white"
            onClick={() => go(step - 1)}
          >
            <ChevronLeft size={15} />
            Back
          </button>
        ) : (
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-sm text-white/40 hover:text-white/70"
            onClick={onClose}
          >
            Skip
          </button>
        )}
        <button
          type="button"
          className="rounded-full bg-[#2a7de1] px-6 py-2 text-sm font-medium text-[#fff] hover:bg-[#3b8af0]"
          onClick={() => (last ? onClose() : go(step + 1))}
        >
          {last ? "Start exploring" : "Next"}
        </button>
      </div>
    </div>
  );
}
