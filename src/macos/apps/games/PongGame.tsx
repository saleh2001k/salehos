import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

const W = 420;
const H = 300;
const PADDLE_H = 64;
const PADDLE_W = 8;
const BALL_R = 5;
const WIN_SCORE = 5;
const AI_SPEED = 3.1;

export function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "running" | "won" | "lost">("idle");
  const [score, setScore] = useState({ you: 0, mac: 0 });

  const playerY = useRef(H / 2 - PADDLE_H / 2);
  const aiY = useRef(H / 2 - PADDLE_H / 2);
  const ball = useRef({ x: W / 2, y: H / 2, vx: 3.4, vy: 1.6 });
  const statusRef = useRef(status);
  statusRef.current = status;

  const serve = (toPlayer: boolean) => {
    ball.current = {
      x: W / 2,
      y: H / 2,
      vx: (toPlayer ? -1 : 1) * 3.4,
      vy: (Math.random() - 0.5) * 3.5,
    };
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // Center line
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#e6e6ea";
    ctx.beginPath();
    ctx.roundRect(10, playerY.current, PADDLE_W, PADDLE_H, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(W - 10 - PADDLE_W, aiY.current, PADDLE_W, PADDLE_H, 4);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const reset = () => {
    sfx.click();
    setScore({ you: 0, mac: 0 });
    playerY.current = H / 2 - PADDLE_H / 2;
    aiY.current = H / 2 - PADDLE_H / 2;
    serve(Math.random() > 0.5);
    setStatus("running");
  };

  useEffect(() => {
    draw();
    if (status !== "running") return;

    let raf = 0;
    const step = () => {
      const b = ball.current;
      b.x += b.vx;
      b.y += b.vy;

      if (b.y < BALL_R || b.y > H - BALL_R) {
        b.vy *= -1;
        b.y = Math.max(BALL_R, Math.min(b.y, H - BALL_R));
      }

      // AI tracks the ball with a speed cap so it stays beatable.
      const target = b.y - PADDLE_H / 2;
      const delta = target - aiY.current;
      aiY.current += Math.max(-AI_SPEED, Math.min(AI_SPEED, delta));
      aiY.current = Math.max(0, Math.min(aiY.current, H - PADDLE_H));

      // Player paddle
      if (
        b.vx < 0 &&
        b.x < 10 + PADDLE_W + BALL_R &&
        b.x > 10 &&
        b.y > playerY.current - BALL_R &&
        b.y < playerY.current + PADDLE_H + BALL_R
      ) {
        const hit = (b.y - playerY.current - PADDLE_H / 2) / (PADDLE_H / 2);
        const speed = Math.min(8, Math.hypot(b.vx, b.vy) * 1.04);
        const angle = hit * (Math.PI / 3.2);
        b.vx = Math.abs(speed * Math.cos(angle));
        b.vy = speed * Math.sin(angle);
        sfx.pong();
      }

      // AI paddle
      if (
        b.vx > 0 &&
        b.x > W - 10 - PADDLE_W - BALL_R &&
        b.x < W - 10 &&
        b.y > aiY.current - BALL_R &&
        b.y < aiY.current + PADDLE_H + BALL_R
      ) {
        const hit = (b.y - aiY.current - PADDLE_H / 2) / (PADDLE_H / 2);
        const speed = Math.min(8, Math.hypot(b.vx, b.vy) * 1.04);
        const angle = hit * (Math.PI / 3.2);
        b.vx = -Math.abs(speed * Math.cos(angle));
        b.vy = speed * Math.sin(angle);
        sfx.pong();
      }

      // Scoring
      if (b.x < -BALL_R || b.x > W + BALL_R) {
        const youScored = b.x > W;
        sfx.point();
        setScore((current) => {
          const next = youScored
            ? { ...current, you: current.you + 1 }
            : { ...current, mac: current.mac + 1 };
          if (next.you >= WIN_SCORE) {
            sfx.win();
            setStatus("won");
          } else if (next.mac >= WIN_SCORE) {
            sfx.gameOver();
            setStatus("lost");
          }
          return next;
        });
        serve(!youScored);
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
    const py = ((event.clientY - rect.top) / rect.height) * H;
    playerY.current = Math.max(0, Math.min(py - PADDLE_H / 2, H - PADDLE_H));
    if (statusRef.current !== "running") draw();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-[420px] items-center justify-center gap-8 text-sm">
        <span className="text-white/70">
          You <span className="font-semibold text-[#34d058]">{score.you}</span>
        </span>
        <span className="text-xs text-white/40">first to {WIN_SCORE}</span>
        <span className="text-white/70">
          Mac <span className="font-semibold text-[#ff6b64]">{score.mac}</span>
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
            {status === "won" && <p className="text-lg font-semibold text-[#34d058]">You Win</p>}
            {status === "lost" && <p className="text-lg font-semibold text-white">The Mac Wins</p>}
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-5 py-1.5 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={reset}
            >
              {status === "idle" ? "Start" : "Play Again"}
            </button>
            <p className="text-xs text-white/50">Move the mouse to steer your paddle</p>
          </div>
        )}
      </div>
    </div>
  );
}
