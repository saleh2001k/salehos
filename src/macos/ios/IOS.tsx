import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  BatteryFull,
  Briefcase,
  ChevronDown,
  FileText,
  FolderOpen,
  GraduationCap,
  Maximize,
  Minimize,
  Search,
  Send,
  Wifi,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { site } from "../../data/content";
import { AboutApp } from "../apps/AboutApp";
import { ContactApp } from "../apps/ContactApp";
import { FinderApp, type FinderSection } from "../apps/FinderApp";
import { GamesApp } from "../apps/GamesApp";
import { PreviewApp } from "../apps/PreviewApp";
import { SafariApp } from "../apps/SafariApp";
import { SettingsApp } from "../apps/SettingsApp";
import { TerminalApp } from "../apps/TerminalApp";
import { TextEditApp } from "../apps/TextEditApp";
import { WelcomeApp } from "../apps/WelcomeApp";
import {
  ArcadeIcon,
  ContactsIcon,
  FinderIcon,
  GithubIcon,
  LinkedinIcon,
  XIcon,
  MailIcon,
  PhoneIcon,
  PreviewIcon,
  SafariIcon,
  SettingsIcon,
  TerminalIcon,
  TextFileGlyph,
} from "../components/AppIcons";
import { BootScreen } from "../components/BootScreen";
import { fs } from "../lib/fs";
import { useSettings, useWallpaperShuffle } from "../lib/settings";
import { WALLPAPERS, wallpaperStyle } from "../lib/wallpapers";
import { sfx } from "../lib/sfx";

const WELCOME_KEY = "macos-welcomed";

type IosAppId =
  | "safari"
  | "finder"
  | "terminal"
  | "games"
  | "preview"
  | "contact"
  | "settings"
  | "about"
  | "welcome"
  | "textedit";

interface AppSpec {
  id: IosAppId;
  label: string;
  icon: ReactNode;
}

interface LinkSpec {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

const TEL = `tel:${site.phone.replace(/\s+/g, "")}`;

const GRID_APPS: AppSpec[] = [
  { id: "finder", label: "Files", icon: <FinderIcon /> },
  { id: "terminal", label: "Terminal", icon: <TerminalIcon /> },
  { id: "games", label: "Arcade", icon: <ArcadeIcon /> },
  { id: "preview", label: "CV", icon: <PreviewIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  { id: "about", label: "About", icon: <TextFileGlyph className="p-[12%]" /> },
  {
    id: "welcome",
    label: "Welcome",
    icon: <TextFileGlyph className="p-[12%]" />,
  },
];

const GRID_LINKS: LinkSpec[] = [
  {
    id: "mail",
    label: "Mail",
    icon: <MailIcon />,
    href: `mailto:${site.email}`,
  },
  { id: "github", label: "GitHub", icon: <GithubIcon />, href: site.github },
  { id: "x", label: "X", icon: <XIcon />, href: site.x },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: <LinkedinIcon />,
    href: site.linkedin,
  },
];

type DockEntry = { id: string; label: string; icon: ReactNode } & (
  | { app: IosAppId }
  | { href: string }
);

const DOCK_APPS: DockEntry[] = [
  { id: "safari", label: "Safari", icon: <SafariIcon />, app: "safari" },
  { id: "contact", label: "Contact", icon: <ContactsIcon />, app: "contact" },
  { id: "arcade", label: "Arcade", icon: <ArcadeIcon />, app: "games" },
  { id: "phone", label: "Phone", icon: <PhoneIcon />, href: TEL },
];

const APP_TITLES: Record<IosAppId, string> = {
  safari: "Safari",
  finder: "Files",
  terminal: "Terminal",
  games: "Arcade",
  preview: "CV",
  contact: "Contact",
  settings: "Settings",
  about: "About",
  welcome: "Welcome",
  textedit: "TextEdit",
};

interface SheetAction {
  label: string;
  danger?: boolean;
  onSelect: () => void;
}

function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

function StatusBar({ light = false }: { light?: boolean }) {
  const clock = useClock();
  const [fullscreen, setFullscreen] = useState(() =>
    Boolean(document.fullscreenElement),
  );
  // iPhone Safari has no element Fullscreen API — hide the button there.
  const supported = Boolean(document.documentElement.requestFullscreen);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    sfx.click();
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  return (
    <div
      className={`pointer-events-none flex items-center justify-between px-6 pt-[max(env(safe-area-inset-top),10px)] text-[13px] font-semibold ${
        light
          ? "text-[#fff] [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]"
          : "text-white"
      }`}
    >
      <span className="tabular-nums">{clock}</span>
      <span className="flex items-center gap-2.5">
        {supported && (
          <button
            type="button"
            aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
            className="pointer-events-auto -m-2 p-2"
            onClick={toggle}
          >
            {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        )}
        <Wifi size={14} />
        <BatteryFull size={18} />
      </span>
    </div>
  );
}

/** Long-press → quick actions; short tap → open. */
function pressHandlers(onTap: () => void, onLong?: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let fired = false;
  let startY = 0;
  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return {
    onPointerDown: (event: React.PointerEvent) => {
      fired = false;
      startY = event.clientY;
      if (onLong) {
        timer = setTimeout(() => {
          fired = true;
          if (navigator.vibrate) navigator.vibrate(10);
          onLong();
        }, 420);
      }
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (Math.abs(event.clientY - startY) > 12) clear();
    },
    onPointerUp: () => clear(),
    onPointerLeave: () => clear(),
    onClick: () => {
      if (!fired) onTap();
    },
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  };
}

function HomeIcon({
  label,
  icon,
  onTap,
  onLong,
}: {
  label: string;
  icon: ReactNode;
  onTap: () => void;
  onLong?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full flex-col items-center gap-1.5 outline-none"
      style={{ touchAction: "manipulation" }}
      {...pressHandlers(onTap, onLong)}
    >
      <span className="h-16 w-16 transition-transform active:scale-90 [&>*]:h-full [&>*]:w-full">
        {icon}
      </span>
      <span className="max-w-full truncate text-[11px] font-medium text-[#fff] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        {label}
      </span>
    </button>
  );
}

/** Full-screen app with iOS chrome: grabber title bar + swipe-up home indicator. */
function IosAppFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // Dragging the home indicator scales the app down before dismissal.
  const dragY = useMotionValue(0);
  const scale = useTransform(dragY, [0, -160], [1, 0.82]);
  const radius = useTransform(dragY, [0, -160], [16, 36]);
  const dimming = useTransform(dragY, [0, -160], [1, 0.92]);

  const startRef = useRef<number | null>(null);

  const onIndicatorDown = (event: React.PointerEvent) => {
    startRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onIndicatorMove = (event: React.PointerEvent) => {
    if (startRef.current === null) return;
    dragY.set(Math.min(0, event.clientY - startRef.current));
  };
  const onIndicatorUp = () => {
    if (startRef.current === null) return;
    const passed = dragY.get() < -70;
    startRef.current = null;
    if (passed) {
      sfx.close();
      onClose();
    } else {
      // Spring back if released early.
      const settle = () => {
        const value = dragY.get();
        if (value > -1) {
          dragY.set(0);
          return;
        }
        dragY.set(value * 0.75);
        requestAnimationFrame(settle);
      };
      settle();
    }
  };

  return (
    // Outer layer owns the open/close animation; the inner layer owns the live
    // swipe transform. Keeping them separate is what makes closing reliable —
    // exit variants and drag motion values never fight over the same node.
    <motion.div
      className="fixed inset-0 z-[500]"
      // Transform-only entrance: fading an ancestor of a backdrop-blur surface
      // suppresses the blur until the fade ends (transparent-then-blur pop).
      initial={{ scale: 0.3, y: 240 }}
      animate={{
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 340, damping: 30, mass: 0.9 },
      }}
      exit={{
        opacity: 0,
        scale: 0.46,
        y: 180,
        transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] },
      }}
      style={{ transformOrigin: "50% 85%" }}
    >
      <motion.div
        className="flex h-full flex-col overflow-hidden bg-[var(--win-dark)] backdrop-blur-2xl"
        style={{ scale, borderRadius: radius, opacity: dimming }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
          <span className="w-8" />
          <span className="text-[15px] font-semibold text-white">{title}</span>
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80"
            onClick={() => {
              sfx.close();
              onClose();
            }}
          >
            <ChevronDown size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

        {/* Home indicator — swipe up to leave the app */}
        <div
          className="flex shrink-0 items-center justify-center pb-[max(env(safe-area-inset-bottom),8px)] pt-2"
          style={{ touchAction: "none" }}
          onPointerDown={onIndicatorDown}
          onPointerMove={onIndicatorMove}
          onPointerUp={onIndicatorUp}
          onPointerCancel={onIndicatorUp}
        >
          <span className="h-1.5 w-32 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function IOS() {
  const settings = useSettings();
  useWallpaperShuffle();
  const [open, setOpen] = useState<IosAppId | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [finderSection, setFinderSection] = useState<FinderSection | null>(
    null,
  );
  const [sheet, setSheet] = useState<{
    title: string;
    actions: SheetAction[];
  } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [booting, setBooting] = useState(true);
  const pullRef = useRef<{ y: number; at: number } | null>(null);

  useEffect(() => {
    document.title = "Saleh Al-Mashni — Senior Mobile & Full-Stack Engineer";
    let welcomed = false;
    try {
      welcomed = Boolean(localStorage.getItem(WELCOME_KEY));
    } catch {
      /* private mode */
    }
    if (!welcomed) {
      setOpen("welcome");
      try {
        localStorage.setItem(WELCOME_KEY, "1");
      } catch {
        /* fine */
      }
    }
  }, []);

  const launch = (id: IosAppId) => {
    sfx.open();
    if (id === "finder") setFinderSection(null);
    setOpen(id);
  };

  /** Quick access: open Files straight at a section. */
  const openSection = (section: FinderSection) => {
    sfx.open();
    setFinderSection(section);
    setOpen("finder");
  };

  const goHome = () => {
    setOpen(null);
    setFileId(null);
    setFinderSection(null);
  };

  const quickActions = (spec: AppSpec): SheetAction[] => {
    const actions: SheetAction[] = [
      { label: `Open ${spec.label}`, onSelect: () => launch(spec.id) },
    ];
    if (spec.id === "contact") {
      actions.push({
        label: "Copy Email",
        onSelect: () => void navigator.clipboard?.writeText(site.email),
      });
    }
    if (spec.id === "preview") {
      actions.push({
        label: "Download CV",
        onSelect: () =>
          window.open("/Saleh_Al-Mashni_Resume_2026.pdf", "_blank"),
      });
    }
    if (spec.id === "games") {
      actions.push({ label: "Play DOOM", onSelect: () => launch("games") });
    }
    return actions;
  };

  const renderApp = (id: IosAppId): ReactNode => {
    switch (id) {
      case "safari":
        return <SafariApp />;
      case "finder":
        return (
          <FinderApp
            initialSection={finderSection ?? undefined}
            onOpenFile={(file) => {
              setFileId(file);
              setOpen("textedit");
            }}
            onTrashNode={(node) => {
              sfx.trash();
              fs.remove(node);
            }}
          />
        );
      case "terminal":
        return (
          <TerminalApp
            actions={{
              openApp: (app) => launch(app),
              close: goHome,
            }}
          />
        );
      case "games":
        return <GamesApp />;
      case "preview":
        return <PreviewApp />;
      case "contact":
        return <ContactApp />;
      case "settings":
        return (
          <SettingsApp
            presets={WALLPAPERS}
            onOpenWelcome={() => launch("welcome")}
          />
        );
      case "about":
        return <AboutApp />;
      case "welcome":
        return <WelcomeApp onClose={goHome} />;
      case "textedit":
        return fileId ? <TextEditApp fileId={fileId} /> : null;
    }
  };

  const searchItems = useMemo(() => {
    const items: { id: string; label: string; sub: string; run: () => void }[] =
      [
        ...GRID_APPS.map((app) => ({
          id: app.id,
          label: app.label,
          sub: "App",
          run: () => launch(app.id),
        })),
        {
          id: "safari-s",
          label: "Safari",
          sub: "About Saleh",
          run: () => launch("safari"),
        },
        {
          id: "contact-s",
          label: "Contact",
          sub: "Send a message",
          run: () => launch("contact"),
        },
        {
          id: "email",
          label: "Copy Email",
          sub: site.email,
          run: () => void navigator.clipboard?.writeText(site.email),
        },
        {
          id: "call",
          label: "Call Saleh",
          sub: site.phone,
          run: () => window.open(TEL),
        },
        {
          id: "gh",
          label: "GitHub",
          sub: "Open profile",
          run: () => window.open(site.github, "_blank"),
        },
        {
          id: "li",
          label: "LinkedIn",
          sub: "Open profile",
          run: () => window.open(site.linkedin, "_blank"),
        },
        {
          id: "fs",
          label: "Full Screen",
          sub: "Toggle",
          run: () => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else
              void document.documentElement.requestFullscreen().catch(() => {});
          },
        },
      ];
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sub.toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Pull down anywhere on the home screen → search (iOS gesture).
  const onHomeTouchStart = (event: React.TouchEvent) => {
    pullRef.current = { y: event.touches[0]!.clientY, at: Date.now() };
  };
  const onHomeTouchMove = (event: React.TouchEvent) => {
    if (!pullRef.current) return;
    const dy = event.touches[0]!.clientY - pullRef.current.y;
    if (dy > 70 && Date.now() - pullRef.current.at < 600) {
      pullRef.current = null;
      sfx.open();
      setSearchOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-[#0c1024] font-sans">
      {/* Wallpaper crossfades between selections / shuffle rotations */}
      <AnimatePresence initial={false}>
        <motion.div
          key={JSON.stringify(settings.wallpaper)}
          className="absolute inset-0"
          style={wallpaperStyle(settings.wallpaper)}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </AnimatePresence>

      {/* Home screen */}
      <div
        className="relative flex h-full flex-col"
        onTouchStart={onHomeTouchStart}
        onTouchMove={onHomeTouchMove}
      >
        <StatusBar light />

        {/* Profile header — tells visitors what this is */}
        <button
          type="button"
          className="mx-auto mt-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-4 py-2.5 backdrop-blur-xl"
          onClick={() => launch("safari")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e8aa42_0%,#a8690f_100%)] font-display text-sm font-semibold text-[#101013]">
            SA
          </span>
          <span className="text-left">
            <span className="block text-[13px] font-semibold text-[#fff]">
              {site.name}
            </span>
            <span className="block text-[11px] text-[#fff]/65">
              {site.role.split(" — ")[0]} — portfolio
            </span>
          </span>
        </button>

        {/* Search pill */}
        <button
          type="button"
          className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-black/25 px-3.5 py-1.5 text-xs text-[#fff]/75 backdrop-blur-xl"
          onClick={() => {
            sfx.open();
            setSearchOpen(true);
          }}
        >
          <Search size={12} />
          Search
        </button>

        {/* Quick access to the portfolio sections */}
        <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {(
            [
              {
                label: "Projects",
                Icon: FolderOpen,
                color: "#5aa7f2",
                run: () => openSection("projects"),
              },
              {
                label: "Experience",
                Icon: Briefcase,
                color: "#e8aa42",
                run: () => openSection("experience"),
              },
              {
                label: "Skills",
                Icon: Wrench,
                color: "#34d058",
                run: () => openSection("skills"),
              },
              {
                label: "Education",
                Icon: GraduationCap,
                color: "#b07ef0",
                run: () => openSection("education"),
              },
              {
                label: "CV",
                Icon: FileText,
                color: "#ff6b64",
                run: () => launch("preview"),
              },
              {
                label: "Contact",
                Icon: Send,
                color: "#3fc6f2",
                run: () => launch("contact"),
              },
            ] as const
          ).map(({ label, Icon, color, run }) => (
            <button
              key={label}
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-xl active:bg-black/40"
              onClick={run}
            >
              <Icon size={13} style={{ color }} />
              <span className="text-xs font-medium text-[#fff]/85">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* App grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-6">
          <div className="grid grid-cols-4 gap-x-2 gap-y-5">
            {GRID_APPS.map((app) => (
              <HomeIcon
                key={app.id}
                label={app.label}
                icon={app.icon}
                onTap={() => launch(app.id)}
                onLong={() => {
                  sfx.click();
                  setSheet({ title: app.label, actions: quickActions(app) });
                }}
              />
            ))}
            {GRID_LINKS.map((link) => (
              <HomeIcon
                key={link.id}
                label={link.label}
                icon={link.icon}
                onTap={() => window.open(link.href, "_blank")}
                onLong={() => {
                  sfx.click();
                  setSheet({
                    title: link.label,
                    actions: [
                      {
                        label: "Open Link",
                        onSelect: () => window.open(link.href, "_blank"),
                      },
                    ],
                  });
                }}
              />
            ))}
          </div>
        </div>

        {/* Dock */}
        <div className="px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="grid grid-cols-4 gap-3 rounded-[28px] border border-white/15 bg-white/15 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl">
            {DOCK_APPS.map((entry) =>
              "href" in entry ? (
                <button
                  key={entry.id}
                  type="button"
                  aria-label={entry.label}
                  className="mx-auto h-14 w-14 transition-transform active:scale-90 [&>*]:h-full [&>*]:w-full"
                  onClick={() => window.open(entry.href, "_blank")}
                >
                  {entry.icon}
                </button>
              ) : (
                <button
                  key={entry.id}
                  type="button"
                  aria-label={entry.label}
                  className="mx-auto h-14 w-14 transition-transform active:scale-90 [&>*]:h-full [&>*]:w-full"
                  onClick={() => launch(entry.app)}
                >
                  {entry.icon}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Open app */}
      <AnimatePresence>
        {open && (
          <IosAppFrame key={open} title={APP_TITLES[open]} onClose={goHome}>
            {renderApp(open)}
          </IosAppFrame>
        )}
      </AnimatePresence>

      {/* Long-press action sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div
            className="fixed inset-0 z-[600] flex flex-col justify-end bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheet(null)}
          >
            <motion.div
              className="mx-3 mb-[max(env(safe-area-inset-bottom),12px)] space-y-2"
              initial={{ y: 220 }}
              animate={{ y: 0 }}
              exit={{ y: 260 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl bg-[var(--panel)] backdrop-blur-2xl">
                <p className="border-b border-white/10 px-4 py-2 text-center text-xs text-white/45">
                  {sheet.title}
                </p>
                {sheet.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`block w-full border-b border-white/10 px-4 py-3 text-center text-[15px] last:border-0 ${
                      action.danger ? "text-[#ff6b64]" : "text-[#3b8af0]"
                    }`}
                    onClick={() => {
                      action.onSelect();
                      setSheet(null);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-2xl bg-[var(--panel)] px-4 py-3 text-center text-[15px] font-semibold text-[#3b8af0] backdrop-blur-2xl"
                onClick={() => setSheet(null)}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[700] bg-black/55 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-4 pt-[max(env(safe-area-inset-top),16px)]">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5">
                  <Search size={16} className="text-[#fff]/60" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent text-[15px] text-[#fff] placeholder-[#fff]/40 outline-none"
                    aria-label="Search"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Close search"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[#fff]/80"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl bg-black/30">
                {searchItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-baseline justify-between border-b border-white/10 px-4 py-3 text-left last:border-0"
                    onClick={() => {
                      item.run();
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="text-[15px] text-[#fff]">
                      {item.label}
                    </span>
                    <span className="text-xs text-[#fff]/45">{item.sub}</span>
                  </button>
                ))}
                {searchItems.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-[#fff]/45">
                    No results
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {booting && <BootScreen onDone={() => setBooting(false)} />}
      </AnimatePresence>
    </div>
  );
}
