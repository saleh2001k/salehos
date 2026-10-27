import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;
const VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

/**
 * Word-by-word masked reveal. Wrap words in *asterisks* to set them in the
 * italic serif — e.g. "Selected *work*".
 */
export function RevealText({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.06,
  play,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Drive the reveal manually (e.g. after the intro curtain); otherwise on view. */
  play?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, VIEW);
  const reduced = useReducedMotion();
  const shown = play ?? inView;
  const segments = text.split("*");
  let index = 0;
  return (
    <Tag ref={ref} className={className} id={id} aria-label={text.replaceAll("*", "")}>
      {segments.map((seg, s) => (
        <Fragment key={s}>
          {seg
            .split(/(\s+)/)
            .filter(Boolean)
            .map((word, w) => {
              if (/^\s+$/.test(word)) return " ";
              const i = index++;
              return (
                <span className="rt-mask" key={`${s}-${w}`} aria-hidden="true">
                  <motion.span
                    className={s % 2 ? "rt-word serif" : "rt-word"}
                    initial={reduced ? false : { y: "115%", rotate: 6, filter: "blur(6px)" }}
                    animate={shown ? { y: "0%", rotate: 0, filter: "blur(0px)" } : undefined}
                    transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Fade + rise + un-blur when the block scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 34,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "p" | "span" | "section" | "article" | "figure";
}) {
  const reduced = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={reduced ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={VIEW}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

/**
 * Image that wipes open from the bottom on first view, then drifts against
 * the scroll (the frame moves at page speed, the picture slower).
 */
export function ParallaxImage({
  src,
  alt,
  className,
  strength = 9,
  width,
  height,
  priority,
  layoutId,
}: {
  src: string;
  alt: string;
  className?: string;
  strength?: number;
  width?: number;
  height?: number;
  priority?: boolean;
  layoutId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <motion.div
      ref={ref}
      layoutId={layoutId}
      className={`px-frame ${className ?? ""}`}
      initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0% round 18px)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 18px)" }}
      viewport={VIEW}
      transition={{ duration: 1.2, ease: EASE_IN_OUT }}
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        style={reduced ? undefined : { y, scale: 1 + strength / 50 }}
      />
    </motion.div>
  );
}

/** Video that only loads/plays while on screen. */
export function LazyVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { margin: "200px 0px" });
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView) {
      if (!v.src) v.src = src;
      v.play().catch(() => {});
    } else v.pause();
  }, [inView, src]);
  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Numbers, marquee, magnetic                                          */
/* ------------------------------------------------------------------ */

export function Counter({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, VIEW);
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, to, duration]);
  return (
    <span ref={ref} className="counter" aria-label={`${to}${suffix}`}>
      <span aria-hidden="true">
        {value}
        {suffix}
      </span>
    </span>
  );
}

/** Endless strip whose speed and direction follow the scroll velocity. */
export function Marquee({
  children,
  base = 2.2,
  reverse = false,
}: {
  children: ReactNode;
  base?: number;
  reverse?: boolean;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const skew = useTransform(smooth, [-2000, 0, 2000], [5, 0, -5]);
  const flip = reverse ? -1 : 1;
  const direction = useRef(flip);
  const xPct = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);
  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const f = factor.get();
    if (f < 0) direction.current = -flip;
    else if (f > 0) direction.current = flip;
    x.set(x.get() - direction.current * (base + Math.abs(f) * base) * (delta / 1000));
  });
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee-track" style={{ x: xPct, skewX: reduced ? 0 : skew }}>
        <div className="marquee-group">{children}</div>
        <div className="marquee-group">{children}</div>
      </motion.div>
    </div>
  );
}

/** Nudges its child toward the pointer — fine pointers only. */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.4 });
  return (
    <motion.span
      ref={ref}
      className="magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Animates its height to whatever its content measures. */
export function AutoHeight({
  children,
  className,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
      initial={false}
      animate={{ height }}
      transition={{ duration, ease: EASE }}
    >
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}

/** Section opener: index label with a drawn rule, then the title. */
export function SectionHead({
  index,
  label,
  title,
  intro,
  id,
}: {
  index: string;
  label: string;
  title: string;
  intro?: ReactNode;
  id?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="section-head">
      <div className="eyebrow">
        <span>({index})</span>
        <motion.i
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.1, ease: EASE_IN_OUT }}
        />
        <span>{label}</span>
      </div>
      <RevealText text={title} className="section-title" id={id} />
      {intro && (
        <Reveal className="section-intro" delay={0.2}>
          {intro}
        </Reveal>
      )}
    </div>
  );
}

/**
 * Wraps a section so the page moves between sections, not just within them.
 * Arriving, the content rises into place and (with `panel`) a full-bleed
 * backdrop opens from a rounded card to the screen edges; leaving, the
 * content sinks back and dims while the panel closes again.
 */
export function SectionFX({ children, panel = false }: { children: ReactNode; panel?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 20%"] });
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ["end 90%", "end start"] });
  const closed = useTransform([enter, leave], ([e, l]: number[]) => Math.max(1 - e, l));
  const clipPath = useTransform(closed, (k) => `inset(0px ${(k * 6).toFixed(2)}vw round ${Math.round(k * 64)}px)`);
  const y = useTransform([enter, leave], ([e, l]: number[]) => (1 - e) * 90 - l * 70);
  const scale = useTransform(leave, [0, 1], [1, 0.94]);
  const opacity = useTransform(leave, [0, 1], [1, 0.2]);
  if (reduced) return <div className={`section-fx ${panel ? "has-panel" : ""}`}>{children}</div>;
  return (
    <div ref={ref} className={`section-fx ${panel ? "has-panel" : ""}`}>
      {panel && <motion.div className="fx-panel" style={{ clipPath }} aria-hidden="true" />}
      <motion.div className="fx-content" style={{ y, scale, opacity, transformOrigin: "50% 100%" }}>
        {children}
      </motion.div>
    </div>
  );
}
