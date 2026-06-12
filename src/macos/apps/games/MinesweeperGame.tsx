import { Bomb, Flag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

const SIZE = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

const NUMBER_COLORS = [
  "",
  "text-[#5aa7f2]",
  "text-[#34d058]",
  "text-[#ff6b64]",
  "text-[#b07ef0]",
  "text-[#e8aa42]",
  "text-[#3fc6f2]",
  "text-white",
  "text-white/60",
];

function freshBoard(): Cell[] {
  return Array.from({ length: SIZE * SIZE }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));
}

function neighbors(index: number): number[] {
  const r = Math.floor(index / SIZE);
  const c = index % SIZE;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc);
    }
  }
  return out;
}

/** Mines are placed on first reveal so the first click is always safe. */
function plantMines(board: Cell[], safe: number): Cell[] {
  const next = board.map((cell) => ({ ...cell }));
  const exclusion = new Set([safe, ...neighbors(safe)]);
  let planted = 0;
  while (planted < MINES) {
    const i = Math.floor(Math.random() * SIZE * SIZE);
    if (next[i]!.mine || exclusion.has(i)) continue;
    next[i]!.mine = true;
    planted++;
  }
  for (let i = 0; i < next.length; i++) {
    next[i]!.adjacent = neighbors(i).filter((n) => next[n]!.mine).length;
  }
  return next;
}

function floodReveal(board: Cell[], start: number): Cell[] {
  const next = board.map((cell) => ({ ...cell }));
  const queue = [start];
  while (queue.length) {
    const i = queue.pop()!;
    const cell = next[i]!;
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      for (const n of neighbors(i)) if (!next[n]!.revealed) queue.push(n);
    }
  }
  return next;
}

export function MinesweeperGame() {
  const [board, setBoard] = useState<Cell[]>(freshBoard);
  const [status, setStatus] = useState<"fresh" | "running" | "over" | "won">("fresh");
  const [seconds, setSeconds] = useState(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const flagsLeft = MINES - board.filter((cell) => cell.flagged).length;

  const checkWin = (next: Cell[]) => {
    if (next.every((cell) => cell.mine || cell.revealed)) {
      sfx.win();
      setStatus("won");
      return true;
    }
    return false;
  };

  const reveal = (index: number) => {
    if (status === "over" || status === "won") return;
    let working = board;
    if (status === "fresh") {
      working = plantMines(board, index);
      setStatus("running");
    }
    const cell = working[index]!;
    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      sfx.gameOver();
      setStatus("over");
      setBoard(working.map((c) => (c.mine ? { ...c, revealed: true } : c)));
      return;
    }
    sfx.flip();
    const next = floodReveal(working, index);
    setBoard(next);
    checkWin(next);
  };

  const toggleFlag = (index: number) => {
    if (status === "over" || status === "won" || status === "fresh") return;
    const cell = board[index]!;
    if (cell.revealed) return;
    sfx.click();
    setBoard(board.map((c, i) => (i === index ? { ...c, flagged: !c.flagged } : c)));
  };

  const flag = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    toggleFlag(index);
  };

  // Touch: long-press a cell to flag it.
  const longPress = useRef<{ timer: ReturnType<typeof setTimeout> | null; fired: boolean }>({
    timer: null,
    fired: false,
  });
  const onCellTouchStart = (index: number) => {
    longPress.current.fired = false;
    longPress.current.timer = setTimeout(() => {
      longPress.current.fired = true;
      if (navigator.vibrate) navigator.vibrate(10);
      toggleFlag(index);
    }, 420);
  };
  const onCellTouchEnd = () => {
    if (longPress.current.timer) clearTimeout(longPress.current.timer);
    longPress.current.timer = null;
  };
  const guardedReveal = (index: number) => {
    if (longPress.current.fired) {
      longPress.current.fired = false;
      return;
    }
    reveal(index);
  };

  const reset = () => {
    sfx.click();
    setBoard(freshBoard());
    setStatus("fresh");
    setSeconds(0);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-[296px] items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-white/70">
          <Flag size={13} className="text-[#ff6b64]" />
          <span className="font-semibold tabular-nums text-white">{flagsLeft}</span>
        </span>
        <button
          type="button"
          className="rounded-full border border-white/20 px-3 py-0.5 text-xs text-white/70 hover:border-white/40"
          onClick={reset}
        >
          New Game
        </button>
        <span className="font-semibold tabular-nums text-white/70">{seconds}s</span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-9 gap-[3px] rounded-lg bg-white/5 p-[3px]">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              className={`flex h-[30px] w-[30px] items-center justify-center rounded text-[13px] font-bold ${
                cell.revealed
                  ? cell.mine
                    ? "bg-[#c0392b]"
                    : "bg-white/5"
                  : "bg-[linear-gradient(160deg,#3a4258_0%,#262d40_100%)] hover:brightness-125"
              }`}
              onClick={() => guardedReveal(index)}
              onContextMenu={(event) => flag(index, event)}
              onTouchStart={() => onCellTouchStart(index)}
              onTouchEnd={onCellTouchEnd}
              onTouchMove={onCellTouchEnd}
            >
              {cell.revealed && cell.mine && <Bomb size={14} className="text-white" />}
              {cell.revealed && !cell.mine && cell.adjacent > 0 && (
                <span className={NUMBER_COLORS[cell.adjacent]}>{cell.adjacent}</span>
              )}
              {!cell.revealed && cell.flagged && <Flag size={13} className="text-[#ff6b64]" />}
            </button>
          ))}
        </div>

        {(status === "over" || status === "won") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/60 backdrop-blur-sm">
            <p className={`text-lg font-semibold ${status === "won" ? "text-[#34d058]" : "text-white"}`}>
              {status === "won" ? `Cleared in ${seconds}s` : "Boom."}
            </p>
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-5 py-1.5 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={reset}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-white/40">Tap to reveal — right-click or long-press to flag</p>
    </div>
  );
}
