import { useState } from "react";
import { sfx } from "../../lib/sfx";

type Cell = "X" | "O" | null;

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function winnerOf(board: Cell[]): { player: "X" | "O"; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a]!, line };
    }
  }
  return null;
}

/** Decent AI: win if possible, block if needed, then center > corner > random. */
function aiMove(board: Cell[]): number {
  const empty = board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i >= 0);
  for (const mark of ["O", "X"] as const) {
    for (const i of empty) {
      const copy = [...board];
      copy[i] = mark;
      if (winnerOf(copy)?.player === mark) return i;
    }
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]!;
  return empty[Math.floor(Math.random() * empty.length)]!;
}

export function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [thinking, setThinking] = useState(false);
  const [tally, setTally] = useState({ you: 0, mac: 0, draws: 0 });

  const win = winnerOf(board);
  const full = board.every((cell) => cell !== null);
  const done = Boolean(win) || full;

  const play = (index: number) => {
    if (done || thinking || board[index]) return;
    sfx.place();
    const next = [...board];
    next[index] = "X";

    const afterYou = winnerOf(next);
    if (afterYou || next.every((c) => c !== null)) {
      setBoard(next);
      settle(afterYou?.player ?? null);
      return;
    }

    setBoard(next);
    setThinking(true);
    setTimeout(() => {
      const move = aiMove(next);
      next[move] = "O";
      sfx.place();
      setBoard([...next]);
      setThinking(false);
      const after = winnerOf(next);
      if (after || next.every((c) => c !== null)) settle(after?.player ?? null);
    }, 350);
  };

  const settle = (player: "X" | "O" | null) => {
    if (player === "X") {
      sfx.win();
      setTally((t) => ({ ...t, you: t.you + 1 }));
    } else if (player === "O") {
      sfx.gameOver();
      setTally((t) => ({ ...t, mac: t.mac + 1 }));
    } else {
      sfx.miss();
      setTally((t) => ({ ...t, draws: t.draws + 1 }));
    }
  };

  const reset = () => {
    sfx.click();
    setBoard(Array(9).fill(null));
    setThinking(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-5 text-sm">
        <span className="text-white/70">
          You <span className="font-semibold text-[#34d058]">{tally.you}</span>
        </span>
        <span className="text-white/70">
          Mac <span className="font-semibold text-[#ff6b64]">{tally.mac}</span>
        </span>
        <span className="text-white/50">
          Draws <span className="font-semibold text-white/80">{tally.draws}</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {board.map((cell, index) => {
          const inWinLine = win?.line.includes(index);
          return (
            <button
              key={index}
              type="button"
              disabled={done || thinking || Boolean(cell)}
              className={`flex h-20 w-20 items-center justify-center rounded-lg border text-3xl font-bold transition-colors ${
                inWinLine
                  ? "border-[#34d058]/60 bg-[#34d058]/15"
                  : "border-white/15 bg-white/5 enabled:hover:bg-white/10"
              }`}
              onClick={() => play(index)}
            >
              <span className={cell === "X" ? "text-[#34d058]" : "text-[#ff6b64]"}>{cell}</span>
            </button>
          );
        })}
      </div>

      <div className="flex h-8 items-center gap-3">
        {done ? (
          <>
            <p className="text-sm text-white/80">
              {win ? (win.player === "X" ? "You win." : "The Mac wins.") : "Draw."}
            </p>
            <button
              type="button"
              className="rounded-full bg-[#2a7de1] px-4 py-1 text-sm font-medium text-white hover:bg-[#3b8af0]"
              onClick={reset}
            >
              Rematch
            </button>
          </>
        ) : (
          <p className="text-xs text-white/40">
            {thinking ? "Mac is thinking…" : "You are X — tap a square"}
          </p>
        )}
      </div>
    </div>
  );
}
