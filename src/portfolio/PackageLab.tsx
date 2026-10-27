import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  animate,
} from "motion/react";
import {
  ArrowUpRight,
  ChevronLeft,
  Code2,
  Minus,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { packages, type PackageId } from "../data/packages";
import { AutoHeight, EASE, SectionHead } from "./motion";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Phone({
  children,
  tone = "light",
  label,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  label: string;
}) {
  return (
    <div className={`device device-${tone}`} role="group" aria-label={label}>
      <div className="device-screen">
        <div className="device-island" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          disabled={o.disabled}
          onClick={() => onChange(o.id)}
        >
          {value === o.id && <motion.span layoutId={`seg-${id}`} className="seg-pill" transition={PILL} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

const PILL = { type: "spring", stiffness: 420, damping: 34 } as const;

/** Wrapping radio chips with a pill that slides to the chosen one. */
function Chips<T extends string>({
  options,
  value,
  onChange,
  labelledBy,
}: {
  options: readonly { id: T; label: string; note?: string }[];
  value: T;
  onChange: (id: T) => void;
  labelledBy: string;
}) {
  const id = useId();
  return (
    <div className="chip-grid" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={o.note ? "is-native" : undefined}
        >
          {value === o.id && <motion.span layoutId={`chip-${id}`} className="chip-pill" transition={PILL} />}
          <span>{o.label}</span>
          {o.note && <small>{o.note}</small>}
        </button>
      ))}
    </div>
  );
}

function CodeLine({ children }: { children: ReactNode }) {
  return (
    <code className="code-line" aria-label="Equivalent package call">
      {children}
    </code>
  );
}

function Recording({
  src,
  poster,
  label,
  cta = "Watch it on a real device",
}: {
  src: string;
  poster: string;
  label: string;
  cta?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="recording">
      <button
        type="button"
        className="recording-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={13} /> : <Play size={13} />}
        {open ? "Close recording" : cta}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="recording-frame"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <video
              key={src}
              src={src}
              poster={poster}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-label={label}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Theme transitions — pick an effect, tap the toggle in the app    */
/* ------------------------------------------------------------------ */

const effects = [
  { id: "circularReveal", label: "Circle in", video: "circle-in" },
  { id: "circularRevealInverse", label: "Circle out", video: "circle-out" },
  { id: "iris", label: "Iris", video: "iris" },
  { id: "wipe", label: "Wipe", video: "wipe" },
  { id: "split", label: "Split", video: "split" },
  { id: "barnDoor", label: "Barn door", video: "barn-door" },
  { id: "blinds", label: "Blinds", video: "blinds" },
  { id: "stripes", label: "Stripes", video: "stripes" },
  { id: "zoom", label: "Zoom", video: "zoom" },
  { id: "blur", label: "Blur", video: "blur" },
  { id: "fade", label: "Fade", video: "fade" },
  { id: "ripple", label: "Ripple", video: "ripple", note: "rec" },
  { id: "dissolve", label: "Dissolve", video: "dissolve", note: "rec" },
  { id: "pixelate", label: "Pixelate", video: "pixlated", note: "rec" },
  { id: "shatter", label: "Shatter", video: "shatter", note: "rec" },
  { id: "liquidGlass", label: "Liquid glass", video: "liquid-glass", note: "rec" },
] as const;
type EffectId = (typeof effects)[number]["id"];
const nativeOnly = new Set<EffectId>(["ripple", "dissolve", "pixelate", "shatter", "liquidGlass"]);
const posterOf = (video: string) => `/projects/theme-transition/${video === "circle-in" ? "poster" : `${video}-poster`}.webp`;

function ThemeScreen({
  dark,
  onToggle,
  interactive,
}: {
  dark: boolean;
  onToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  interactive: boolean;
}) {
  return (
    <div className={`theme-app ${dark ? "is-dark" : "is-light"}`}>
      <div className="theme-app-bar">
        <span>Playground</span>
        {interactive ? (
          <button
            type="button"
            className="theme-app-toggle"
            onClick={onToggle}
            aria-label={dark ? "Switch app to light theme" : "Switch app to dark theme"}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        ) : (
          <span className="theme-app-toggle" aria-hidden="true">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </span>
        )}
      </div>
      <p className="theme-app-copy">
        A theme can’t be interpolated. The screen is captured, the new theme
        renders underneath, and the platform animates the copy away.
      </p>
      <div className="theme-app-grid" aria-hidden="true">
        {["Fade", "Iris", "Wipe", "Blinds"].map((x) => (
          <span key={x}>
            <i />
            {x}
          </span>
        ))}
      </div>
      <div className="theme-app-tabs" aria-hidden="true">
        <i className="on" />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function effectFrames(effect: EffectId, ox: number, oy: number) {
  const at = `at ${ox}% ${oy}%`;
  switch (effect) {
    case "circularReveal":
      return { from: { clipPath: `circle(0% ${at})` }, to: { clipPath: `circle(150% ${at})` } };
    case "circularRevealInverse":
      return { from: { clipPath: `circle(150% ${at})` }, to: { clipPath: `circle(0% ${at})` } };
    case "iris":
      return {
        from: { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
        to: { clipPath: "polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)" },
      };
    case "wipe":
      return { from: { clipPath: "inset(0% 100% 0% 0%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" } };
    case "split":
      return { from: { clipPath: "inset(50% 0% 50% 0%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" } };
    case "barnDoor":
      return { from: { clipPath: "inset(0% 50% 0% 50%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" } };
    case "zoom":
      return { from: { opacity: 0, scale: 1.18 }, to: { opacity: 1, scale: 1 } };
    case "blur":
      return { from: { opacity: 0, filter: "blur(14px)" }, to: { opacity: 1, filter: "blur(0px)" } };
    default:
      return { from: { opacity: 0 }, to: { opacity: 1 } };
  }
}

/** One captured transition. Everything it needs is frozen at toggle time,
 *  so picking another effect afterwards never replays or retargets it. */
type Run = { id: number; effect: EffectId; from: boolean; to: boolean; ox: number; oy: number };

function ThemeDemo() {
  const reduced = useReducedMotion();
  const [effect, setEffect] = useState<EffectId>("circularReveal");
  const [dark, setDark] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const chosen = effects.find((e) => e.id === effect)!;
  const recordingOnly = nativeOnly.has(effect);

  function toggle(e?: React.MouseEvent<HTMLElement>) {
    const box = screenRef.current?.getBoundingClientRect();
    let ox = 86;
    let oy = 9;
    if (e && box) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      ox = Math.round(((r.left + r.width / 2 - box.left) / box.width) * 100);
      oy = Math.round(((r.top + r.height / 2 - box.top) / box.height) * 100);
    }
    const next = !dark;
    setDark(next);
    setRun(reduced ? null : { id: Date.now(), effect, from: dark, to: next, ox, oy });
  }
  // Collapse back to a single live screen once the captured run has played.
  useEffect(() => {
    if (!run) return;
    const strips = run.effect === "blinds" ? 8 : run.effect === "stripes" ? 6 : 0;
    const ms = strips ? (0.42 + (strips - 1) * 0.05) * 1000 : run.effect === "fade" ? 500 : 750;
    const id = window.setTimeout(() => setRun((r) => (r?.id === run.id ? null : r)), ms + 80);
    return () => clearTimeout(id);
  }, [run]);
  const pickEffect = (id: EffectId) => {
    setRun(null);
    setEffect(id);
  };

  let layers: ReactNode;
  if (!run) {
    layers = <ThemeScreen dark={dark} onToggle={toggle} interactive />;
  } else if (run.effect === "blinds" || run.effect === "stripes") {
    const vertical = run.effect === "stripes";
    const n = vertical ? 6 : 8;
    const step = 100 / n;
    layers = (
      <>
        <div aria-hidden="true">
          <ThemeScreen dark={run.from} interactive={false} />
        </div>
        {Array.from({ length: n }, (_, i) => {
          const a = i * step;
          const b = 100 - (i + 1) * step;
          const from = vertical ? `inset(0% ${100 - a}% 0% ${a}%)` : `inset(${a}% 0% ${100 - a}% 0%)`;
          const to = vertical ? `inset(0% ${b}% 0% ${a}%)` : `inset(${a}% 0% ${b}% 0%)`;
          return (
            <motion.div
              key={`${run.id}-${i}`}
              className="theme-layer-top"
              initial={{ clipPath: from }}
              animate={{ clipPath: to }}
              transition={{ duration: 0.42, delay: i * 0.05, ease: EASE }}
              aria-hidden={i !== n - 1}
            >
              <ThemeScreen dark={run.to} onToggle={toggle} interactive={i === n - 1} />
            </motion.div>
          );
        })}
      </>
    );
  } else {
    const inverse = run.effect === "circularRevealInverse";
    const frames = effectFrames(run.effect, run.ox, run.oy);
    const duration = run.effect === "fade" ? 0.5 : 0.75;
    layers = (
      <>
        {inverse ? (
          <ThemeScreen dark={run.to} onToggle={toggle} interactive />
        ) : (
          <div aria-hidden="true">
            <ThemeScreen dark={run.from} interactive={false} />
          </div>
        )}
        <motion.div
          key={run.id}
          className="theme-layer-top"
          initial={frames.from}
          animate={frames.to}
          transition={{ duration, ease: EASE }}
          aria-hidden={inverse}
          style={inverse ? { pointerEvents: "none" } : undefined}
        >
          <ThemeScreen dark={inverse ? run.from : run.to} onToggle={toggle} interactive={!inverse} />
        </motion.div>
      </>
    );
  }

  return (
    <div className="demo">
      <div className="demo-stage">
        <AnimatePresence mode="popLayout" initial={false}>
          {recordingOnly ? (
            <motion.div
              key="rec"
              className="stage-recording"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <video
                key={chosen.video}
                src={`/projects/theme-transition/${chosen.video}.mp4`}
                poster={posterOf(chosen.video)}
                autoPlay
                muted
                loop
                playsInline
                aria-label={`${chosen.label} effect recorded on iOS and Android`}
              />
              <span className="mono">iOS · Android — recorded on device</span>
            </motion.div>
          ) : (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Phone label="Theme transition preview" tone={dark ? "dark" : "light"}>
                <div className="theme-layers" ref={screenRef}>
                  {layers}
                </div>
              </Phone>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="demo-controls">
        <span className="control-label" id="effect-label">
          Pick an effect, then tap the moon in the app. The last five run only natively — you’ll see the
          recording.
        </span>
        <Chips options={effects} value={effect} onChange={pickEffect} labelledBy="effect-label" />
        <button type="button" className="demo-action" onClick={() => toggle()} disabled={recordingOnly}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          Switch to {dark ? "light" : "dark"}
        </button>
        <CodeLine>
          ThemeTransition.toggle({"{"} effect: '{effect}' {"}"})
        </CodeLine>
        <Recording
          src={`/projects/theme-transition/${recordingOnly ? "real-app" : chosen.video}.mp4`}
          poster={recordingOnly ? "/projects/theme-transition/real-app-poster.webp" : posterOf(chosen.video)}
          label={recordingOnly ? "Theme transitions inside a production app" : `${chosen.label} effect recorded on iOS and Android`}
          cta={recordingOnly ? "See it in a production app" : undefined}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Runtime RTL — type, add items, then flip. Nothing resets.        */
/* ------------------------------------------------------------------ */

const strings = {
  en: {
    title: "Checkout",
    note: "Delivery note",
    placeholder: "Leave it at the door",
    items: ["Linen shirt", "Leather tote"],
    total: "Total",
    pay: "Place order",
    currency: "JOD",
  },
  ar: {
    title: "الدفع",
    note: "ملاحظة التوصيل",
    placeholder: "اتركه عند الباب",
    items: ["قميص كتان", "حقيبة جلد"],
    total: "المجموع",
    pay: "إتمام الطلب",
    currency: "د.أ",
  },
};

function RTLDemo() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState([1, 2]);
  const [flips, setFlips] = useState(0);
  const t = strings[lang];
  const prices = [24, 38];
  const total = qty.reduce((s, q, i) => s + q * prices[i], 0);
  const set = (l: "en" | "ar") => {
    if (l === lang) return;
    setLang(l);
    setFlips((f) => f + 1);
  };
  return (
    <div className="demo">
      <div className="demo-stage">
        <Phone label="Runtime direction preview">
          <LayoutGroup>
            <div className="rtl-app" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
              <motion.div layout className="rtl-bar">
                <motion.span layout className="rtl-back" aria-hidden="true">
                  <ChevronLeft size={16} />
                </motion.span>
                <motion.strong layout="position">{t.title}</motion.strong>
                <motion.div layout className="rtl-lang">
                  <button type="button" aria-pressed={lang === "en"} onClick={() => set("en")}>
                    EN
                  </button>
                  <button type="button" aria-pressed={lang === "ar"} onClick={() => set("ar")}>
                    ع
                  </button>
                </motion.div>
              </motion.div>
              {t.items.map((name, i) => (
                <motion.div layout className="rtl-row" key={i}>
                  <motion.span layout className={`rtl-thumb t${i}`} aria-hidden="true" />
                  <motion.span layout="position" className="rtl-name">
                    {name}
                    <small>
                      {prices[i]} {t.currency}
                    </small>
                  </motion.span>
                  <motion.span layout className="rtl-stepper">
                    <button
                      type="button"
                      aria-label={`Fewer ${strings.en.items[i]}`}
                      onClick={() => setQty(qty.map((q, j) => (j === i ? Math.max(0, q - 1) : q)))}
                    >
                      <Minus size={12} />
                    </button>
                    <span aria-live="polite">{qty[i]}</span>
                    <button
                      type="button"
                      aria-label={`More ${strings.en.items[i]}`}
                      onClick={() => setQty(qty.map((q, j) => (j === i ? q + 1 : q)))}
                    >
                      <Plus size={12} />
                    </button>
                  </motion.span>
                </motion.div>
              ))}
              <motion.label layout="position" className="rtl-note">
                <span>{t.note}</span>
                <input
                  value={note}
                  maxLength={40}
                  placeholder={t.placeholder}
                  onChange={(e) => setNote(e.target.value)}
                />
              </motion.label>
              <motion.div layout className="rtl-total">
                <motion.span layout="position">{t.total}</motion.span>
                <motion.strong layout="position">
                  {total} {t.currency}
                </motion.strong>
              </motion.div>
              <motion.span layout className="rtl-pay">
                {t.pay}
              </motion.span>
            </div>
          </LayoutGroup>
        </Phone>
      </div>
      <div className="demo-controls">
        <span className="control-label">
          Change the quantities, write a note, then switch the language.
        </span>
        <Segmented
          label="App language"
          value={lang}
          onChange={set}
          options={[
            { id: "en", label: "English · LTR" },
            { id: "ar", label: "العربية · RTL" },
          ]}
        />
        <dl className="state-ledger" aria-live="polite">
          <div>
            <dt>Direction flips</dt>
            <dd>{flips}</dd>
          </div>
          <div>
            <dt>Remounts</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>Your note</dt>
            <dd>{note ? `“${note}”` : "empty"}</dd>
          </div>
          <div>
            <dt>Items in bag</dt>
            <dd>{qty[0] + qty[1]}</dd>
          </div>
        </dl>
        <CodeLine>await setRTL({lang === "ar" ? "true" : "false"})</CodeLine>
        <Recording
          src="/projects/rtl/demo.mp4"
          poster="/projects/rtl/demo-poster.webp"
          label="react-native-rtl flipping a real app at runtime"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Silk text — type your own words; a native-style counter rolls     */
/* ------------------------------------------------------------------ */

function SilkLine({
  text,
  unit,
  stagger,
}: {
  text: string;
  unit: "letters" | "words";
  stagger: number;
}) {
  const reduced = useReducedMotion();
  const parts = unit === "letters" ? [...text] : text.split(/(\s+)/);
  return (
    <span className="silk-line" aria-label={text}>
      {parts.map((part, i) => (
        <span className="silk-clip" key={`${text}-${i}`} aria-hidden="true">
          <motion.span
            initial={reduced ? false : { y: "105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay: reduced ? 0 : i * stagger,
            }}
          >
            {/\s/.test(part) ? " ".repeat(part.length) : part}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Odometer({ value }: { value: number }) {
  const digits = value.toLocaleString("en-US").split("");
  return (
    <span className="odometer" aria-label={value.toLocaleString("en-US")}>
      {digits.map((d, i) =>
        /\d/.test(d) ? (
          <span className="odo-digit" key={digits.length - i} aria-hidden="true">
            <motion.span
              animate={{ y: `${-Number(d) * 10}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            >
              {"0123456789".split("").map((n) => (
                <span key={n}>{n}</span>
              ))}
            </motion.span>
          </span>
        ) : (
          <span key={`s${digits.length - i}`} aria-hidden="true">
            {d}
          </span>
        ),
      )}
    </span>
  );
}

function TextDemo() {
  const [draft, setDraft] = useState("Hello, Amman.");
  const [text, setText] = useState("Hello, Amman.");
  const [unit, setUnit] = useState<"letters" | "words">("letters");
  const [stagger, setStagger] = useState(0.05);
  const [count, setCount] = useState(7500);
  useEffect(() => {
    const id = window.setTimeout(() => setText(draft.trim() || " "), 380);
    return () => clearTimeout(id);
  }, [draft]);
  const arabic = /[\u0600-\u06FF]/.test(text);
  // Arabic letters join to their neighbours; splitting them apart breaks the
  // shaping, so Arabic always animates word by word.
  const split = arabic ? "words" : unit;
  return (
    <div className="demo">
      <div className="demo-stage">
        <Phone label="Animated text preview" tone="dark">
          <div className="silk-app">
            <span className="silk-caption">AnimatedText</span>
            <div className="silk-display" dir={arabic ? "rtl" : "ltr"}>
              <SilkLine key={`${text}-${split}-${stagger}`} text={text} unit={split} stagger={stagger} />
            </div>
            <span className="silk-caption">AnimatedNumber · odometer</span>
            <div className="silk-counter">
              <Odometer value={count} />
              <small>orders shipped</small>
            </div>
            <button type="button" className="silk-add" onClick={() => setCount((c) => c + 250)}>
              <Plus size={14} /> Add 250
            </button>
          </div>
        </Phone>
      </div>
      <div className="demo-controls">
        <label className="field">
          <span className="control-label">Type something. It animates when you pause.</span>
          <input value={draft} maxLength={18} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <div className="chip-row">
          {["Ship it.", "مرحبا بالعالم", "Little details."].map((s) => (
            <button key={s} type="button" onClick={() => setDraft(s)}>
              {s}
            </button>
          ))}
        </div>
        <Segmented
          label="Split by"
          value={split}
          onChange={setUnit}
          options={[
            { id: "letters", label: "Letters", disabled: arabic },
            { id: "words", label: "Words" },
          ]}
        />
        <AnimatePresence initial={false}>
          {arabic && (
            <motion.p
              className="control-note"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              Arabic is a joined script, so it animates word by word. Splitting letters would break their shapes.
            </motion.p>
          )}
        </AnimatePresence>
        <label className="range">
          <span>
            Stagger <output>{stagger.toFixed(2)} s</output>
          </span>
          <input
            type="range"
            min={0.01}
            max={0.15}
            step={0.01}
            value={stagger}
            onChange={(e) => setStagger(Number(e.target.value))}
          />
        </label>
        <CodeLine>
          {"<AnimatedText animation={{ unit: '"}
          {split}
          {"', stagger: "}
          {stagger.toFixed(2)}
          {" }}>"}
        </CodeLine>
        <Recording
          src="/projects/silk-text/demo.mp4"
          poster="/projects/silk-text/demo-poster.webp"
          label="react-native-silk-text on iOS and Android"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Splash flow — launch from the home screen, choose the exit       */
/* ------------------------------------------------------------------ */

const exits = [
  { id: "slide-up", label: "Slide up" },
  { id: "slide-down", label: "Slide down" },
  { id: "fade", label: "Fade" },
  { id: "zoom-out", label: "Zoom out" },
  { id: "none", label: "None" },
] as const;
type ExitId = (typeof exits)[number]["id"];

function exitTarget(id: ExitId) {
  switch (id) {
    case "slide-up":
      return { y: "-100%" };
    case "slide-down":
      return { y: "100%" };
    case "fade":
      return { opacity: 0 };
    case "zoom-out":
      return { scale: 1.6, opacity: 0 };
    default:
      return { opacity: 0 };
  }
}

function SplashDemo() {
  const reduced = useReducedMotion();
  const [exit, setExit] = useState<ExitId>("slide-up");
  const [phase, setPhase] = useState<"home" | "splash" | "app">("home");
  useEffect(() => {
    if (phase !== "splash") return;
    const id = window.setTimeout(() => setPhase("app"), reduced ? 300 : 1500);
    return () => clearTimeout(id);
  }, [phase, reduced]);
  const instant = exit === "none" || reduced;
  return (
    <div className="demo">
      <div className="demo-stage">
        <Phone label="Native splash preview">
          <div className="splash-home" aria-hidden={phase !== "home"}>
            <span className="splash-clock">9:41</span>
            <div className="splash-grid">
              {Array.from({ length: 11 }, (_, i) => (
                <i key={i} className={`g${i % 5}`} />
              ))}
              <button
                type="button"
                className="splash-icon"
                onClick={() => setPhase("splash")}
                aria-label="Open the app"
                tabIndex={phase === "home" ? 0 : -1}
              >
                sa
              </button>
            </div>
            <span className="splash-hint">Tap the app to launch it</span>
          </div>
          {phase !== "home" && (
            <div className="splash-app">
              <div className="splash-app-bar">
                <strong>sa</strong>
                <span />
              </div>
              <div className="splash-app-hero" />
              <i />
              <i />
              <i className="short" />
              <button type="button" className="splash-close" onClick={() => setPhase("home")}>
                <RotateCcw size={13} /> Back to home screen
              </button>
            </div>
          )}
          <AnimatePresence>
            {phase === "splash" && (
              <motion.div
                key="splash"
                className="splash-overlay"
                style={{ transformOrigin: "50% 72%" }}
                initial={reduced ? { opacity: 1 } : { scale: 0.16, borderRadius: 60, opacity: 0.6 }}
                animate={{ scale: 1, borderRadius: 0, opacity: 1 }}
                exit={{
                  ...exitTarget(exit),
                  transition: { duration: instant ? 0 : 0.5, ease: [0.32, 0.72, 0, 1] },
                }}
                transition={{ type: "spring", stiffness: 210, damping: 26 }}
              >
                <svg viewBox="0 0 80 80" width="74" height="74" aria-hidden="true">
                  <motion.rect
                    x="6"
                    y="6"
                    width="68"
                    height="68"
                    rx="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                  />
                  <text x="40" y="49" textAnchor="middle" fontSize="26" fontWeight="800" fill="currentColor">
                    sa
                  </text>
                </svg>
                <span className="splash-loading">
                  <motion.i
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduced ? 0 : 1.3, ease: "linear" }}
                  />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Phone>
      </div>
      <div className="demo-controls">
        <span className="control-label" id="exit-label">
          Choose how the splash leaves, then launch the app.
        </span>
        <Chips options={exits} value={exit} onChange={setExit} labelledBy="exit-label" />
        <button
          type="button"
          className="demo-action"
          onClick={() => {
            setPhase("home");
            window.setTimeout(() => setPhase("splash"), 60);
          }}
        >
          <Play size={14} /> Launch the app
        </button>
        <ol className="phase-track" aria-label="Launch phases">
          <li data-on={phase === "home"}>Home screen</li>
          <li data-on={phase === "splash"}>Splash holds while loading</li>
          <li data-on={phase === "app"}>Exit reveals the app</li>
        </ol>
        <CodeLine>SplashFlow.setOptions({"{"} exitAnimation: '{exit}' {"}"})</CodeLine>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Parallax flow — actually scroll it; pull the header to zoom      */
/* ------------------------------------------------------------------ */

function ParallaxDemo() {
  const [factor, setFactor] = useState(0.5);
  const scroller = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scroller });
  const pull = useMotionValue(0);
  const headerH = 210;
  const headerY = useTransform(scrollY, (y) => y * (1 - factor));
  const scale = useTransform(pull, [0, 160], [1, 1.45]);
  const navOpacity = useTransform(scrollY, [110, 170], [0, 1]);
  const [atTop, setAtTop] = useState(true);
  useMotionValueEvent(scrollY, "change", (y) => setAtTop(y <= 1));
  const start = useRef<number | null>(null);

  return (
    <div className="demo">
      <div className="demo-stage">
        <Phone label="Parallax scroll preview">
          <motion.div className="px-nav" style={{ opacity: navOpacity }} aria-hidden="true">
            Atelier
          </motion.div>
          <div
            className="px-scroll"
            ref={scroller}
            tabIndex={0}
            aria-label="Scrollable parallax content"
            onPointerDown={(e) => {
              if (atTop && e.pointerType !== "mouse") return;
              if (atTop) {
                start.current = e.clientY;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }
            }}
            onPointerMove={(e) => {
              if (start.current === null) return;
              pull.set(Math.max(0, Math.min(180, (e.clientY - start.current) * 0.6)));
            }}
            onPointerUp={() => {
              start.current = null;
              animate(pull, 0, { type: "spring", stiffness: 300, damping: 26 });
            }}
            onTouchStart={(e) => {
              if (atTop) start.current = e.touches[0].clientY;
            }}
            onTouchMove={(e) => {
              if (start.current === null) return;
              const d = e.touches[0].clientY - start.current;
              if (d > 0) pull.set(Math.min(180, d * 0.6));
            }}
            onTouchEnd={() => {
              start.current = null;
              animate(pull, 0, { type: "spring", stiffness: 300, damping: 26 });
            }}
          >
            <div className="px-header" style={{ height: headerH }}>
              <motion.img
                src="/projects/aleena/atelier.jpg"
                alt=""
                style={{ y: headerY, scale, transformOrigin: "50% 0%" }}
                draggable={false}
              />
            </div>
            <div className="px-body">
              <span className="px-grip" aria-hidden="true" />
              <strong>The autumn atelier</strong>
              <p>
                Scroll inside the phone. The image moves at a fraction of the
                body’s speed, and the body slides up over it.
              </p>
              {Array.from({ length: 6 }, (_, i) => (
                <div className="px-card" key={i}>
                  <i />
                  <span>
                    <b />
                    <b className="short" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Phone>
      </div>
      <div className="demo-controls">
        <span className="control-label">
          Scroll inside the phone. At the top, drag the header down to zoom it.
        </span>
        <label className="range">
          <span>
            parallaxFactor <output>{factor.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
        </label>
        <p className="control-note">
          {factor >= 1
            ? "1 keeps pace with the body: no parallax."
            : factor === 0
              ? "0 freezes the header in place: maximum depth."
              : "Lower values move the header slower, so it feels further away."}
        </p>
        <button
          type="button"
          className="demo-action"
          onClick={() => {
            scroller.current?.scrollTo({ top: 0 });
            animate(pull, [0, 140, 0], { duration: 1.1, ease: EASE });
          }}
        >
          <Play size={14} /> Show pull-to-zoom
        </button>
        <CodeLine>
          {"<ParallaxScrollView headerHeight={"}
          {headerH}
          {"} parallaxFactor={"}
          {factor}
          {"}>"}
        </CodeLine>
        <Recording
          src="/projects/parallax/profile.mp4"
          poster="/projects/parallax/profile-poster.webp"
          label="react-native-parallax-flow profile example"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Pull flow — drive the state machine; swap the indicator          */
/* ------------------------------------------------------------------ */

const STATES = ["Idle", "Pulling", "Ready", "Settling", "Refreshing", "Completing"] as const;
type PullState = (typeof STATES)[number];
const indicators = [
  { id: "orbit", label: "Orbit" },
  { id: "ring", label: "Ring" },
  { id: "dots", label: "Dots" },
] as const;
type IndicatorId = (typeof indicators)[number]["id"];

function Indicator({
  kind,
  progress,
  state,
}: {
  kind: IndicatorId;
  progress: number;
  state: PullState;
}) {
  const spinning = state === "Refreshing" || state === "Settling";
  if (kind === "ring")
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" className={spinning ? "spin" : ""}>
        <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="3.5" />
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={94.2}
          strokeDashoffset={94.2 * (1 - (spinning ? 0.3 : progress))}
          transform="rotate(-90 20 20)"
        />
      </svg>
    );
  if (kind === "dots")
    return (
      <span className={`dots ${spinning ? "bounce" : ""}`}>
        {[0, 1, 2].map((i) => (
          <i key={i} style={{ transform: spinning ? undefined : `scale(${Math.min(1, progress * 3 - i)})` }} />
        ))}
      </span>
    );
  return (
    <svg
      viewBox="0 0 40 40"
      width="32"
      height="32"
      className={spinning ? "spin" : ""}
      style={{ transform: spinning ? undefined : `rotate(${progress * 180}deg)` }}
    >
      <circle cx="20" cy="20" r="4" fill="currentColor" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeOpacity=".2" />
      <circle cx="20" cy="7" r="3.2" fill="currentColor" opacity={Math.max(0.25, progress)} />
      <circle cx="31.3" cy="26.5" r="2.4" fill="currentColor" opacity={Math.max(0.2, progress * 0.8)} />
    </svg>
  );
}

function PullDemo() {
  const reduced = useReducedMotion();
  const [kind, setKind] = useState<IndicatorId>("orbit");
  const [state, setState] = useState<PullState>("Idle");
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState(["Order #2041 shipped", "Invoice paid", "Depot hours updated"]);
  const y = useMotionValue(0);
  const indicatorOpacity = useTransform(y, [0, 30], [0, 1]);
  const threshold = 96;
  const zone = 64;
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const fresh = useMemo(
    () => ["New delivery booked", "Asset inspected", "Off-hire confirmed", "Collection scheduled", "Quote approved"],
    [],
  );

  function refresh() {
    setState("Settling");
    animate(y, zone, { type: "spring", stiffness: 320, damping: 30 });
    const t = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduced ? ms / 4 : ms));
    t(() => setState("Refreshing"), 250);
    t(() => {
      setItems((list) => [fresh[(list.length - 3) % fresh.length], ...list].slice(0, 7));
      setState("Completing");
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }, 1500);
    t(() => {
      setState("Idle");
      setProgress(0);
    }, 1900);
  }

  const busy = state === "Settling" || state === "Refreshing" || state === "Completing";

  return (
    <div className="demo">
      <div className="demo-stage">
        <Phone label="Pull to refresh preview">
          <div className="pull-app">
            <div className="pull-bar">Activity</div>
            <div className="pull-zone" aria-hidden="true">
              <motion.span style={{ opacity: indicatorOpacity }}>
                <Indicator kind={kind} progress={progress} state={state} />
              </motion.span>
            </div>
            <motion.div
              className="pull-list"
              style={{ y, touchAction: "pan-x" }}
              drag={busy ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              dragSnapToOrigin
              onDrag={(_, info) => {
                const p = Math.max(0, Math.min(1, info.offset.y / threshold));
                setProgress(p);
                setState(p >= 1 ? "Ready" : p > 0 ? "Pulling" : "Idle");
              }}
              onDragEnd={(_, info) => {
                if (info.offset.y >= threshold) refresh();
                else {
                  setState("Idle");
                  setProgress(0);
                }
              }}
            >
              <span className="pull-hint">Drag the list down</span>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item}
                    className="pull-row"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <i />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </Phone>
      </div>
      <div className="demo-controls">
        <span className="control-label">
          Drag the list past the threshold. The package owns the physics; you draw the indicator.
        </span>
        <Segmented label="Indicator" value={kind} onChange={setKind} options={indicators} />
        <ol className="state-machine" aria-label="Refresh state machine" aria-live="polite">
          {STATES.map((s) => (
            <li key={s} data-on={s === state}>
              {s}
            </li>
          ))}
        </ol>
        <div className="pull-meter" aria-hidden="true">
          <motion.i animate={{ scaleX: busy ? 1 : progress }} transition={{ duration: 0.08 }} />
          <span>pullProgress {busy ? "1.00" : progress.toFixed(2)}</span>
        </div>
        <button type="button" className="demo-action" disabled={busy} onClick={refresh}>
          <RotateCcw size={14} /> Refresh without dragging
        </button>
        <CodeLine>{"<PullToRefresh threshold={96} renderIndicator={…}>"}</CodeLine>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Demo({ id }: { id: PackageId }) {
  switch (id) {
    case "theme":
      return <ThemeDemo />;
    case "rtl":
      return <RTLDemo />;
    case "text":
      return <TextDemo />;
    case "splash":
      return <SplashDemo />;
    case "parallax":
      return <ParallaxDemo />;
    case "pull":
      return <PullDemo />;
  }
}

export default function PackageLab() {
  const [selected, setSelected] = useState<PackageId>("theme");
  const [dir, setDir] = useState(1);
  const item = packages.find((p) => p.id === selected)!;
  const index = packages.findIndex((p) => p.id === selected);
  const pick = (id: PackageId) => {
    setDir(packages.findIndex((p) => p.id === id) > index ? 1 : -1);
    setSelected(id);
  };
  return (
    <section id="packages" className="section packages-section" aria-labelledby="pkg-title">
      <SectionHead
        index="02"
        label="Open source"
        id="pkg-title"
        title="Six packages, *built to be touched.*"
        intro={
          <p>
            React Native packages I wrote when a detail deserved a better primitive. Each one below is a browser
            study of the real API. Pick a package and use it.
          </p>
        }
      />
      <div className="package-tabs" role="tablist" aria-label="Packages">
        {packages.map((pkg, i) => (
          <button
            key={pkg.id}
            type="button"
            role="tab"
            id={`tab-${pkg.id}`}
            aria-selected={selected === pkg.id}
            aria-controls="package-panel"
            onClick={() => pick(pkg.id)}
          >
            {selected === pkg.id && <motion.span layoutId="pkg-pill" className="tab-pill" transition={PILL} />}
            <span className="mono">0{i + 1}</span>
            <span>{pkg.label}</span>
          </button>
        ))}
      </div>
      <div className="package-panel" id="package-panel" role="tabpanel" aria-labelledby={`tab-${selected}`}>
        <AutoHeight duration={0.6}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={selected}
              custom={dir}
              initial={{ opacity: 0, x: dir * 50, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -50, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="package-head">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <a
                  className="package-source"
                  href={`https://github.com/saleh2001k/${item.name}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={14} />
                  {item.name}
                  <ArrowUpRight size={13} />
                </a>
              </div>
              <Demo id={selected} />
              <span className="package-tech mono">{item.detail}</span>
            </motion.div>
          </AnimatePresence>
        </AutoHeight>
      </div>
    </section>
  );
}
