import { AnimatePresence, motion } from "motion/react";
import {
  Copy,
  Download,
  ExternalLink,
  FilePlus,
  FolderPlus,
  Gamepad2,
  Image,
  Mail,
  Maximize,
  Moon,
  Power,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "../data/content";
import { AboutApp } from "./apps/AboutApp";
import { ContactApp } from "./apps/ContactApp";
import { FinderApp, type FinderSection } from "./apps/FinderApp";
import { GamesApp } from "./apps/GamesApp";
import { PreviewApp } from "./apps/PreviewApp";
import { SafariApp } from "./apps/SafariApp";
import { SettingsApp } from "./apps/SettingsApp";
import { TerminalApp } from "./apps/TerminalApp";
import { TextEditApp } from "./apps/TextEditApp";
import { WelcomeApp } from "./apps/WelcomeApp";
import {
  ArcadeIcon,
  ContactsIcon,
  FinderIcon,
  FolderGlyph,
  GithubIcon,
  LaunchpadIcon,
  LinkedinIcon,
  MailIcon,
  PdfGlyph,
  PhoneIcon,
  PreviewIcon,
  SafariIcon,
  SettingsIcon,
  TerminalIcon,
  TextFileGlyph,
  XIcon,
} from "./components/AppIcons";
import { BootScreen } from "./components/BootScreen";
import { ContextMenu, type ContextMenuState } from "./components/ContextMenu";
import { DesktopHero } from "./components/DesktopHero";
import { DesktopIcon } from "./components/DesktopIcon";
import { Dock, type DockItemSpec } from "./components/Dock";
import { Launchpad, type LaunchpadApp } from "./components/Launchpad";
import { MenuBar, type MenuEntry, type MenuSpec } from "./components/MenuBar";
import { Spotlight, type SpotlightItem } from "./components/Spotlight";
import { Widgets } from "./components/Widgets";
import { Window, type WindowFrame } from "./components/Window";
import { fs, useFs } from "./lib/fs";
import { useSettings, useWallpaperShuffle } from "./lib/settings";
import { WALLPAPERS, wallpaperStyle } from "./lib/wallpapers";
import { sfx } from "./lib/sfx";

const CV_URL = "/Saleh_Al-Mashni_Resume_2026.pdf";
const WELCOME_KEY = "macos-welcomed";

type AppId =
  | "finder"
  | "safari"
  | "terminal"
  | "preview"
  | "about"
  | "games"
  | "contact"
  | "textedit"
  | "welcome"
  | "settings";

/** Finder and TextEdit can open many windows; everything else focuses its existing one. */
const SINGLETON: Record<AppId, boolean> = {
  finder: false,
  safari: true,
  terminal: true,
  preview: true,
  about: true,
  games: true,
  contact: true,
  textedit: false,
  welcome: true,
  settings: true,
};

const APP_TITLES: Record<AppId, string> = {
  finder: "Finder",
  safari: "Safari",
  terminal: "Terminal",
  preview: "Preview — CV",
  about: "About This Mac",
  games: "Arcade",
  contact: "Contact",
  textedit: "TextEdit",
  welcome: "Welcome",
  settings: "System Settings",
};

const FRAMES: Record<AppId, WindowFrame> = {
  safari: { x: 180, y: 40, w: 860, h: 580 },
  finder: { x: 80, y: 90, w: 760, h: 480 },
  terminal: { x: 320, y: 150, w: 620, h: 420 },
  preview: { x: 220, y: 30, w: 780, h: 640 },
  about: { x: 380, y: 100, w: 460, h: 460 },
  games: { x: 260, y: 60, w: 700, h: 580 },
  contact: { x: 300, y: 110, w: 640, h: 440 },
  textedit: { x: 340, y: 80, w: 620, h: 480 },
  welcome: { x: 400, y: 60, w: 500, h: 620 },
  settings: { x: 280, y: 60, w: 780, h: 580 },
};

interface WinPayload {
  initialSection?: FinderSection;
  fsFolderId?: string | null;
  fileId?: string;
}

interface WinInstance {
  id: string;
  app: AppId;
  title: string;
  frame: WindowFrame;
  z: number;
  minimized: boolean;
  maximized: boolean;
  payload?: WinPayload;
}

interface Band {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export default function MacOS() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const zCounter = useRef(10);
  const idCounter = useRef(0);
  const spawnCounter = useRef(0);

  const fsNodes = useFs();
  const settings = useSettings();
  useWallpaperShuffle();
  const [wins, setWins] = useState<WinInstance[]>([]);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [iconsHidden, setIconsHidden] = useState(false);
  const [widgetsHidden, setWidgetsHidden] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [poweredOff, setPoweredOff] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [band, setBand] = useState<Band | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ⌘K / Ctrl+K opens Spotlight; any key wakes from sleep.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (sleeping) {
        setSleeping(false);
        sfx.open();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSpotlightOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sleeping]);

  const toggleFullscreen = () => {
    sfx.click();
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    document.title = "Saleh Al-Mashni — Senior Mobile & Full-Stack Engineer";
    openApp("finder", undefined, true);
    openApp("safari", undefined, true);
    // First visit: open the welcome tour so nobody is confused.
    let welcomed = false;
    try {
      welcomed = Boolean(localStorage.getItem(WELCOME_KEY));
    } catch {
      /* private mode */
    }
    if (!welcomed) {
      openApp("welcome", undefined, true);
      try {
        localStorage.setItem(WELCOME_KEY, "1");
      } catch {
        /* fine */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextZ = () => {
    zCounter.current += 1;
    return zCounter.current;
  };

  const openApp = (app: AppId, payload?: WinPayload, silent = false) => {
    if (!silent) sfx.open();
    setWins((current) => {
      if (SINGLETON[app]) {
        const existing = current.find((win) => win.app === app);
        if (existing) {
          return current.map((win) =>
            win.id === existing.id ? { ...win, minimized: false, z: nextZ() } : win,
          );
        }
      }
      // One TextEdit window per file.
      if (app === "textedit" && payload?.fileId) {
        const existing = current.find((win) => win.payload?.fileId === payload.fileId);
        if (existing) {
          return current.map((win) =>
            win.id === existing.id ? { ...win, minimized: false, z: nextZ() } : win,
          );
        }
      }
      idCounter.current += 1;
      const cascade = (spawnCounter.current % 6) * 26;
      spawnCounter.current += 1;
      const base = FRAMES[app];
      const instance: WinInstance = {
        id: `${app}-${idCounter.current}`,
        app,
        title: APP_TITLES[app],
        frame: { ...base, x: base.x + cascade, y: base.y + cascade },
        z: nextZ(),
        minimized: false,
        maximized: false,
        payload,
      };
      return [...current, instance];
    });
  };

  const focusWin = (id: string) => {
    setWins((current) =>
      current.map((win) => (win.id === id ? { ...win, minimized: false, z: nextZ() } : win)),
    );
  };

  const closeWin = (id: string) => {
    sfx.close();
    setWins((current) => current.filter((win) => win.id !== id));
  };

  const minimizeWin = (id: string) => {
    sfx.click();
    setWins((current) =>
      current.map((win) => (win.id === id ? { ...win, minimized: true } : win)),
    );
  };

  const toggleMaximize = (id: string) => {
    setWins((current) =>
      current.map((win) =>
        win.id === id ? { ...win, maximized: !win.maximized, z: nextZ() } : win,
      ),
    );
  };

  const closeAllOf = (app: AppId) => {
    sfx.close();
    setWins((current) => current.filter((win) => win.app !== app));
  };

  /** Dock click: focus the front-most window of the app, or open one. */
  const summonApp = (app: AppId) => {
    const open = wins.filter((win) => win.app === app);
    if (open.length === 0) {
      openApp(app);
      return;
    }
    const top = [...open].sort((a, b) => b.z - a.z)[0]!;
    sfx.click();
    focusWin(top.id);
  };

  const openTextFile = (fileId: string) => openApp("textedit", { fileId });

  const newFolder = () => {
    sfx.click();
    fs.create("folder", null);
  };

  const newTextFile = () => {
    sfx.click();
    const node = fs.create("text", null);
    openTextFile(node.id);
  };

  /** Delete an FS node (and descendants), closing any windows that show them. */
  const trashNode = (nodeId: string) => {
    sfx.trash();
    setWins((current) =>
      current.filter((win) => {
        const folder = win.payload?.fsFolderId;
        const file = win.payload?.fileId;
        if (folder && fs.isWithin(folder, nodeId)) return false;
        if (file && fs.isWithin(file, nodeId)) return false;
        return true;
      }),
    );
    const removed = fs.remove(nodeId);
    setTrashCount((count) => count + removed);
  };

  const moveNode = (nodeId: string, targetFolderId: string | null) => {
    if (fs.move(nodeId, targetFolderId)) sfx.click();
  };


  const copyToClipboard = (text: string) => {
    sfx.click();
    void navigator.clipboard?.writeText(text);
  };

  const selectIcon = (id: string, additive: boolean) => {
    setSelectedIcons((current) => {
      if (!additive) return new Set([id]);
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Rubber-band selection: press on empty desktop and drag.
  const startBand = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const origin = { x: event.clientX, y: event.clientY };
    setSelectedIcons(new Set());
    setBand({ x0: origin.x, y0: origin.y, x1: origin.x, y1: origin.y });
    event.currentTarget.setPointerCapture(event.pointerId);

    const updateSelection = (rect: Band) => {
      const left = Math.min(rect.x0, rect.x1);
      const right = Math.max(rect.x0, rect.x1);
      const top = Math.min(rect.y0, rect.y1);
      const bottom = Math.max(rect.y0, rect.y1);
      const hits = new Set<string>();
      desktopRef.current?.querySelectorAll<HTMLElement>("[data-desktop-icon]").forEach((el) => {
        const box = el.getBoundingClientRect();
        if (box.left < right && box.right > left && box.top < bottom && box.bottom > top) {
          hits.add(el.dataset.desktopIcon!);
        }
      });
      setSelectedIcons(hits);
    };

    const onMove = (move: PointerEvent) => {
      const next = { x0: origin.x, y0: origin.y, x1: move.clientX, y1: move.clientY };
      setBand(next);
      updateSelection(next);
    };
    const onUp = () => {
      setBand(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const activeWin = [...wins].filter((win) => !win.minimized).sort((a, b) => b.z - a.z)[0];

  /** Window titles for FS-backed windows track renames live. */
  const titleOf = (win: WinInstance): string => {
    if (win.app === "finder" && win.payload?.fsFolderId) {
      return fs.get(win.payload.fsFolderId)?.name ?? "Desktop";
    }
    if (win.app === "textedit" && win.payload?.fileId) {
      return fs.get(win.payload.fileId)?.name ?? "TextEdit";
    }
    return win.title;
  };

  // ----- Menu bar definitions -----

  const appleEntries: MenuEntry[] = [
    { label: "About This Mac", onSelect: () => openApp("about") },
    { label: "System Settings…", onSelect: () => openApp("settings") },
    "separator",
    {
      label: "Sleep",
      icon: <Moon size={13} />,
      onSelect: () => {
        sfx.close();
        setSleeping(true);
      },
    },
    {
      label: "Restart…",
      icon: <RotateCw size={13} />,
      onSelect: () => window.location.reload(),
    },
    {
      label: "Shut Down…",
      icon: <Power size={13} />,
      onSelect: () => {
        sfx.close();
        setPoweredOff(true);
      },
    },
  ];

  const menus: MenuSpec[] = [
    {
      label: "File",
      entries: [
        { label: "New Finder Window", shortcut: "⌘N", onSelect: () => openApp("finder") },
        { label: "New Folder", shortcut: "⇧⌘N", icon: <FolderPlus size={13} />, onSelect: newFolder },
        { label: "New Text File", icon: <FilePlus size={13} />, onSelect: newTextFile },
        "separator",
        {
          label: "Close Window",
          shortcut: "⌘W",
          disabled: !activeWin,
          onSelect: () => activeWin && closeWin(activeWin.id),
        },
      ],
    },
    {
      label: "Edit",
      entries: [
        { label: "Copy Email", icon: <Copy size={13} />, onSelect: () => copyToClipboard(site.email) },
        { label: "Copy Phone", icon: <Copy size={13} />, onSelect: () => copyToClipboard(site.phone) },
      ],
    },
    {
      label: "View",
      entries: [
        {
          label: "Change Wallpaper…",
          icon: <Image size={13} />,
          onSelect: () => openApp("settings"),
        },
        {
          label: iconsHidden ? "Show Desktop Icons" : "Hide Desktop Icons",
          onSelect: () => setIconsHidden((value) => !value),
        },
        {
          label: widgetsHidden ? "Show Widgets" : "Hide Widgets",
          onSelect: () => setWidgetsHidden((value) => !value),
        },
        "separator",
        {
          label: fullscreen ? "Exit Full Screen" : "Enter Full Screen",
          shortcut: "⌃⌘F",
          icon: <Maximize size={13} />,
          onSelect: toggleFullscreen,
        },
      ],
    },
    {
      label: "Go",
      entries: [
        { label: "Projects", onSelect: () => openApp("finder", { initialSection: "projects" }) },
        { label: "Experience", onSelect: () => openApp("finder", { initialSection: "experience" }) },
        { label: "Skills", onSelect: () => openApp("finder", { initialSection: "skills" }) },
        { label: "Education", onSelect: () => openApp("finder", { initialSection: "education" }) },
        "separator",
        { label: "Contact", onSelect: () => openApp("contact") },
        { label: "Arcade", onSelect: () => openApp("games") },
        { label: "System Settings", onSelect: () => openApp("settings") },
        { label: "Launchpad", onSelect: () => setLaunchpadOpen(true) },
      ],
    },
    {
      label: "Window",
      entries: [
        {
          label: "Minimize",
          shortcut: "⌘M",
          disabled: !activeWin,
          onSelect: () => activeWin && minimizeWin(activeWin.id),
        },
        {
          label: "Zoom",
          disabled: !activeWin,
          onSelect: () => activeWin && toggleMaximize(activeWin.id),
        },
        ...(wins.length ? (["separator"] as MenuEntry[]) : []),
        ...wins.map<MenuEntry>((win) => ({
          label: titleOf(win),
          onSelect: () => focusWin(win.id),
        })),
      ],
    },
    {
      label: "Help",
      entries: [
        { label: "Welcome Tour", onSelect: () => openApp("welcome") },
        "separator",
        {
          label: "GitHub",
          icon: <ExternalLink size={13} />,
          onSelect: () => window.open(site.github, "_blank"),
        },
        {
          label: "LinkedIn",
          icon: <ExternalLink size={13} />,
          onSelect: () => window.open(site.linkedin, "_blank"),
        },
        { label: "Email Saleh", onSelect: () => window.open(`mailto:${site.email}`) },
        "separator",
        { label: "About This Mac", onSelect: () => openApp("about") },
      ],
    },
  ];

  // ----- Context menus -----

  const desktopContextMenu = (x: number, y: number) => {
    setMenu({
      x,
      y,
      items: [
        { label: "New Folder", icon: <FolderPlus size={13} />, onSelect: newFolder },
        { label: "New Text File", icon: <FilePlus size={13} />, onSelect: newTextFile },
        "separator",
        {
          label: "Change Wallpaper…",
          icon: <Image size={13} />,
          onSelect: () => openApp("settings"),
        },
        {
          label: iconsHidden ? "Show Desktop Icons" : "Hide Desktop Icons",
          onSelect: () => setIconsHidden((value) => !value),
        },
        {
          label: widgetsHidden ? "Show Widgets" : "Hide Widgets",
          onSelect: () => setWidgetsHidden((value) => !value),
        },
        "separator",
        { label: "Open Terminal", onSelect: () => openApp("terminal") },
      ],
    });
  };

  const builtinIconContextMenu = (x: number, y: number, open: () => void) => {
    setMenu({
      x,
      y,
      items: [
        { label: "Open", onSelect: open },
        "separator",
        {
          label: "Move to Trash",
          icon: <Trash2 size={13} />,
          disabled: true,
          onSelect: () => {},
        },
      ],
    });
  };

  const fsIconContextMenu = (x: number, y: number, nodeId: string) => {
    const node = fs.get(nodeId);
    if (!node) return;
    setMenu({
      x,
      y,
      items: [
        {
          label: "Open",
          onSelect: () =>
            node.type === "folder" ? openApp("finder", { fsFolderId: node.id }) : openTextFile(node.id),
        },
        "separator",
        {
          label: "Move to Trash",
          icon: <Trash2 size={13} />,
          danger: true,
          onSelect: () => trashNode(node.id),
        },
      ],
    });
  };

  const dockItemContextMenu = (item: DockItemSpec, x: number, y: number) => {
    if (item.href) {
      setMenu({
        x,
        y,
        items: [
          {
            label: "Open Link",
            icon: <ExternalLink size={13} />,
            onSelect: () => window.open(item.href, "_blank"),
          },
        ],
      });
      return;
    }
    if (item.id === "launchpad") {
      setMenu({
        x,
        y,
        items: [{ label: "Open Launchpad", onSelect: () => setLaunchpadOpen(true) }],
      });
      return;
    }
    const app = item.id as AppId;
    const openCount = wins.filter((win) => win.app === app).length;
    setMenu({
      x,
      y,
      items: [
        { label: app === "finder" ? "New Window" : "Open", onSelect: () => openApp(app) },
        "separator",
        {
          label: openCount > 1 ? `Quit (${openCount} windows)` : "Quit",
          disabled: openCount === 0,
          onSelect: () => closeAllOf(app),
        },
      ],
    });
  };

  const trashContextMenu = (x: number, y: number) => {
    setMenu({
      x,
      y,
      items: [
        {
          label: "Empty Trash…",
          icon: <Trash2 size={13} />,
          danger: true,
          disabled: trashCount === 0,
          onSelect: () => {
            sfx.trash();
            setTrashCount(0);
          },
        },
      ],
    });
  };

  // ----- Dock, Launchpad, Spotlight -----

  const isRunning = (app: AppId) => wins.some((win) => win.app === app);

  const dockItems: DockItemSpec[] = [
    { id: "finder", label: "Finder", icon: <FinderIcon />, running: isRunning("finder"), onClick: () => summonApp("finder") },
    {
      id: "launchpad",
      label: "Launchpad",
      icon: <LaunchpadIcon />,
      onClick: () => {
        sfx.open();
        setLaunchpadOpen(true);
      },
    },
    { id: "safari", label: "Safari", icon: <SafariIcon />, running: isRunning("safari"), onClick: () => summonApp("safari") },
    { id: "terminal", label: "Terminal", icon: <TerminalIcon />, running: isRunning("terminal"), onClick: () => summonApp("terminal") },
    { id: "games", label: "Arcade", icon: <ArcadeIcon />, running: isRunning("games"), onClick: () => summonApp("games") },
    { id: "preview", label: "CV — Preview", icon: <PreviewIcon />, running: isRunning("preview"), onClick: () => summonApp("preview") },
    { id: "contact", label: "Contact", icon: <ContactsIcon />, running: isRunning("contact"), onClick: () => summonApp("contact") },
    { id: "settings", label: "System Settings", icon: <SettingsIcon />, running: isRunning("settings"), onClick: () => summonApp("settings") },
    { id: "mail", label: "Mail", icon: <MailIcon />, href: `mailto:${site.email}` },
    {
      id: "phone",
      label: "Call Saleh",
      icon: <PhoneIcon />,
      href: `tel:${site.phone.replace(/\s+/g, "")}`,
    },
    { id: "github", label: "GitHub", icon: <GithubIcon />, href: site.github },
    { id: "x", label: "X", icon: <XIcon />, href: site.x },
    { id: "linkedin", label: "LinkedIn", icon: <LinkedinIcon />, href: site.linkedin },
  ];

  const launchpadApps: LaunchpadApp[] = [
    { id: "finder", label: "Finder", icon: <FinderIcon />, onOpen: () => openApp("finder") },
    { id: "safari", label: "Safari", icon: <SafariIcon />, onOpen: () => openApp("safari") },
    { id: "terminal", label: "Terminal", icon: <TerminalIcon />, onOpen: () => openApp("terminal") },
    { id: "games", label: "Arcade", icon: <ArcadeIcon />, onOpen: () => openApp("games") },
    { id: "preview", label: "CV", icon: <PreviewIcon />, onOpen: () => openApp("preview") },
    { id: "contact", label: "Contact", icon: <ContactsIcon />, onOpen: () => openApp("contact") },
    { id: "settings", label: "Settings", icon: <SettingsIcon />, onOpen: () => openApp("settings") },
    {
      id: "phone",
      label: "Phone",
      icon: <PhoneIcon />,
      href: `tel:${site.phone.replace(/\s+/g, "")}`,
    },
    { id: "mail", label: "Mail", icon: <MailIcon />, href: `mailto:${site.email}` },
    { id: "github", label: "GitHub", icon: <GithubIcon />, href: site.github },
    { id: "x", label: "X", icon: <XIcon />, href: site.x },
    { id: "linkedin", label: "LinkedIn", icon: <LinkedinIcon />, href: site.linkedin },
  ];

  const spotlightItems: SpotlightItem[] = [
    { id: "sp-finder", title: "Finder", subtitle: "New window", icon: <FinderIcon />, action: () => openApp("finder") },
    { id: "sp-safari", title: "Safari", subtitle: "About Saleh", icon: <SafariIcon />, action: () => openApp("safari") },
    { id: "sp-contact", title: "Contact", subtitle: "Send a message", icon: <ContactsIcon />, action: () => openApp("contact") },
    { id: "sp-arcade", title: "Arcade", subtitle: "DOOM, Snake, Pong, 2048…", icon: <ArcadeIcon />, action: () => openApp("games") },
    { id: "sp-terminal", title: "Terminal", subtitle: "type help", icon: <TerminalIcon />, action: () => openApp("terminal") },
    { id: "sp-cv", title: "CV", subtitle: "Open the resume in Preview", icon: <PreviewIcon />, action: () => openApp("preview") },
    { id: "sp-welcome", title: "Welcome Tour", subtitle: "What is this site?", icon: <TextFileGlyph />, action: () => openApp("welcome") },
    { id: "sp-settings", title: "System Settings", subtitle: "Wallpaper, appearance, fonts", icon: <SettingsIcon />, action: () => openApp("settings") },
    { id: "sp-about", title: "About This Mac", subtitle: "Specs and a bio", icon: <TextFileGlyph />, action: () => openApp("about") },
    { id: "sp-projects", title: "Projects", subtitle: "Finder folder", icon: <FolderGlyph />, action: () => openApp("finder", { initialSection: "projects" }) },
    { id: "sp-experience", title: "Experience", subtitle: "Finder folder", icon: <FolderGlyph />, action: () => openApp("finder", { initialSection: "experience" }) },
    { id: "sp-skills", title: "Skills", subtitle: "Finder folder", icon: <FolderGlyph />, action: () => openApp("finder", { initialSection: "skills" }) },
    { id: "sp-education", title: "Education", subtitle: "Finder folder", icon: <FolderGlyph />, action: () => openApp("finder", { initialSection: "education" }) },
    { id: "sp-newfile", title: "New Text File", subtitle: "TextEdit", icon: <TextFileGlyph />, action: newTextFile },
    { id: "sp-email", title: "Copy Email", subtitle: site.email, icon: <Mail className="text-white/70" />, action: () => copyToClipboard(site.email) },
    { id: "sp-call", title: "Call Saleh", subtitle: site.phone, icon: <PhoneIcon />, action: () => window.open(`tel:${site.phone.replace(/\s+/g, "")}`) },
    { id: "sp-download", title: "Download CV", subtitle: "PDF", icon: <Download className="text-white/70" />, action: () => window.open(CV_URL, "_blank") },
    { id: "sp-github", title: "GitHub", subtitle: site.github.replace("https://", ""), icon: <GithubIcon />, action: () => window.open(site.github, "_blank") },
    { id: "sp-linkedin", title: "LinkedIn", subtitle: "Profile", icon: <LinkedinIcon />, action: () => window.open(site.linkedin, "_blank") },
    { id: "sp-x", title: "X", subtitle: "@saleh_almashne", icon: <XIcon />, action: () => window.open(site.x, "_blank") },
    { id: "sp-games", title: "Play a Game", subtitle: "Open the Arcade", icon: <Gamepad2 className="text-white/70" />, action: () => openApp("games") },
  ];

  const renderApp = (win: WinInstance) => {
    switch (win.app) {
      case "finder":
        return (
          <FinderApp
            initialSection={win.payload?.initialSection}
            fsFolderId={win.payload?.fsFolderId}
            onOpenFile={openTextFile}
            onTrashNode={trashNode}
          />
        );
      case "safari":
        return <SafariApp />;
      case "terminal":
        return (
          <TerminalApp
            actions={{
              openApp: (app) => openApp(app),
              close: () => closeWin(win.id),
            }}
          />
        );
      case "games":
        return <GamesApp />;
      case "about":
        return <AboutApp />;
      case "preview":
        return <PreviewApp />;
      case "contact":
        return <ContactApp />;
      case "textedit":
        return <TextEditApp fileId={win.payload!.fileId!} />;
      case "welcome":
        return <WelcomeApp onClose={() => closeWin(win.id)} />;
      case "settings":
        return <SettingsApp presets={WALLPAPERS} onOpenWelcome={() => openApp("welcome")} />;
    }
  };

  const builtinIcons = [
    {
      id: "projects",
      label: "Projects",
      icon: <FolderGlyph className="h-12 w-14" />,
      open: () => openApp("finder", { initialSection: "projects" as FinderSection }),
    },
    {
      id: "experience",
      label: "Experience",
      icon: <FolderGlyph className="h-12 w-14" />,
      open: () => openApp("finder", { initialSection: "experience" as FinderSection }),
    },
    {
      id: "skills",
      label: "Skills",
      icon: <FolderGlyph className="h-12 w-14" />,
      open: () => openApp("finder", { initialSection: "skills" as FinderSection }),
    },
    {
      id: "cv",
      label: "CV.pdf",
      icon: <PdfGlyph className="h-12 w-10" />,
      open: () => openApp("preview"),
    },
    {
      id: "about",
      label: "About.txt",
      icon: <TextFileGlyph className="h-12 w-10" />,
      open: () => openApp("about"),
    },
    {
      id: "welcome",
      label: "Welcome",
      icon: <TextFileGlyph className="h-12 w-10" />,
      open: () => openApp("welcome"),
    },
  ];

  const rootNodes = fsNodes.filter((node) => node.parentId === null);

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-[#0c1024] font-sans">
      {/* Wallpaper crossfades between selections */}
      <AnimatePresence initial={false}>
        <motion.div
          key={JSON.stringify(settings.wallpaper)}
          className="absolute inset-0"
          style={wallpaperStyle(settings.wallpaper)}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </AnimatePresence>

      <DesktopHero />

      <MenuBar
        activeApp={activeWin ? APP_TITLES[activeWin.app].split(" — ")[0]! : "Finder"}
        appleEntries={appleEntries}
        menus={menus}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        onSpotlight={() => setSpotlightOpen(true)}
      />

      {/* z-0 creates a stacking context so window z-indexes (which grow without
          bound) can never climb above the dock or menu bar. */}
      <div ref={desktopRef} className="absolute inset-x-0 bottom-0 top-7 z-0">
        {/* Wallpaper hit-layer: rubber-band select, right-click, drop-to-desktop */}
        <div
          className="absolute inset-0"
          style={{ touchAction: "none" }}
          onPointerDown={startBand}
          onContextMenu={(event) => {
            event.preventDefault();
            desktopContextMenu(event.clientX, event.clientY);
          }}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes("application/x-fs-node")) event.preventDefault();
          }}
          onDrop={(event) => {
            const nodeId = event.dataTransfer.getData("application/x-fs-node");
            if (nodeId) {
              moveNode(nodeId, null);
              event.preventDefault();
            }
          }}
        />

        {!widgetsHidden && <Widgets />}

        {/* Desktop icons */}
        {!iconsHidden && (
          <div className="absolute right-3 top-4 flex max-h-[calc(100%-90px)] flex-col flex-wrap-reverse items-end gap-3">
            {builtinIcons.map(({ id, label, icon, open }) => (
              <DesktopIcon
                key={id}
                id={id}
                label={label}
                icon={icon}
                selected={selectedIcons.has(id)}
                onSelect={selectIcon}
                onOpen={open}
                onContextMenu={(x, y) => builtinIconContextMenu(x, y, open)}
              />
            ))}
            {rootNodes.map((node) => (
              <DesktopIcon
                key={node.id}
                id={`fs:${node.id}`}
                label={node.name}
                icon={
                  node.type === "folder" ? (
                    <FolderGlyph className="h-12 w-14" />
                  ) : (
                    <TextFileGlyph className="h-12 w-10" />
                  )
                }
                selected={selectedIcons.has(`fs:${node.id}`)}
                onSelect={selectIcon}
                onOpen={() =>
                  node.type === "folder"
                    ? openApp("finder", { fsFolderId: node.id })
                    : openTextFile(node.id)
                }
                onContextMenu={(x, y) => fsIconContextMenu(x, y, node.id)}
                fsNodeId={node.id}
                fsDropFolderId={node.type === "folder" ? node.id : undefined}
                onFsDrop={moveNode}
              />
            ))}
          </div>
        )}

        {/* Windows */}
        <AnimatePresence>
          {wins.map((win) => (
            <Window
              key={win.id}
              title={titleOf(win)}
              z={win.z}
              minimized={win.minimized}
              maximized={win.maximized}
              frame={win.frame}
              constraintsRef={desktopRef}
              onClose={() => closeWin(win.id)}
              onMinimize={() => minimizeWin(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onFocus={() => focusWin(win.id)}
              dark={win.app === "terminal"}
            >
              {renderApp(win)}
            </Window>
          ))}
        </AnimatePresence>

        {/* Launchpad overlay */}
        <AnimatePresence>
          {launchpadOpen && (
            <Launchpad apps={launchpadApps} onClose={() => setLaunchpadOpen(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Rubber-band rectangle */}
      {band && (
        <div
          className="pointer-events-none fixed z-[940] rounded-sm border border-[#5aa7f2]/80 bg-[#2a7de1]/15"
          style={{
            left: Math.min(band.x0, band.x1),
            top: Math.min(band.y0, band.y1),
            width: Math.abs(band.x1 - band.x0),
            height: Math.abs(band.y1 - band.y0),
          }}
        />
      )}

      <Dock
        items={dockItems}
        onItemContextMenu={dockItemContextMenu}
        onTrashContextMenu={trashContextMenu}
        trashFull={trashCount > 0}
      />

      <AnimatePresence>
        {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} />}
      </AnimatePresence>

      {/* Spotlight (⌘K or the menu-bar magnifier) */}
      <AnimatePresence>
        {spotlightOpen && (
          <Spotlight items={spotlightItems} onClose={() => setSpotlightOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sleep — any click or key wakes it */}
      {sleeping && (
        <button
          type="button"
          className="fixed inset-0 z-[2000] flex cursor-pointer items-end justify-center bg-black pb-10"
          onClick={() => {
            sfx.open();
            setSleeping(false);
          }}
        >
          <span className="text-xs text-white/20">Sleeping — click or press any key to wake</span>
        </button>
      )}

      {/* Boot screen on load */}
      <AnimatePresence>{booting && <BootScreen onDone={() => setBooting(false)} />}</AnimatePresence>

      {/* Shut Down easter egg */}
      {poweredOff && (
        <button
          type="button"
          className="fixed inset-0 z-[2000] flex cursor-pointer items-end justify-center bg-black pb-10"
          onClick={() => {
            sfx.open();
            setPoweredOff(false);
          }}
        >
          <span className="text-xs text-white/25">Click anywhere to power on</span>
        </button>
      )}
    </div>
  );
}
