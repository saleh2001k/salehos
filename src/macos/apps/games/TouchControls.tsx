import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

/** True on touch-first devices — when on-screen controls should appear. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const onChange = (event: MediaQueryListEvent) => setCoarse(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return coarse;
}

function press(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

const PAD = "flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-white/85 active:bg-white/25";

/** On-screen D-pad + action button for keyboard-driven games. */
export function TouchControls({ actionLabel = "A" }: { actionLabel?: string }) {
  return (
    <div className="mt-4 flex w-full items-center justify-between px-2" style={{ touchAction: "manipulation" }}>
      <div className="grid grid-cols-3 gap-1">
        <span />
        <button type="button" aria-label="Up" className={PAD} onPointerDown={() => press("ArrowUp")}>
          <ChevronUp size={20} />
        </button>
        <span />
        <button type="button" aria-label="Left" className={PAD} onPointerDown={() => press("ArrowLeft")}>
          <ChevronLeft size={20} />
        </button>
        <button type="button" aria-label="Down" className={PAD} onPointerDown={() => press("ArrowDown")}>
          <ChevronDown size={20} />
        </button>
        <button type="button" aria-label="Right" className={PAD} onPointerDown={() => press("ArrowRight")}>
          <ChevronRight size={20} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Action"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a7de1]/85 text-base font-bold text-[#fff] active:bg-[#3b8af0]"
        onPointerDown={() => press("Enter")}
      >
        {actionLabel}
      </button>
    </div>
  );
}
