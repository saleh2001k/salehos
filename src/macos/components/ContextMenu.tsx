import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type ContextMenuItem =
  | "separator"
  | {
      label: string;
      icon?: ReactNode;
      danger?: boolean;
      disabled?: boolean;
      onSelect: () => void;
    };

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

export function ContextMenu({ menu, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: menu.x, y: menu.y });

  // Keep the menu inside the viewport.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos({
      x: Math.min(menu.x, window.innerWidth - width - 8),
      y: Math.min(menu.y, window.innerHeight - height - 8),
    });
  }, [menu]);

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      className="fixed z-[1100] min-w-52 rounded-lg border border-white/15 bg-[var(--panel)] p-1 text-[13px] text-white/90 shadow-2xl backdrop-blur-2xl"
      style={{ left: pos.x, top: pos.y }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {menu.items.map((item, index) =>
        item === "separator" ? (
          <div key={`sep-${index}`} className="mx-3 my-1 border-t border-white/15" />
        ) : (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left disabled:opacity-40 ${
              item.danger ? "text-[#ff6b64] hover:bg-[#c0392b] hover:text-[#fff]" : "hover:bg-[#2a7de1] hover:text-[#fff]"
            }`}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            {item.icon && <span className="flex w-4 justify-center">{item.icon}</span>}
            {item.label}
          </button>
        ),
      )}
    </motion.div>
  );
}
