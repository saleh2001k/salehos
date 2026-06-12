import { AnimatePresence, motion } from "motion/react";
import {
  BatteryFull,
  Maximize,
  Minimize,
  Search,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppleLogo } from "./AppIcons";
import { settingsStore, useSettings } from "../lib/settings";
import { sfx } from "../lib/sfx";

export interface MenuAction {
  label: string;
  shortcut?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

export type MenuEntry = MenuAction | "separator";

export interface MenuSpec {
  label: string;
  entries: MenuEntry[];
}

function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
}

function Dropdown({ entries, onClose }: { entries: MenuEntry[]; onClose: () => void }) {
  return (
    <motion.div
      className="absolute left-0 top-8 z-10 min-w-56 rounded-lg border border-white/15 bg-[var(--panel)] p-1 shadow-2xl backdrop-blur-2xl"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
    >
      {entries.map((entry, index) =>
        entry === "separator" ? (
          <div key={`sep-${index}`} className="mx-3 my-1 border-t border-white/15" />
        ) : (
          <button
            key={entry.label}
            type="button"
            disabled={entry.disabled}
            className="flex w-full items-center justify-between gap-6 rounded px-3 py-1.5 text-left hover:bg-[#2a7de1] hover:text-[#fff] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit"
            onClick={() => {
              entry.onSelect?.();
              onClose();
            }}
          >
            <span className="flex items-center gap-2">
              {entry.icon}
              {entry.label}
            </span>
            {entry.shortcut && <span className="text-xs text-white/40">{entry.shortcut}</span>}
          </button>
        ),
      )}
    </motion.div>
  );
}

interface MenuBarProps {
  activeApp: string;
  appleEntries: MenuEntry[];
  menus: MenuSpec[];
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onSpotlight: () => void;
}

export function MenuBar({
  activeApp,
  appleEntries,
  menus,
  fullscreen,
  onToggleFullscreen,
  onSpotlight,
}: MenuBarProps) {
  const clock = useClock();
  const { sound } = useSettings();
  // null = closed; "apple" or a menu label = that dropdown is open.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const toggleMute = () => {
    settingsStore.setSound(!sound);
    if (!sound) sfx.click();
  };

  // Real macOS behavior: click opens a menu, then hovering neighbors switches to them.
  const menuButtonProps = (id: string) => ({
    onClick: () => setOpenMenu((value) => (value === id ? null : id)),
    onMouseEnter: () => setOpenMenu((value) => (value !== null ? id : value)),
  });

  return (
    <div ref={barRef} className="absolute inset-x-0 top-0 z-[900] h-7">
      {/* Soft scrim: a gradient that fades out below the bar — no blur, no border. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.28)_40%,transparent_100%)]" />

      <div className="relative flex h-full items-center justify-between px-3 text-[13px] text-white/90">
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              aria-label="Apple menu"
              aria-expanded={openMenu === "apple"}
              className={`flex h-7 items-center rounded px-2 transition-colors ${
                openMenu === "apple" ? "bg-white/20" : "hover:bg-white/10"
              }`}
              {...menuButtonProps("apple")}
            >
              <AppleLogo size={16} />
            </button>
            <AnimatePresence>
              {openMenu === "apple" && (
                <Dropdown entries={appleEntries} onClose={() => setOpenMenu(null)} />
              )}
            </AnimatePresence>
          </div>

          <span className="px-2 font-semibold">{activeApp}</span>

          <div className="hidden md:flex">
            {menus.map((menu) => (
              <div key={menu.label} className="relative">
                <button
                  type="button"
                  aria-expanded={openMenu === menu.label}
                  className={`cursor-default rounded px-2 py-0.5 transition-colors ${
                    openMenu === menu.label ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                  {...menuButtonProps(menu.label)}
                >
                  {menu.label}
                </button>
                <AnimatePresence>
                  {openMenu === menu.label && (
                    <Dropdown entries={menu.entries} onClose={() => setOpenMenu(null)} />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
            className="flex items-center text-white/90 hover:text-white"
            onClick={onToggleFullscreen}
          >
            {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
          <button
            type="button"
            aria-label={sound ? "Mute sounds" : "Unmute sounds"}
            className="flex items-center text-white/90 hover:text-white"
            onClick={toggleMute}
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <BatteryFull size={18} aria-label="Battery" />
          <Wifi size={15} aria-label="Wi-Fi" />
          <button
            type="button"
            aria-label="Spotlight (⌘K)"
            className="flex items-center text-white/90 hover:text-white"
            onClick={onSpotlight}
          >
            <Search size={14} />
          </button>
          <span className="tabular-nums">{clock}</span>
        </div>
      </div>
    </div>
  );
}
