import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

type Board = number[][]; // 4x4, 0 = empty

const TILE_STYLE: Record<number, string> = {
  2: "bg-[#3a3a42] text-white/85",
  4: "bg-[#46424e] text-white/90",
  8: "bg-[#e8aa42] text-[#1b1410]",
  16: "bg-[#f08a5d] text-[#1b1410]",
  32: "bg-[#ff6b64] text-white",
  64: "bg-[#e84545] text-white",
  128: "bg-[#5aa7f2] text-white",
  256: "bg-[#3b8af0] text-white",
  512: "bg-[#2a7de1] text-white",
  1024: "bg-[#b07ef0] text-white",
  2048: "bg-[#34d058] text-[#0c1f10]",
};

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function spawn(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => row.forEach((cell, c) => cell === 0 && empty.push([r, c])));
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]!;
  const next = board.map((row) => [...row]);
  next[r]![c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

/** Slide+merge one row toward the left. Returns the new row and points gained. */
function slideRow(row: number[]): { row: number[]; gained: number; moved: boolean } {
  const tiles = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      out.push(tiles[i]! * 2);
      gained += tiles[i]! * 2;
      i++;
    } else {
      out.push(tiles[i]!);
    }
  }
  while (out.length < 4) out.push(0);
  return { row: out, gained, moved: out.some((v, i) => v !== row[i]) };
}

function transpose(board: Board): Board {
  return board[0]!.map((_, c) => board.map((row) => row[c]!));
}

function applyMove(board: Board, dir: "left" | "right" | "up" | "down") {
  let work = dir === "up" || dir === "down" ? transpose(board) : board.map((r) => [...r]);
  const reverse = dir === "right" || dir === "down";
  let gained = 0;
  let moved = false;
  work = work.map((row) => {
    const input = reverse ? [...row].reverse() : row;
    const result = slideRow(input);
    gained += result.gained;
    moved = moved || result.moved;
    return reverse ? [...result.row].reverse() : result.row;
  });
  if (dir === "up" || dir === "down") work = transpose(work);
  return { board: work, gained, moved };
}

function canMove(board: Board): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = board[r]![c]!;
      if (v === 0) return true;
      if (c < 3 && board[r]![c + 1] === v) return true;
      if (r < 3 && board[r + 1]![c] === v) return true;
    }
  }
  return false;
}

const KEY_DIRS: Record<string, "left" | "right" | "up" | "down"> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};

export function Game2048() {
  const [board, setBoard] = useState<Board>(() => spawn(spawn(emptyBoard())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("2048-best") ?? 0));
  const [over, setOver] = useState(false);
  const wonRef = useRef(false);

  const move = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (over) return;
      setBoard((current) => {
        const result = applyMove(current, dir);
        if (!result.moved) return current;
        if (result.gained > 0) sfx.match();
        else sfx.flip();
        setScore((value) => value + result.gained);
        const next = spawn(result.board);
        if (!wonRef.current && next.some((row) => row.some((v) => v >= 2048))) {
          wonRef.current = true;
          sfx.win();
        }
        if (!canMove(next)) {
          sfx.gameOver();
          setOver(true);
        }
        return next;
      });
    },
    [over],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dir = KEY_DIRS[event.key];
      if (!dir) return;
      event.preventDefault();
      move(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem("2048-best", String(score));
    }
  }, [score, best]);

  const reset = () => {
    sfx.click();
    setBoard(spawn(spawn(emptyBoard())));
    setScore(0);
    setOver(false);
    wonRef.current = false;
  };

  // Touch swipes move the board (mobile-first control).
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    touchRef.current = { x: event.touches[0]!.clientX, y: event.touches[0]!.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const dx = event.changedTouches[0]!.clientX - start.x;
    const dy = event.changedTouches[0]!.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-[332px] items-center justify-between text-sm">
        <span className="text-white/70">
          Score <span className="font-semibold text-white">{score}</span>
        </span>
        <span className="text-white/50">
          Best <span className="font-semibold text-[#e8aa42]">{best}</span>
        </span>
        <button
          type="button"
          className="rounded-full border border-white/20 px-3 py-0.5 text-xs text-white/70 hover:border-white/40"
          onClick={reset}
        >
          New Game
        </button>
      </div>

      <div
        className="relative rounded-xl bg-white/5 p-2"
        style={{ touchAction: "none" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2">
          {board.flatMap((row, r) =>
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-white/5"
              >
                {value > 0 && (
                  <span
                    key={`${r}-${c}-${value}`}
                    className={`flex h-full w-full origin-center animate-[pop_0.15s_ease-out] items-center justify-center rounded-lg font-bold ${
                      value >= 1024 ? "text-xl" : value >= 128 ? "text-2xl" : "text-3xl"
                    } ${TILE_STYLE[value] ?? "bg-[#34d058] text-[#0c1f10]"}`}
                  >
                    {value}
                  </span>
                )}
              </div>
            )),
          )}
        </div>

        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/65 backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">No more moves</p>
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-5 py-1.5 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={reset}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-white/40">Arrow keys or WASD — reach 2048</p>
    </div>
  );
}
