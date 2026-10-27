import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Gamepad2, X } from "lucide-react";
import { useScrollLock } from "./Modal";
import { EASE } from "./motion";
import { useTheme } from "./theme";

/* ------------------------------------------------------------------ */
/* Dot field — the hero's background. It leans away from the cursor,  */
/* ripples where you click, and doubles as a Snake board.             */
/* ------------------------------------------------------------------ */

type Cell = { c: number; r: number };
type Dir = "up" | "down" | "left" | "right";
const STEP: Record<Dir, Cell> = {
  up: { c: 0, r: -1 },
  down: { c: 0, r: 1 },
  left: { c: -1, r: 0 },
  right: { c: 1, r: 0 },
};
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
const KEYS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};
const BEST_KEY = "portfolio-snake-best";

type Game = {
  snake: Cell[];
  dir: Dir;
  queue: Dir[];
  food: Cell;
  last: number;
  over: boolean;
  eaten: number;
};

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function DotField({
  playing,
  onExit,
}: {
  playing: boolean;
  onExit: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [over, setOver] = useState(false);
  const state = useRef({
    w: 0,
    h: 0,
    gap: 24,
    cols: 0,
    rows: 0,
    ox: 0,
    oy: 0,
    px: -9999,
    py: -9999,
    ink: "12,12,12",
    ripples: [] as { x: number; y: number; t: number }[],
    visible: true,
    game: null as Game | null,
    // Playable rectangle in grid cells: the part of the field on screen,
    // clear of the header above and the score bar below.
    board: { c0: 0, c1: 0, r0: 0, r1: 0 },
  });
  if (import.meta.env.DEV) (window as unknown as { __snake?: unknown }).__snake = state.current;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  useScrollLock(playing);

  // Ink colour follows the theme.
  useEffect(() => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#0c0c0c";
    const n = parseInt(hex.replace("#", ""), 16);
    state.current.ink = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }, [theme]);

  // Size the canvas to the hero and lay out the grid.
  useEffect(() => {
    const el = canvas.current!;
    const host = el.parentElement!;
    // CSS sizes the canvas (full-bleed across the hero); match its pixels.
    const fit = () => {
      const s = state.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = el.clientWidth;
      s.h = el.clientHeight;
      s.gap = s.w < 640 ? 20 : 24;
      s.cols = Math.floor(s.w / s.gap);
      s.rows = Math.floor(s.h / s.gap);
      s.ox = (s.w - (s.cols - 1) * s.gap) / 2;
      s.oy = (s.h - (s.rows - 1) * s.gap) / 2;
      el.width = s.w * dpr;
      el.height = s.h * dpr;
      el.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (state.current.visible = e.isIntersecting));
    io.observe(host);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Pointer: lean + click ripples (ignore clicks on real controls).
  useEffect(() => {
    const el = canvas.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      state.current.px = e.clientX - r.left;
      state.current.py = e.clientY - r.top;
    };
    const leave = () => {
      state.current.px = -9999;
      state.current.py = -9999;
    };
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button, input, textarea, [role=dialog]")) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      state.current.ripples.push({ x, y, t: performance.now() });
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  /* ---------------- Snake ---------------- */

  const spawnFood = (g: Game): Cell => {
    const { c0, c1, r0, r1 } = state.current.board;
    for (let i = 0; i < 200; i++) {
      const cell = {
        c: c0 + 1 + Math.floor(Math.random() * Math.max(1, c1 - c0 - 1)),
        r: r0 + 1 + Math.floor(Math.random() * Math.max(1, r1 - r0 - 1)),
      };
      if (!g.snake.some((p) => p.c === cell.c && p.r === cell.r)) return cell;
    }
    return { c: c0 + 1, r: r0 + 1 };
  };

  const reset = () => {
    const s = state.current;
    const top = canvas.current!.getBoundingClientRect().top;
    const visibleH = Math.min(s.h, window.innerHeight - top);
    s.board = {
      c0: 0,
      c1: s.cols - 1,
      r0: Math.max(0, Math.ceil((84 - top - s.oy) / s.gap)),
      r1: Math.min(s.rows - 1, Math.floor((visibleH - 96 - s.oy) / s.gap)),
    };
    const c = Math.floor((s.board.c0 + s.board.c1) / 2);
    const r = Math.floor((s.board.r0 + s.board.r1) / 2);
    const g: Game = {
      snake: [0, 1, 2, 3].map((i) => ({ c: c - i, r })),
      dir: "right",
      queue: [],
      food: { c: 0, r: 0 },
      last: performance.now(),
      over: false,
      eaten: 0,
    };
    g.food = spawnFood(g);
    s.game = g;
    setScore(0);
    setOver(false);
  };

  useEffect(() => {
    if (!playing) {
      state.current.game = null;
      return;
    }
    reset();
    const turn = (d: Dir) => {
      const g = state.current.game;
      if (!g || g.over) return;
      const lastDir = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
      if (d !== lastDir && d !== OPPOSITE[lastDir] && g.queue.length < 3) g.queue.push(d);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
        return;
      }
      if ((e.key === " " || e.key === "Enter") && state.current.game?.over) {
        e.preventDefault();
        reset();
        return;
      }
      const d = KEYS[e.key] ?? KEYS[e.key.toLowerCase()];
      if (d) {
        e.preventDefault();
        turn(d);
      }
    };
    let sx = 0;
    let sy = 0;
    const tStart = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const tEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
        if (state.current.game?.over) reset();
        return;
      }
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    };
    const block = (e: TouchEvent) => e.preventDefault();
    window.addEventListener("keydown", key);
    window.addEventListener("touchstart", tStart, { passive: true });
    window.addEventListener("touchend", tEnd, { passive: true });
    window.addEventListener("touchmove", block, { passive: false });
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("touchstart", tStart);
      window.removeEventListener("touchend", tEnd);
      window.removeEventListener("touchmove", block);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const advance = (now: number) => {
    const s = state.current;
    const g = s.game;
    if (!g || g.over) return;
    const interval = Math.max(58, 110 - g.eaten * 3);
    if (now - g.last < interval) return;
    g.last = now;
    if (g.queue.length) g.dir = g.queue.shift()!;
    const head = g.snake[0];
    const step = STEP[g.dir];
    // The board wraps: leave one side, come back on the other.
    const { c0, c1, r0, r1 } = s.board;
    const wrapTo = (v: number, lo: number, hi: number) => (v < lo ? hi : v > hi ? lo : v);
    const next = {
      c: wrapTo(head.c + step.c, c0, c1),
      r: wrapTo(head.r + step.r, r0, r1),
    };
    if (g.snake.some((p, i) => i < g.snake.length - 1 && p.c === next.c && p.r === next.r)) {
      g.over = true;
      setOver(true);
      const b = Math.max(readBest(), g.eaten);
      try {
        localStorage.setItem(BEST_KEY, String(b));
      } catch {
        /* ignore */
      }
      setBest(b);
      return;
    }
    g.snake.unshift(next);
    if (next.c === g.food.c && next.r === g.food.r) {
      g.eaten += 1;
      setScore(g.eaten);
      s.ripples.push({ x: s.ox + next.c * s.gap, y: s.oy + next.r * s.gap, t: now });
      g.food = spawnFood(g);
    } else {
      g.snake.pop();
    }
  };

  // Dev-only handles so the game can be driven in automated checks.
  if (import.meta.env.DEV) (window as unknown as { __snakeStep?: unknown }).__snakeStep = advance;

  /* ---------------- Render loop ---------------- */

  useEffect(() => {
    let frame = 0;
    const ctx = canvas.current!.getContext("2d")!;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const s = state.current;
      if (!s.visible || document.hidden) return;
      if (playingRef.current) advance(now);
      ctx.clearRect(0, 0, s.w, s.h);
      const t = now / 1000;
      const game = playingRef.current ? s.game : null;
      s.ripples = s.ripples.filter((rp) => now - rp.t < 1600);
      const R = 150;

      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
          let x = s.ox + c * s.gap;
          let y = s.oy + r * s.gap;
          const inBoard =
            !game || (r >= s.board.r0 && r <= s.board.r1 && c >= s.board.c0 && c <= s.board.c1);
          let a = game ? (inBoard ? 0.1 : 0.03) : 0.13;
          let size = 1.1;
          if (!reduced) {
            if (!game) a += 0.05 * Math.sin(t * 0.9 + (x + y) * 0.011);
            const dx = x - s.px;
            const dy = y - s.py;
            const d = Math.hypot(dx, dy);
            if (d < R) {
              const k = 1 - d / R;
              a += 0.45 * k;
              size += 1.6 * k;
              if (d > 0.01) {
                x += (dx / d) * k * 9;
                y += (dy / d) * k * 9;
              }
            }
            for (const rp of s.ripples) {
              const age = (now - rp.t) / 1000;
              const ring = age * 420;
              const dist = Math.abs(Math.hypot(x - rp.x, y - rp.y) - ring);
              if (dist < 26) {
                const k = (1 - dist / 26) * (1 - age / 1.6);
                a += 0.6 * k;
                size += 1.8 * k;
              }
            }
          }
          ctx.fillStyle = `rgba(${s.ink},${Math.min(1, Math.max(0, a))})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (game) {
        const cellSize = s.gap * 0.78;
        game.snake.forEach((p, i) => {
          const x = s.ox + p.c * s.gap;
          const y = s.oy + p.r * s.gap;
          const fade = 1 - (i / game.snake.length) * 0.55;
          const sz = i === 0 ? cellSize : cellSize * 0.82;
          ctx.fillStyle = `rgba(${s.ink},${game.over ? fade * 0.35 : fade})`;
          ctx.beginPath();
          ctx.roundRect(x - sz / 2, y - sz / 2, sz, sz, sz * 0.32);
          ctx.fill();
        });
        const fx = s.ox + game.food.c * s.gap;
        const fy = s.oy + game.food.r * s.gap;
        const pulse = 0.5 + 0.5 * Math.sin(t * 6);
        ctx.strokeStyle = `rgba(${s.ink},${0.35 + 0.4 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fx, fy, cellSize * (0.45 + 0.15 * pulse), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(${s.ink},1)`;
        ctx.beginPath();
        ctx.arc(fx, fy, cellSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <>
      <canvas ref={canvas} className="dot-field" aria-hidden="true" />
      <AnimatePresence>
        {playing && (
          <motion.div
            className="arcade-hud mono"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="hud-title">Snake</span>
            <span>
              Score <b>{String(score).padStart(3, "0")}</b>
            </span>
            <span>
              Best <b>{String(Math.max(best, score)).padStart(3, "0")}</b>
            </span>
            <span className="hud-hint">
              {over ? "Game over · Space or tap to retry" : "Arrows, WASD or swipe · Esc to leave"}
            </span>
            <button type="button" className="icon-btn" onClick={onExit} aria-label="Leave the game">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* A tiny snake circling a 3×3 grid of dots — the button's own icon. */
const RING = [0, 1, 2, 5, 8, 7, 6, 3];

function MiniSnake() {
  const reduced = useReducedMotion();
  const [head, setHead] = useState(2);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setHead((h) => (h + 1) % RING.length), 260);
    return () => clearInterval(id);
  }, [reduced]);
  const body = [0, 1, 2].map((i) => RING[(head - i + RING.length) % RING.length]);
  return (
    <span className="mini-snake" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} className={i === body[0] ? "head" : body.includes(i) ? "on" : undefined} />
      ))}
    </span>
  );
}

export function SnakeCard({ onPlay }: { onPlay: () => void }) {
  return (
    <button type="button" className="launch-card" onClick={onPlay} data-cursor="Play">
      <span className="launch-thumb snake-thumb">
        <MiniSnake />
      </span>
      <span className="launch-text">
        <strong>Play Snake</strong>
        <small>On the dot grid behind this page</small>
      </span>
      <Gamepad2 size={16} className="launch-arrow" />
    </button>
  );
}
