import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

const W = 384;
const H = 320;
const PADDLE_W = 64;
const PADDLE_H = 8;
const BALL_R = 5;
const ROWS = 5;
const COLS = 8;
const BRICK_H = 14;
const BRICK_GAP = 4;
const BRICK_W = (W - BRICK_GAP * (COLS + 1)) / COLS;
const ROW_COLORS = ["#ff6b64", "#f08a5d", "#e8aa42", "#34d058", "#5aa7f2"];

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "running" | "over" | "won">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef<BallState>({ x: W / 2, y: H - 60, vx: 2.4, vy: -2.8 });
  const bricks = useRef<boolean[]>([]);
  const statusRef = useRef(status);
  statusRef.current = status;

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    bricks.current.forEach((alive, index) => {
      if (!alive) return;
      const row = Math.floor(index / COLS);
      const col = index % COLS;
      ctx.fillStyle = ROW_COLORS[row]!;
      ctx.beginPath();
      ctx.roundRect(
        BRICK_GAP + col * (BRICK_W + BRICK_GAP),
        BRICK_GAP + 24 + row * (BRICK_H + BRICK_GAP),
        BRICK_W,
        BRICK_H,
        3,
      );
      ctx.fill();
    });

    ctx.fillStyle = "#e6e6ea";
    ctx.beginPath();
    ctx.roundRect(paddleX.current, H - 18, PADDLE_W, PADDLE_H, 4);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const reset = useCallback(() => {
    bricks.current = Array(ROWS * COLS).fill(true);
    ball.current = { x: W / 2, y: H - 60, vx: 2.4 * (Math.random() > 0.5 ? 1 : -1), vy: -2.8 };
    setScore(0);
    setLives(3);
    setStatus("running");
    sfx.click();
  }, []);

  useEffect(() => {
    draw();
    if (status !== "running") return;

    let raf = 0;
    const step = () => {
      const b = ball.current;
      b.x += b.vx;
      b.y += b.vy;

      // Walls
      if (b.x < BALL_R || b.x > W - BALL_R) {
        b.vx *= -1;
        b.x = Math.max(BALL_R, Math.min(b.x, W - BALL_R));
        sfx.flip();
      }
      if (b.y < BALL_R) {
        b.vy *= -1;
        b.y = BALL_R;
        sfx.flip();
      }

      // Paddle — reflect angle depends on where the ball lands on it
      if (
        b.vy > 0 &&
        b.y > H - 18 - BALL_R &&
        b.y < H - 18 + PADDLE_H &&
        b.x > paddleX.current - BALL_R &&
        b.x < paddleX.current + PADDLE_W + BALL_R
      ) {
        const hit = (b.x - paddleX.current - PADDLE_W / 2) / (PADDLE_W / 2);
        const speed = Math.hypot(b.vx, b.vy);
        const angle = hit * (Math.PI / 3); // up to 60°
        b.vx = speed * Math.sin(angle);
        b.vy = -Math.abs(speed * Math.cos(angle));
        sfx.place();
      }

      // Bricks
      for (let i = 0; i < bricks.current.length; i++) {
        if (!bricks.current[i]) continue;
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const bx = BRICK_GAP + col * (BRICK_W + BRICK_GAP);
        const by = BRICK_GAP + 24 + row * (BRICK_H + BRICK_GAP);
        if (b.x > bx - BALL_R && b.x < bx + BRICK_W + BALL_R && b.y > by - BALL_R && b.y < by + BRICK_H + BALL_R) {
          bricks.current[i] = false;
          sfx.eat();
          setScore((value) => value + (ROWS - row) * 10);
          // Bounce on the shorter overlap axis
          const overlapX = Math.min(b.x - (bx - BALL_R), bx + BRICK_W + BALL_R - b.x);
          const overlapY = Math.min(b.y - (by - BALL_R), by + BRICK_H + BALL_R - b.y);
          if (overlapX < overlapY) b.vx *= -1;
          else b.vy *= -1;
          // Speed up slightly with every brick
          b.vx *= 1.012;
          b.vy *= 1.012;
          break;
        }
      }

      if (bricks.current.every((alive) => !alive)) {
        sfx.win();
        setStatus("won");
        return;
      }

      // Bottom — lose a life
      if (b.y > H + BALL_R) {
        setLives((current) => {
          const next = current - 1;
          if (next <= 0) {
            sfx.gameOver();
            setStatus("over");
          } else {
            sfx.miss();
            ball.current = { x: W / 2, y: H - 60, vx: 2.4 * (Math.random() > 0.5 ? 1 : -1), vy: -2.8 };
          }
          return next;
        });
        if (statusRef.current !== "running") return;
      }

      draw();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [status, draw]);

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    paddleX.current = Math.max(0, Math.min(px - PADDLE_W / 2, W - PADDLE_W));
    if (statusRef.current !== "running") draw();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-[384px] items-center justify-between text-sm">
        <span className="text-white/70">
          Score <span className="font-semibold text-white">{score}</span>
        </span>
        <span className="text-white/70">
          Lives <span className="font-semibold text-[#ff6b64]">{"●".repeat(Math.max(0, lives))}</span>
        </span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="h-auto max-w-full cursor-none touch-none rounded-lg border border-white/15 bg-[#101014]"
          onPointerMove={onPointerMove}
        />
        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/60 backdrop-blur-sm">
            {status === "over" && <p className="text-lg font-semibold text-white">Game Over</p>}
            {status === "won" && <p className="text-lg font-semibold text-[#34d058]">You Win</p>}
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-5 py-1.5 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={reset}
            >
              {status === "idle" ? "Start" : "Play Again"}
            </button>
            <p className="text-xs text-white/50">Move the mouse to steer the paddle</p>
          </div>
        )}
      </div>
    </div>
  );
}
