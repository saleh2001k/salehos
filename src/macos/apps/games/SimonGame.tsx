import { useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

const PADS = [
  { base: "bg-[#34d058]/35", lit: "bg-[#34d058]", ring: "ring-[#34d058]" },
  { base: "bg-[#ff6b64]/35", lit: "bg-[#ff6b64]", ring: "ring-[#ff6b64]" },
  { base: "bg-[#e8aa42]/35", lit: "bg-[#e8aa42]", ring: "ring-[#e8aa42]" },
  { base: "bg-[#5aa7f2]/35", lit: "bg-[#5aa7f2]", ring: "ring-[#5aa7f2]" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function SimonGame() {
  const [status, setStatus] = useState<"idle" | "showing" | "your-turn" | "over">("idle");
  const [round, setRound] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("simon-best") ?? 0));
  const [lit, setLit] = useState<number | null>(null);

  const sequence = useRef<number[]>([]);
  const progress = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const playback = async (seq: number[]) => {
    setStatus("showing");
    await sleep(550);
    for (const pad of seq) {
      if (!alive.current) return;
      sfx.pad(pad);
      setLit(pad);
      await sleep(380);
      setLit(null);
      await sleep(140);
    }
    if (!alive.current) return;
    progress.current = 0;
    setStatus("your-turn");
  };

  const nextRound = (seq: number[]) => {
    const next = [...seq, Math.floor(Math.random() * 4)];
    sequence.current = next;
    setRound(next.length);
    void playback(next);
  };

  const start = () => {
    sfx.click();
    sequence.current = [];
    setRound(0);
    nextRound([]);
  };

  const press = async (pad: number) => {
    if (status !== "your-turn") return;
    sfx.pad(pad);
    setLit(pad);
    setTimeout(() => setLit(null), 220);

    if (sequence.current[progress.current] !== pad) {
      sfx.gameOver();
      setStatus("over");
      const score = sequence.current.length - 1;
      if (score > best) {
        setBest(score);
        localStorage.setItem("simon-best", String(score));
      }
      return;
    }
    progress.current++;
    if (progress.current === sequence.current.length) {
      await sleep(400);
      if (!alive.current) return;
      nextRound(sequence.current);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-[280px] items-center justify-between text-sm">
        <span className="text-white/70">
          Round <span className="font-semibold text-white">{round}</span>
        </span>
        <span className="text-white/50">
          Best <span className="font-semibold text-[#e8aa42]">{best}</span>
        </span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 gap-2.5">
          {PADS.map((pad, index) => (
            <button
              key={index}
              type="button"
              disabled={status !== "your-turn"}
              aria-label={`Pad ${index + 1}`}
              className={`h-[120px] w-[120px] rounded-2xl transition-all duration-100 ${
                lit === index ? `${pad.lit} ring-2 ${pad.ring} brightness-125` : pad.base
              } ${status === "your-turn" ? "cursor-pointer hover:brightness-110 active:scale-95" : ""}`}
              onClick={() => void press(index)}
            />
          ))}
        </div>

        {(status === "idle" || status === "over") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/60 backdrop-blur-sm">
            {status === "over" && (
              <p className="text-lg font-semibold text-white">
                Round {Math.max(0, sequence.current.length - 1)}
              </p>
            )}
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-5 py-1.5 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={start}
            >
              {status === "idle" ? "Start" : "Play Again"}
            </button>
            <p className="text-xs text-white/50">Watch the pattern, then repeat it</p>
          </div>
        )}
      </div>

      <p className="h-4 text-xs text-white/40">
        {status === "showing" && "Watch…"}
        {status === "your-turn" && "Your turn"}
      </p>
    </div>
  );
}
