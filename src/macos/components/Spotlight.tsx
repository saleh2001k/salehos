import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sfx } from "../lib/sfx";

export interface SpotlightItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action: () => void;
}

interface SpotlightProps {
  items: SpotlightItem[];
  onClose: () => void;
}

export function Spotlight({ items, onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);

  const run = (item: SpotlightItem) => {
    sfx.open();
    item.action();
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") onClose();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter" && results[index]) run(results[index]);
  };

  return (
    <motion.div
      className="absolute inset-0 z-[960] bg-black/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      onClick={onClose}
    >
      <motion.div
        className="mx-auto mt-[18vh] w-[min(560px,90vw)] overflow-hidden rounded-xl border border-white/15 bg-[var(--panel)] shadow-2xl backdrop-blur-2xl"
        initial={{ scale: 0.97, y: -8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search size={18} className="shrink-0 text-white/45" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            className="w-full bg-transparent text-lg text-white placeholder-white/35 outline-none"
            aria-label="Spotlight search"
          />
        </div>

        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto p-1.5">
            {results.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                    i === index ? "bg-[#2a7de1] text-[#fff]" : "hover:bg-white/10"
                  }`}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(item)}
                >
                  {item.icon && <span className="h-7 w-7 shrink-0 [&>*]:h-full [&>*]:w-full">{item.icon}</span>}
                  <span className="min-w-0">
                    <span className={`block truncate text-sm ${i === index ? "text-[#fff]" : "text-white"}`}>
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span
                        className={`block truncate text-xs ${
                          i === index ? "text-[#fff]/75" : "text-white/45"
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-white/40">No results for “{query}”</p>
        )}
      </motion.div>
    </motion.div>
  );
}
