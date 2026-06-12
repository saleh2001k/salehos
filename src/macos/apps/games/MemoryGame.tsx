import {
  Cloud,
  Cpu,
  Gamepad2,
  Heart,
  Music,
  Rocket,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

const ICONS: { id: string; Icon: LucideIcon; color: string }[] = [
  { id: "star", Icon: Star, color: "#e8aa42" },
  { id: "heart", Icon: Heart, color: "#ff6b64" },
  { id: "zap", Icon: Zap, color: "#f5d90a" },
  { id: "cloud", Icon: Cloud, color: "#5aa7f2" },
  { id: "music", Icon: Music, color: "#b07ef0" },
  { id: "rocket", Icon: Rocket, color: "#34d058" },
  { id: "cpu", Icon: Cpu, color: "#8f9aab" },
  { id: "game", Icon: Gamepad2, color: "#f08a5d" },
];

interface Card {
  key: number;
  iconId: string;
  matched: boolean;
}

function shuffle(): Card[] {
  const deck = [...ICONS, ...ICONS].map((icon, index) => ({
    key: index,
    iconId: icon.id,
    matched: false,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(shuffle);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const lockRef = useRef(false);

  const allMatched = cards.every((card) => card.matched);

  useEffect(() => {
    if (allMatched && moves > 0) sfx.win();
  }, [allMatched, moves]);

  const flip = (key: number) => {
    if (lockRef.current) return;
    const card = cards.find((c) => c.key === key)!;
    if (card.matched || flipped.includes(key)) return;

    sfx.flip();
    const nextFlipped = [...flipped, key];
    setFlipped(nextFlipped);
    if (nextFlipped.length < 2) return;

    setMoves((value) => value + 1);
    const [a, b] = nextFlipped.map((k) => cards.find((c) => c.key === k)!);
    if (a!.iconId === b!.iconId) {
      sfx.match();
      setCards((current) =>
        current.map((c) => (nextFlipped.includes(c.key) ? { ...c, matched: true } : c)),
      );
      setFlipped([]);
    } else {
      lockRef.current = true;
      setTimeout(() => {
        sfx.miss();
        setFlipped([]);
        lockRef.current = false;
      }, 750);
    }
  };

  const reset = () => {
    sfx.click();
    setCards(shuffle());
    setFlipped([]);
    setMoves(0);
    lockRef.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-[332px] items-center justify-between text-sm">
        <span className="text-white/70">
          Moves <span className="font-semibold text-white">{moves}</span>
        </span>
        <button
          type="button"
          className="rounded-full border border-white/20 px-3 py-0.5 text-xs text-white/70 hover:border-white/40"
          onClick={reset}
        >
          Shuffle
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const icon = ICONS.find((entry) => entry.id === card.iconId)!;
          const faceUp = card.matched || flipped.includes(card.key);
          return (
            <button
              key={card.key}
              type="button"
              aria-label={faceUp ? icon.id : "Hidden card"}
              className="h-[76px] w-[76px] [perspective:400px]"
              onClick={() => flip(card.key)}
            >
              <div
                className="relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
                style={{ transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <div className="absolute inset-0 rounded-lg border border-white/15 bg-[linear-gradient(160deg,#2a3550_0%,#1a2030_100%)] [backface-visibility:hidden]" />
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-lg border [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    card.matched ? "border-white/30 bg-white/15" : "border-white/15 bg-white/8"
                  }`}
                >
                  <icon.Icon size={30} style={{ color: icon.color }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="h-6">
        {allMatched && moves > 0 && (
          <p className="text-sm font-medium text-[#34d058]">Solved in {moves} moves.</p>
        )}
      </div>
    </div>
  );
}
