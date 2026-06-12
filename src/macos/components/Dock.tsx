import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Trash2 } from "lucide-react";
import { useRef, type ReactNode } from "react";

export interface DockItemSpec {
  id: string;
  label: string;
  icon: ReactNode;
  running?: boolean;
  href?: string;
  onClick?: () => void;
}

const BASE = 52;
const PEAK = 84;
const RANGE = 140;
/** Pill height never changes — icons magnify upward and outward, like the real dock. */
const PILL_HEIGHT = BASE + 24;

interface DockItemProps {
  item: DockItemSpec;
  mouseX: MotionValue<number>;
  onContextMenu?: (item: DockItemSpec, x: number, y: number) => void;
}

function DockItem({ item, mouseX, onContextMenu }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });
  const sizeRaw = useTransform(
    distance,
    [-RANGE, 0, RANGE],
    [BASE, PEAK, BASE],
  );
  const size = useSpring(sizeRaw, { mass: 0.1, stiffness: 200, damping: 14 });

  // The slot keeps a constant height (BASE) and only its width animates, so the
  // dock pill never grows vertically; the icon itself overflows upward.
  const inner = (
    <motion.div
      ref={ref}
      style={{ width: size, height: BASE }}
      className="relative flex items-end justify-center"
    >
      <motion.div
        style={{ width: size, height: size }}
        className="group/icon relative shrink-0"
      >
        <div className="h-full w-full transition-transform active:scale-90 [&>*]:h-full [&>*]:w-full">
          {item.icon}
        </div>
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-[var(--panel)] px-2.5 py-1 text-xs text-white opacity-0 backdrop-blur-xl transition-opacity group-hover/icon:opacity-100">
          {item.label}
        </span>
      </motion.div>
    </motion.div>
  );

  const handleContextMenu = (event: React.MouseEvent) => {
    if (!onContextMenu) return;
    event.preventDefault();
    onContextMenu(item, event.clientX, event.clientY);
  };

  return (
    <div
      className="flex flex-col items-center gap-1"
      onContextMenu={handleContextMenu}
    >
      {item.href ? (
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
        >
          {inner}
        </a>
      ) : (
        <button type="button" aria-label={item.label} onClick={item.onClick}>
          {inner}
        </button>
      )}
      <span
        className={`h-1 w-1 rounded-full bg-white/80 ${item.running ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

interface DockProps {
  items: DockItemSpec[];
  onItemContextMenu?: (item: DockItemSpec, x: number, y: number) => void;
  onTrashContextMenu?: (x: number, y: number) => void;
  trashFull?: boolean;
}

export function Dock({
  items,
  onItemContextMenu,
  onTrashContextMenu,
  trashFull,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="absolute inset-x-0 bottom-2 z-[900] flex justify-center">
      {/* Frosted pill: plain backdrop blur. The blur region is the pill's own
          box, so magnified icons can overflow above it freely. */}
      <div
        className="flex max-w-[calc(100vw-12px)] items-end gap-2.5 rounded-[28px] bg-white/10 px-3 pb-2 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.1),0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-[1.8]"
        style={{ height: PILL_HEIGHT }}
        onMouseMove={(event) => mouseX.set(event.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            mouseX={mouseX}
            onContextMenu={onItemContextMenu}
          />
        ))}

        <div className="mx-1 h-12 w-px self-center bg-white/20" />

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            className="flex h-[52px] w-[52px] items-center justify-center"
            aria-label={trashFull ? "Trash (full)" : "Trash (empty)"}
            onContextMenu={(event) => {
              event.preventDefault();
              onTrashContextMenu?.(event.clientX, event.clientY);
            }}
          >
            {/* Inner tile at ~82% so it matches the Apple icon grid of the PNGs */}
            <span className="relative flex h-[43px] w-[43px] items-center justify-center rounded-[22%] bg-[linear-gradient(180deg,#a8aab2_0%,#7e8089_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
              <Trash2 size={22} className="text-white/90" />
              {trashFull && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-white/85 shadow" />
              )}
            </span>
          </button>
          <span className="h-1 w-1" />
        </div>
      </div>
    </div>
  );
}
