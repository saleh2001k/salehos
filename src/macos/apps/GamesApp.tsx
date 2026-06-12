import {
  Blocks,
  Bomb,
  Brain,
  ChevronLeft,
  Gamepad2,
  Gem,
  Grid3x3,
  Hash,
  Lightbulb,
  MoveHorizontal,
  Skull,
  Users,
  Worm,
  type LucideIcon,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { sfx } from "../lib/sfx";
import { BreakoutGame } from "./games/BreakoutGame";
import { DosGame } from "./games/DoomGame";
import { Game2048 } from "./games/Game2048";
import { MemoryGame } from "./games/MemoryGame";
import { MinesweeperGame } from "./games/MinesweeperGame";
import { PongGame } from "./games/PongGame";
import { SimonGame } from "./games/SimonGame";
import { SnakeGame } from "./games/SnakeGame";
import { TicTacToeGame } from "./games/TicTacToeGame";
import { TouchControls, useCoarsePointer } from "./games/TouchControls";

type GameId =
  | "doom"
  | "prince"
  | "crystal-caves"
  | "lemmings"
  | "snake"
  | "breakout"
  | "2048"
  | "minesweeper"
  | "pong"
  | "simon"
  | "tictactoe"
  | "memory";

/** Games that run inside js-dos (full-window iframe, not the centered island). */
const DOS_GAMES: Partial<Record<GameId, string>> = {
  doom: "doom",
  prince: "prince",
  "crystal-caves": "crystal-caves",
  lemmings: "lemmings",
};

const GAMES: { id: GameId; name: string; blurb: string; Icon: LucideIcon; color: string }[] = [
  {
    id: "doom",
    name: "DOOM",
    blurb: "The 1993 shareware classic. Rip and tear.",
    Icon: Skull,
    color: "#e84545",
  },
  {
    id: "prince",
    name: "Prince of Persia",
    blurb: "1989. One hour to save the princess.",
    Icon: Gamepad2,
    color: "#e8aa42",
  },
  {
    id: "crystal-caves",
    name: "Crystal Caves",
    blurb: "Apogee platformer — jump, grab gems, mind the spikes.",
    Icon: Gem,
    color: "#3fc6f2",
  },
  {
    id: "lemmings",
    name: "Lemmings 2",
    blurb: "The Tribes. Save the green-haired fools from themselves.",
    Icon: Users,
    color: "#34d058",
  },
  {
    id: "snake",
    name: "Snake",
    blurb: "Eat, grow, speed up. Do not bite yourself.",
    Icon: Worm,
    color: "#34d058",
  },
  {
    id: "breakout",
    name: "Breakout",
    blurb: "Smash every brick. Three lives, rising speed.",
    Icon: Blocks,
    color: "#f08a5d",
  },
  {
    id: "2048",
    name: "2048",
    blurb: "Slide, merge, double. Reach the green tile.",
    Icon: Hash,
    color: "#e8aa42",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    blurb: "Ten mines, one wrong click. Flag carefully.",
    Icon: Bomb,
    color: "#ff6b64",
  },
  {
    id: "pong",
    name: "Pong",
    blurb: "First to five against the Mac's paddle.",
    Icon: MoveHorizontal,
    color: "#3fc6f2",
  },
  {
    id: "simon",
    name: "Simon",
    blurb: "Four pads, one growing melody. Repeat it.",
    Icon: Lightbulb,
    color: "#f5d90a",
  },
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    blurb: "You versus the Mac. The Mac blocks.",
    Icon: Grid3x3,
    color: "#5aa7f2",
  },
  {
    id: "memory",
    name: "Memory Match",
    blurb: "Sixteen cards, eight pairs, one brain.",
    Icon: Brain,
    color: "#b07ef0",
  },
];

export function GamesApp() {
  const [game, setGame] = useState<GameId | null>(null);
  const coarse = useCoarsePointer();
  const current = GAMES.find((entry) => entry.id === game);
  // Keyboard-driven games get an on-screen controller on touch devices.
  const needsPad = current && ["snake", "2048"].includes(current.id);

  if (current) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm text-[#5aa7f2] hover:bg-white/10"
            onClick={() => {
              sfx.click();
              setGame(null);
            }}
          >
            <ChevronLeft size={15} />
            Games
          </button>
          <span className="text-[13px] font-semibold text-white/85">{current.name}</span>
        </div>
        {DOS_GAMES[current.id] ? (
          <div className="min-h-0 flex-1">
            <DosGame bundle={DOS_GAMES[current.id]!} />
          </div>
        ) : (
        <div className="flex min-h-0 flex-1 overflow-auto p-2 sm:p-5">
          {/* m-auto centers the board; force-dark keeps boards/overlays dark in
              light mode, sitting on their own dark island. */}
          <div className="force-dark m-auto w-full max-w-fit rounded-2xl bg-[#131318]/90 p-3 sm:p-5">
            {game === "snake" && <SnakeGame />}
            {game === "breakout" && <BreakoutGame />}
            {game === "2048" && <Game2048 />}
            {game === "minesweeper" && <MinesweeperGame />}
            {game === "pong" && <PongGame />}
            {game === "simon" && <SimonGame />}
            {game === "tictactoe" && <TicTacToeGame />}
            {game === "memory" && <MemoryGame />}
            {coarse && needsPad && <TouchControls />}
          </div>
        </div>
        )}
      </div>
    );
  }

  return (
    <div className="force-dark h-full overflow-y-auto bg-[linear-gradient(180deg,#15151c_0%,#0d0d12_100%)]">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pb-5 pt-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#e84545]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 top-6 h-32 w-32 rounded-full bg-[#2a7de1]/20 blur-3xl" />
        <h2 className="relative font-display text-2xl font-semibold text-white">Arcade</h2>
        <p className="relative mt-1 text-[13px] text-white/55">
          {GAMES.length} games — four DOS classics and eight homemade. Sound on.
        </p>
      </div>

      <div className="grid gap-3 px-5 pb-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map(({ id, name, blurb, Icon, color }) => (
          <button
            key={id}
            type="button"
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
            onClick={() => {
              sfx.open();
              setGame(id);
            }}
          >
            <GameCover id={id} color={color} Icon={Icon} />
            <span className="block p-3.5">
              <span className="block font-medium text-white">{name}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-white/55">{blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Real in-game screenshot when available, tinted glyph as fallback. */
function GameCover({
  id,
  color,
  Icon,
}: {
  id: GameId;
  color: string;
  Icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="relative block aspect-[16/10] w-full overflow-hidden"
      style={{ background: `linear-gradient(150deg, ${color}30 0%, #101016 85%)` }}
    >
      {!failed ? (
        <img
          src={`/games/${id}.png`}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon size={36} style={{ color }} />
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.45)_100%)]" />
    </span>
  );
}
