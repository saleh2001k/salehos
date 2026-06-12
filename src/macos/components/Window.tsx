import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Maximize2, Minus, X } from "lucide-react";
import { useRef, useState, type ReactNode, type RefObject } from "react";

export interface WindowFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Vertical space reserved for the dock so a maximized window never sits under it. */
const DOCK_RESERVE = 94;
/** Uniform gap between a maximized window and every screen edge. */
const MAX_MARGIN = 10;
const MIN_W = 380;
const MIN_H = 260;

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const EDGES: { edge: ResizeEdge; className: string; cursor: string }[] = [
  { edge: "n", className: "left-2 right-2 -top-1 h-2", cursor: "ns-resize" },
  { edge: "s", className: "left-2 right-2 -bottom-1 h-2", cursor: "ns-resize" },
  { edge: "e", className: "top-2 bottom-2 -right-1 w-2", cursor: "ew-resize" },
  { edge: "w", className: "top-2 bottom-2 -left-1 w-2", cursor: "ew-resize" },
  { edge: "ne", className: "-right-1.5 -top-1.5 h-4 w-4", cursor: "nesw-resize" },
  { edge: "nw", className: "-left-1.5 -top-1.5 h-4 w-4", cursor: "nwse-resize" },
  { edge: "se", className: "-bottom-1.5 -right-1.5 h-4 w-4", cursor: "nwse-resize" },
  { edge: "sw", className: "-bottom-1.5 -left-1.5 h-4 w-4", cursor: "nesw-resize" },
];

interface WindowProps {
  title: string;
  z: number;
  minimized: boolean;
  maximized: boolean;
  frame: WindowFrame;
  constraintsRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  /** Extra classes for the content area (e.g. terminal background). */
  bodyClassName?: string;
  /** Darker translucent chrome for terminal-style windows. */
  dark?: boolean;
  children: ReactNode;
}

export function Window({
  title,
  z,
  minimized,
  maximized,
  frame,
  constraintsRef,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  bodyClassName = "",
  dark = false,
  children,
}: WindowProps) {
  const reduce = useReducedMotion();
  const dragControls = useDragControls();

  // Clamp the opening size and position so windows never spawn off-screen.
  const [start] = useState(() => {
    const w = Math.min(frame.w, window.innerWidth - 16);
    const h = Math.min(frame.h, window.innerHeight - 28 - DOCK_RESERVE - 8);
    const x = Math.max(0, Math.min(frame.x, window.innerWidth - w - 8));
    const y = Math.max(0, Math.min(frame.y, window.innerHeight - 28 - DOCK_RESERVE - h));
    return { x, y, w, h };
  });
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const w = useMotionValue(start.w);
  const h = useMotionValue(start.h);
  const restoreTo = useRef({ x: start.x, y: start.y, w: start.w, h: start.h });

  const desktopSize = () => {
    const rect = constraintsRef.current?.getBoundingClientRect();
    return { w: rect?.width ?? window.innerWidth, h: rect?.height ?? window.innerHeight - 28 };
  };

  // Real macOS zoom feel: glide to the top-left corner first, then grow.
  // Restoring runs the reverse — shrink back, then glide into place.
  const toggleMaximize = () => {
    const desk = desktopSize();
    // Equal margin on all four sides; the bottom edge additionally clears the dock.
    const maxW = desk.w - MAX_MARGIN * 2;
    const maxH = desk.h - DOCK_RESERVE - MAX_MARGIN;
    if (!maximized) {
      restoreTo.current = { x: x.get(), y: y.get(), w: w.get(), h: h.get() };
      if (reduce) {
        x.set(MAX_MARGIN);
        y.set(MAX_MARGIN);
        w.set(maxW);
        h.set(maxH);
      } else {
        animate(x, MAX_MARGIN, { duration: 0.22, ease: "easeOut" });
        animate(y, MAX_MARGIN, { duration: 0.22, ease: "easeOut" });
        animate(w, maxW, { duration: 0.26, delay: 0.18, ease: [0.32, 0.72, 0, 1] });
        animate(h, maxH, { duration: 0.26, delay: 0.18, ease: [0.32, 0.72, 0, 1] });
      }
    } else {
      const prev = restoreTo.current;
      if (reduce) {
        x.set(prev.x);
        y.set(prev.y);
        w.set(prev.w);
        h.set(prev.h);
      } else {
        animate(w, prev.w, { duration: 0.26, ease: [0.32, 0.72, 0, 1] });
        animate(h, prev.h, { duration: 0.26, ease: [0.32, 0.72, 0, 1] });
        animate(x, prev.x, { duration: 0.22, delay: 0.18, ease: "easeOut" });
        animate(y, prev.y, { duration: 0.22, delay: 0.18, ease: "easeOut" });
      }
    }
    onMaximize();
  };

  const startResize = (edge: ResizeEdge, event: React.PointerEvent) => {
    if (maximized) return;
    event.preventDefault();
    event.stopPropagation();
    onFocus();

    const origin = { px: event.clientX, py: event.clientY, x: x.get(), y: y.get(), w: w.get(), h: h.get() };
    const desk = desktopSize();

    const onMove = (move: PointerEvent) => {
      const dx = move.clientX - origin.px;
      const dy = move.clientY - origin.py;

      if (edge.includes("e")) {
        w.set(Math.max(MIN_W, Math.min(origin.w + dx, desk.w - origin.x)));
      }
      if (edge.includes("s")) {
        h.set(Math.max(MIN_H, Math.min(origin.h + dy, desk.h - origin.y)));
      }
      if (edge.includes("w")) {
        const next = Math.max(MIN_W, Math.min(origin.w - dx, origin.x + origin.w));
        w.set(next);
        x.set(origin.x + origin.w - next);
      }
      if (edge.includes("n")) {
        const next = Math.max(MIN_H, Math.min(origin.h - dy, origin.y + origin.h));
        h.set(next);
        y.set(origin.y + origin.h - next);
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    // drag stays enabled permanently: toggling it off tears down the drag
    // feature mid-render, which stops in-flight x/y animations (maximize glide).
    // No dragConstraints — with constraints, Framer rescales x/y whenever the
    // element resizes, hijacking the maximize animation. Clamping happens in
    // onDragEnd instead, which also allows mac-style partially off-screen windows.
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => {
        const desk = desktopSize();
        const minX = -(w.get() - 120);
        const maxX = desk.w - 120;
        const maxY = desk.h - 60;
        const targetX = Math.max(minX, Math.min(x.get(), maxX));
        const targetY = Math.max(0, Math.min(y.get(), maxY));
        if (targetX !== x.get()) animate(x, targetX, { duration: reduce ? 0 : 0.2 });
        if (targetY !== y.get()) animate(y, targetY, { duration: reduce ? 0 : 0.2 });
      }}
      onPointerDown={onFocus}
      className="absolute left-0 top-0"
      style={{ x, y, width: w, height: h, zIndex: z, pointerEvents: minimized ? "none" : "auto" }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16 } }}
      transition={{ duration: reduce ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Minimize animates this inner div, NOT the root's x/y motion values —
          animating those leaves them stranded (the dock un-minimize bug).
          Transform-only: animating opacity over a backdrop-blur element makes
          the blur drop out and pop back in when the fade finishes. */}
      <motion.div
        className={`flex h-full w-full flex-col overflow-hidden border shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl ${
          maximized ? "rounded-lg" : "rounded-xl"
        } ${dark ? "border-white/10 bg-[var(--win-dark)]" : "border-white/15 bg-[var(--win)]"}`}
        initial={reduce ? false : { scale: 0.9, y: 14 }}
        animate={
          minimized
            ? { scale: 0.32, y: window.innerHeight * 0.78 }
            : { scale: 1, y: 0 }
        }
        transition={{ duration: reduce ? 0 : 0.32, ease: [0.32, 0.72, 0, 1] }}
      >
        <div
          className="relative flex h-9 shrink-0 cursor-default items-center gap-2 border-b border-white/10 px-3"
          style={{ touchAction: "none" }}
          onPointerDown={(event) => {
            onFocus();
            if (!maximized) dragControls.start(event);
          }}
          onDoubleClick={toggleMaximize}
        >
          <div
            className="group flex items-center gap-2"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={`Close ${title}`}
              onClick={onClose}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57]"
            >
              <X size={8} className="text-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
            <button
              type="button"
              aria-label={`Minimize ${title}`}
              onClick={onMinimize}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e]"
            >
              <Minus size={8} className="text-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
            <button
              type="button"
              aria-label={`Maximize ${title}`}
              onClick={toggleMaximize}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840]"
            >
              <Maximize2 size={7} className="text-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>
          <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-white/60">
            {title}
          </p>
        </div>

        <div className={`min-h-0 flex-1 overflow-auto ${bodyClassName}`}>{children}</div>
      </motion.div>

      {/* Resize handles on every edge and corner */}
      {!maximized &&
        EDGES.map(({ edge, className, cursor }) => (
          <div
            key={edge}
            className={`absolute ${className}`}
            style={{ cursor, touchAction: "none" }}
            onPointerDown={(event) => startResize(edge, event)}
          />
        ))}
    </motion.div>
  );
}
