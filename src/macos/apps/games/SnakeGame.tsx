import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

const GRID = 16;
const CELL = 22;
const TICK_MS = 110;

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const DIRS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function randomFood(snake: Point[]): Point {
  while (true) {
    const food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((p) => p.x === food.x && p.y === food.y)) return food;
  }
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("snake-best") ?? 0));
  const [status, setStatus] = useState<"idle" | "running" | "over">("idle");

  const snake = useRef<Point[]>([{ x: 8, y: 8 }]);
  const dir = useRef<Dir>("right");
  const nextDir = useRef<Dir>("right");
  const food = useRef<Point>({ x: 12, y: 8 });
  const statusRef = useRef(status);
  statusRef.current = status;

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, GRID * CELL, GRID * CELL);

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    ctx.fillStyle = "#e8aa42";
    ctx.beginPath();
    ctx.arc(food.current.x * CELL + CELL / 2, food.current.y * CELL + CELL / 2, CELL / 2.8, 0, Math.PI * 2);
    ctx.fill();

    snake.current.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? "#34d058" : "#28a745";
      ctx.beginPath();
      ctx.roundRect(part.x * CELL + 1.5, part.y * CELL + 1.5, CELL - 3, CELL - 3, 5);
      ctx.fill();
    });
  }, []);

  const reset = useCallback(() => {
    snake.current = [{ x: 8, y: 8 }];
    dir.current = "right";
    nextDir.current = "right";
    food.current = randomFood(snake.current);
    setScore(0);
    setStatus("running");
    sfx.click();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Enter starts / restarts (also fired by the on-screen action button).
      if (event.key === "Enter" && statusRef.current !== "running") {
        reset();
        return;
      }
      const next = KEY_DIRS[event.key];
      if (!next) return;
      if (event.isTrusted) event.preventDefault();
      if (statusRef.current !== "running") return;
      // Disallow instant reversal.
      const opposite: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
      if (next !== opposite[dir.current]) nextDir.current = next;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  useEffect(() => {
    draw();
    if (status !== "running") return;
    // Speed up as the snake grows.
    const speed = Math.max(55, TICK_MS - score * 3);
    const id = setInterval(() => {
      dir.current = nextDir.current;
      const delta = DIRS[dir.current];
      const head = snake.current[0]!;
      const next = { x: head.x + delta.x, y: head.y + delta.y };

      const hitWall = next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID;
      const hitSelf = snake.current.some((p) => p.x === next.x && p.y === next.y);
      if (hitWall || hitSelf) {
        sfx.gameOver();
        setStatus("over");
        return;
      }

      snake.current = [next, ...snake.current];
      if (next.x === food.current.x && next.y === food.current.y) {
        sfx.eat();
        setScore((value) => value + 1);
        food.current = randomFood(snake.current);
      } else {
        snake.current.pop();
      }
      draw();
    }, speed);
    return () => clearInterval(id);
  }, [status, draw, score]);

  useEffect(() => {
    if (status === "over" && score > best) {
      setBest(score);
      localStorage.setItem("snake-best", String(score));
    }
  }, [status, score, best]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-[352px] items-center justify-between text-sm">
        <span className="text-white/70">
          Score <span className="font-semibold text-white">{score}</span>
        </span>
        <span className="text-white/50">
          Best <span className="font-semibold text-[#e8aa42]">{best}</span>
        </span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID * CELL}
          height={GRID * CELL}
          className="h-auto max-w-full rounded-lg border border-white/15 bg-[#101014]"
        />
        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/60 backdrop-blur-sm">
            {status === "over" && <p className="text-lg font-semibold text-white">Game Over</p>}
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-5 py-1.5 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={reset}
            >
              {status === "over" ? "Play Again" : "Start"}
            </button>
            <p className="text-xs text-white/50">Arrow keys or WASD</p>
          </div>
        )}
      </div>
    </div>
  );
}
