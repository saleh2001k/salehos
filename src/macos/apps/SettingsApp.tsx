import {
  Check,
  Image,
  Monitor,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  Type,
  Upload,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fs } from "../lib/fs";
import {
  FONTS,
  loadFont,
  settingsStore,
  UNSPLASH,
  unsplashUrl,
  useSettings,
  type Appearance,
  type GradientSpec,
} from "../lib/settings";
import { sfx } from "../lib/sfx";

export interface WallpaperPreset {
  name: string;
  background: string;
}

interface SettingsAppProps {
  presets: WallpaperPreset[];
  onOpenWelcome?: () => void;
}

type Tab = "wallpaper" | "appearance" | "fonts" | "general";

const TABS: { id: Tab; label: string; Icon: typeof Image }[] = [
  { id: "wallpaper", label: "Wallpaper", Icon: Image },
  { id: "appearance", label: "Appearance", Icon: Palette },
  { id: "fonts", label: "Fonts", Icon: Type },
  { id: "general", label: "General", Icon: Settings2 },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-white/45">
      {children}
    </h3>
  );
}

function WallpaperTab({ presets }: { presets: WallpaperPreset[] }) {
  const settings = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [gradient, setGradient] = useState<GradientSpec>(() =>
    settings.wallpaper.kind === "gradient"
      ? settings.wallpaper.gradient
      : { angle: 160, colors: ["#0c1024", "#2c1b33"] },
  );

  const selected = settings.wallpaper;
  const tile =
    "relative h-20 w-full overflow-hidden rounded-lg border transition-transform hover:scale-[1.03]";
  const checkBadge = (
    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2a7de1] text-[#fff]">
      <Check size={12} />
    </span>
  );

  const applyGradient = (next: GradientSpec) => {
    setGradient(next);
    settingsStore.setWallpaper({ kind: "gradient", gradient: next });
  };

  const gradientCss = (spec: GradientSpec) =>
    `linear-gradient(${spec.angle}deg, ${spec.colors.join(", ")})`;

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      sfx.open();
      settingsStore.setWallpaper({
        kind: "image",
        url: String(reader.result),
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Dynamic Gradients</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {presets.map((preset, index) => {
            const active = selected.kind === "preset" && selected.index === index;
            return (
              <button
                key={preset.name}
                type="button"
                className={`${tile} ${active ? "border-[#2a7de1]" : "border-white/15"}`}
                style={{ background: preset.background }}
                onClick={() => {
                  sfx.click();
                  settingsStore.setWallpaper({ kind: "preset", index });
                }}
              >
                {active && checkBadge}
                <span className="absolute bottom-1 left-1.5 text-[10px] font-medium text-[#fff] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Photos — Unsplash</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {UNSPLASH.map((photo) => {
            const url = unsplashUrl(photo.id, 2560);
            const active = selected.kind === "image" && selected.url === url;
            return (
              <button
                key={photo.id}
                type="button"
                className={`${tile} ${active ? "border-[#2a7de1]" : "border-white/15"}`}
                onClick={() => {
                  sfx.click();
                  settingsStore.setWallpaper({ kind: "image", url, name: photo.name });
                }}
              >
                <img
                  src={unsplashUrl(photo.id, 400)}
                  alt={photo.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {active && checkBadge}
                <span className="absolute bottom-1 left-1.5 text-[10px] font-medium text-[#fff] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {photo.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Your Photo</SectionTitle>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3.5 py-2 text-sm text-white/85 hover:border-white/40"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={14} />
            Upload Image
          </button>
          {selected.kind === "image" && selected.url.startsWith("data:") && (
            <span className="text-xs text-white/50">Using “{selected.name ?? "your image"}”</span>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>Custom Gradient</SectionTitle>
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="h-28 w-44 shrink-0 rounded-lg border border-white/15"
            style={{ background: gradientCss(gradient) }}
          />
          <div className="min-w-52 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              {gradient.colors.map((color, index) => (
                <span key={index} className="relative">
                  <input
                    type="color"
                    value={color}
                    aria-label={`Color ${index + 1}`}
                    className="h-9 w-9 cursor-pointer rounded-md border border-white/20 bg-transparent"
                    onChange={(event) => {
                      const colors = [...gradient.colors];
                      colors[index] = event.target.value;
                      applyGradient({ ...gradient, colors });
                    }}
                  />
                  {gradient.colors.length > 2 && (
                    <button
                      type="button"
                      aria-label={`Remove color ${index + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c0392b] text-[#fff]"
                      onClick={() =>
                        applyGradient({
                          ...gradient,
                          colors: gradient.colors.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Trash2 size={9} />
                    </button>
                  )}
                </span>
              ))}
              {gradient.colors.length < 5 && (
                <button
                  type="button"
                  aria-label="Add color"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-white/25 text-white/50 hover:border-white/50 hover:text-white"
                  onClick={() =>
                    applyGradient({ ...gradient, colors: [...gradient.colors, "#5aa7f2"] })
                  }
                >
                  <Plus size={15} />
                </button>
              )}
            </div>
            <label className="block text-xs text-white/55">
              Angle — {gradient.angle}°
              <input
                type="range"
                min={0}
                max={360}
                value={gradient.angle}
                className="mt-1 w-full accent-[#2a7de1]"
                onChange={(event) =>
                  applyGradient({ ...gradient, angle: Number(event.target.value) })
                }
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const settings = useSettings();
  const options: { id: Appearance; label: string; Icon: typeof Sun; preview: string }[] = [
    { id: "light", label: "Light", Icon: Sun, preview: "linear-gradient(180deg,#f5f5f7 60%,#dfe3ea 100%)" },
    { id: "dark", label: "Dark", Icon: Moon, preview: "linear-gradient(180deg,#1f1f24 60%,#101013 100%)" },
    { id: "system", label: "System", Icon: Monitor, preview: "linear-gradient(90deg,#f5f5f7 50%,#1f1f24 50%)" },
  ];

  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <div className="grid max-w-md grid-cols-3 gap-3">
        {options.map(({ id, label, Icon, preview }) => {
          const active = settings.appearance === id;
          return (
            <button
              key={id}
              type="button"
              className={`overflow-hidden rounded-xl border text-center transition-transform hover:scale-[1.02] ${
                active ? "border-[#2a7de1]" : "border-white/15"
              }`}
              onClick={() => {
                sfx.click();
                settingsStore.setAppearance(id);
              }}
            >
              <span className="block h-16 w-full" style={{ background: preview }} />
              <span className="flex items-center justify-center gap-1.5 py-2 text-xs text-white/80">
                <Icon size={13} />
                {label}
                {active && <Check size={12} className="text-[#2a7de1]" />}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 max-w-md text-xs leading-relaxed text-white/45">
        Light mode re-inks the whole desktop — windows, menus, dock and apps. The terminal and game
        boards stay dark, as nature intended.
      </p>
    </div>
  );
}

function FontsTab() {
  const settings = useSettings();
  return (
    <div>
      <SectionTitle>Interface Font</SectionTitle>
      <div className="max-w-md space-y-1.5">
        {FONTS.map((font) => {
          const active = settings.font === font.id;
          // Load each family so its row previews in the actual font.
          loadFont(font);
          return (
            <button
              key={font.id}
              type="button"
              className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left ${
                active ? "border-[#2a7de1] bg-white/10" : "border-white/10 hover:bg-white/5"
              }`}
              onClick={() => {
                sfx.click();
                settingsStore.setFont(font.id);
              }}
            >
              <span>
                <span className="block text-sm text-white" style={{ fontFamily: font.stack }}>
                  {font.label}
                </span>
                <span className="block text-[11px] text-white/40" style={{ fontFamily: font.stack }}>
                  The quick brown fox jumps over the lazy dog
                </span>
              </span>
              {active && <Check size={15} className="shrink-0 text-[#2a7de1]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        on ? "bg-[#34d058]" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#fff] shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function GeneralTab({ onOpenWelcome }: { onOpenWelcome?: () => void }) {
  const settings = useSettings();
  const [confirmErase, setConfirmErase] = useState(false);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const row =
    "flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 px-3.5 py-3 text-left";

  const toggleFullscreen = () => {
    sfx.click();
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      setFullscreen(false);
    } else {
      void document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    }
  };

  return (
    <div className="max-w-md space-y-7">
      <div>
        <SectionTitle>General</SectionTitle>
        <div className="space-y-2">
          <button
            type="button"
            className={row}
            onClick={() => settingsStore.setSound(!settings.sound)}
          >
            <span className="flex items-center gap-2.5 text-sm text-white">
              <Volume2 size={15} className="text-[#5aa7f2]" />
              Interface sound effects
            </span>
            <Toggle on={settings.sound} />
          </button>
          <button
            type="button"
            className={row}
            onClick={() => {
              sfx.click();
              settingsStore.setShuffle(!settings.shuffle);
            }}
          >
            <span className="flex items-center gap-2.5 text-sm text-white">
              <Image size={15} className="text-[#b07ef0]" />
              Shuffle wallpaper every 30s
            </span>
            <Toggle on={settings.shuffle} />
          </button>
          <button type="button" className={row} onClick={toggleFullscreen}>
            <span className="flex items-center gap-2.5 text-sm text-white">
              <Monitor size={15} className="text-[#34d058]" />
              Full screen
            </span>
            <Toggle on={fullscreen} />
          </button>
        </div>
      </div>

      <div>
        <SectionTitle>Help</SectionTitle>
        <button
          type="button"
          className={`${row} hover:bg-white/5`}
          onClick={() => {
            sfx.open();
            onOpenWelcome?.();
          }}
        >
          <span className="flex items-center gap-2.5 text-sm text-white">
            <Sparkles size={15} className="text-[#e8aa42]" />
            Replay the welcome tour
          </span>
        </button>
      </div>

      <div>
        <SectionTitle>Reset</SectionTitle>
        <div className="space-y-2">
          <button
            type="button"
            className={`${row} hover:bg-white/5`}
            onClick={() => {
              sfx.click();
              settingsStore.reset();
            }}
          >
            <span className="flex items-center gap-2.5 text-sm text-white">
              <RotateCcw size={15} className="text-white/60" />
              Reset all settings to defaults
            </span>
          </button>
          <button
            type="button"
            className={`${row} ${confirmErase ? "border-[#ff6b64]/60 bg-[#c0392b]/20" : "hover:bg-white/5"}`}
            onClick={() => {
              if (!confirmErase) {
                setConfirmErase(true);
                setTimeout(() => setConfirmErase(false), 3000);
                return;
              }
              sfx.trash();
              fs.reset();
              setConfirmErase(false);
            }}
          >
            <span className="flex items-center gap-2.5 text-sm text-[#ff6b64]">
              <Trash2 size={15} />
              {confirmErase ? "Tap again to confirm — erases your files" : "Erase desktop files & folders"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsApp({ presets, onOpenWelcome }: SettingsAppProps) {
  const [tab, setTab] = useState<Tab>("wallpaper");

  return (
    <div className="flex h-full">
      <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-white/10 bg-white/5 p-2 sm:flex">
        <p className="px-2 pb-1 pt-2 text-[11px] font-semibold text-white/40">Settings</p>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${
              tab === id ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
            }`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} className="text-[#5aa7f2]" />
            {label}
          </button>
        ))}
      </aside>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex gap-1 border-b border-white/10 p-2 sm:hidden">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${
                tab === id ? "bg-white/20 text-white" : "text-white/60"
              }`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "wallpaper" && <WallpaperTab presets={presets} />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "fonts" && <FontsTab />}
          {tab === "general" && <GeneralTab onOpenWelcome={onOpenWelcome} />}
        </div>
      </div>
    </div>
  );
}
