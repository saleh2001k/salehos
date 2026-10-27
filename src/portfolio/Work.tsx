import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight, Layers3, Monitor, Plus, Smartphone } from "lucide-react";
import { projects } from "../data/content";
import { AutoHeight, EASE, EASE_IN_OUT, Reveal, RevealText, SectionHead } from "./motion";
import { leaveTo } from "./navigation";
import { ProjectCover, slugOf, useProjectModal } from "./ProjectModal";

const layers = [
  {
    id: "mobile",
    label: "Mobile app",
    icon: Smartphone,
    title: "A storefront that feels at home.",
    summary: "A React Native commerce experience, with the details treated as part of the product.",
    points: [
      "Arabic and English, with live direction changes that preserve screen state.",
      "Shopify customer sign-in with PKCE, cart flows, visual search, and checkout.",
      "MMKV-backed query hydration: useful content on the first render, refreshed in the background.",
    ],
    tags: ["React Native", "Expo", "TanStack Query", "MMKV"],
  },
  {
    id: "native",
    label: "Native layer",
    icon: Layers3,
    title: "When JavaScript isn’t the whole answer.",
    summary: "Platform-specific work in Swift, Objective-C, and Kotlin, connected to React Native.",
    points: [
      "Twelve seasonal app icons and launch artwork, switched natively for Ramadan, Eid, Founding Day, and more.",
      "Native splash choreography: the launch mark flies into the app header as the interface is revealed.",
      "Custom PassKit Apple Pay, camera shutter controls, and an adapted Expo module for Android predictive back.",
    ],
    tags: ["Swift", "Kotlin", "PassKit", "Expo Modules"],
  },
  {
    id: "web",
    label: "Web system",
    icon: Monitor,
    title: "Two apps. One shared foundation.",
    summary: "A Next.js storefront and admin dashboard, developed together in a Turborepo monorepo.",
    points: [
      "Five shared packages: storefront, UI, theme, localization, and configuration.",
      "The CMS preview renders the same storefront components, with commerce behavior supplied by the app.",
      "Arabic/English routing, shared motion primitives, theme transitions, and real-user Web Vitals collection.",
    ],
    tags: ["Next.js", "Turborepo", "Yarn workspaces", "next-intl"],
  },
] as const;
type LayerId = (typeof layers)[number]["id"];

/* ------------------------------------------------------------------ */
/* Aleena visuals                                                      */
/* ------------------------------------------------------------------ */

const slides = [
  { src: "/projects/aleena/arrival.webp", line: "Arrive in\nquiet luxury." },
  { src: "/projects/aleena/craft.webp", line: "Crafted for\nyour everyday." },
  { src: "/projects/aleena/atelier.jpg", line: "Every detail,\nconsidered." },
];

function MobileVisual() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % slides.length), 2800);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <div className="mobile-visual">
      <motion.div
        className="case-phone back"
        initial={{ rotate: 0, x: 0, opacity: 0 }}
        animate={{ rotate: 8, x: 70, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
      >
        <div className="cp-brand">ALEENA</div>
        <div className="cp-grid">
          {["look-2", "look-4", "look-7", "story-2"].map((s) => (
            <img key={s} src={`/projects/aleena/web/${s}.webp`} alt="" loading="lazy" />
          ))}
        </div>
      </motion.div>
      <motion.div
        className="case-phone front"
        initial={{ rotate: 0, y: 30 }}
        animate={{ rotate: -5, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={slides[i].src}
            src={slides[i].src}
            alt="Aleena onboarding artwork"
            initial={{ opacity: 0, scale: 1.18 }}
            animate={{ opacity: 1, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.8 }, scale: { duration: 3.4, ease: "linear" } }}
          />
        </AnimatePresence>
        <div className="cp-shade" />
        <div className="cp-brand light">ALEENA</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.strong
            key={i}
            initial={{ y: 16, opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -10, opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {slides[i].line}
          </motion.strong>
        </AnimatePresence>
        <div className="cp-dots">
          {slides.map((_, n) => (
            <i key={n} className={n === i ? "on" : ""}>
              {n === i && <motion.b layoutId="cp-dot" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            </i>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const nativeWork = [
  { k: "PassKit", v: "Apple Pay with native payment authorization", side: "iOS" },
  { k: "Launch flight", v: "The splash mark flies into the app header", side: "iOS · Android" },
  { k: "Camera controls", v: "Hardware shutter and capture controls", side: "iOS · Android" },
  { k: "Seasonal icons", v: "Twelve alternate app icons, switched natively", side: "iOS · Android" },
  { k: "Predictive back", v: "Adapted Expo module for the back gesture", side: "Android" },
];

function NativeVisual() {
  return (
    <div className="native-visual">
      <div className="nv-stack">
        <motion.div
          className="nv-node nv-js"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="mono">JavaScript</span>
          <strong>React Native · TypeScript</strong>
        </motion.div>
        <motion.i
          className="nv-link"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, ease: EASE_IN_OUT, delay: 0.2 }}
        />
        <div className="nv-pair">
          {[
            ["Swift", "iOS"],
            ["Kotlin", "Android"],
          ].map(([lang, os], i) => (
            <motion.div
              key={lang}
              className="nv-node"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.08 }}
            >
              <span className="mono">{os}</span>
              <strong>{lang}</strong>
            </motion.div>
          ))}
        </div>
      </div>
      <ul className="nv-list">
        {nativeWork.map((item, i) => (
          <motion.li
            key={item.k}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.35 + i * 0.06 }}
          >
            <span className="nv-k">{item.k}</span>
            <span className="nv-v">{item.v}</span>
            <span className="mono nv-side">{item.side}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const shop = {
  en: { nav: ["New in", "Dresses", "Edits"], hero: "The everyday\nwardrobe.", cta: "Shop now", url: "aleena.com/en" },
  ar: { nav: ["وصل حديثاً", "فساتين", "مختارات"], hero: "خزانة\nكل يوم.", cta: "تسوقي الآن", url: "aleena.com/ar" },
};

function WebVisual() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = shop[lang];
  return (
    <div className="web-visual">
      <motion.div
        className="browser dash"
        initial={{ x: 40, y: 30, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      >
        <div className="browser-bar">
          <i />
          <i />
          <i />
          <span>dashboard · CMS preview</span>
        </div>
        <div className="dash-body">
          <aside>
            {[0, 1, 2, 3, 4].map((n) => (
              <b key={n} className={n === 1 ? "on" : ""} />
            ))}
          </aside>
          <div className="dash-main">
            <span className="live-chip">
              <i /> Live preview
            </span>
            <img src="/projects/aleena/web/gal-new-in.webp" alt="" loading="lazy" />
          </div>
        </div>
      </motion.div>
      <motion.div
        className="browser store"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="browser-bar">
          <i />
          <i />
          <i />
          <motion.span layout="position">{t.url}</motion.span>
          <div className="lang-switch" role="radiogroup" aria-label="Storefront language">
            {(["en", "ar"] as const).map((l) => (
              <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)}>
                {lang === l && <motion.span layoutId="store-lang" className="ls-pill" />}
                <span>{l === "en" ? "EN" : "ع"}</span>
              </button>
            ))}
          </div>
        </div>
        <LayoutGroup id="store">
          <div className="store-body" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
            <motion.div layout className="store-nav" transition={{ duration: 0.6, ease: EASE }}>
              <motion.strong layout="position">ALEENA</motion.strong>
              <motion.span layout="position">{t.nav.join("   ")}</motion.span>
            </motion.div>
            <div className="store-hero">
              <img src="/projects/aleena/web/hero-street.webp" alt="Aleena storefront hero" loading="lazy" />
              <motion.div layout className="store-hero-copy" transition={{ duration: 0.6, ease: EASE }}>
                <motion.strong layout="position">{t.hero}</motion.strong>
                <motion.span layout="position">{t.cta}</motion.span>
              </motion.div>
            </div>
            <motion.div layout className="store-row" transition={{ duration: 0.6, ease: EASE }}>
              {["look-2", "gal-made-for-everyday", "look-7"].map((s) => (
                <motion.img layout key={s} src={`/projects/aleena/web/${s}.webp`} alt="" loading="lazy" />
              ))}
            </motion.div>
          </div>
        </LayoutGroup>
      </motion.div>
      <div className="shared-packages">
        {["storefront", "ui", "theme", "i18n", "config"].map((p, i) => (
          <motion.span
            key={p}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
          >
            @aleena/{p}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function AleenaVisual({ layer }: { layer: LayerId }) {
  if (layer === "native") return <NativeVisual />;
  if (layer === "web") return <WebVisual />;
  return <MobileVisual />;
}

/* ------------------------------------------------------------------ */

function SpeedyHireVisual() {
  return (
    <div className="speedy-visual" aria-hidden="true">
      <motion.div
        className="speedy-phone"
        initial={{ rotate: 0, y: 40 }}
        whileInView={{ rotate: 4, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
      >
        <div className="speedy-map">
          <svg viewBox="0 0 200 150" preserveAspectRatio="none">
            <path d="M-5 120 C 40 110, 60 60, 100 70 S 170 30, 210 20" />
            <motion.path
              className="route"
              d="M28 112 C 60 100, 78 70, 112 72 S 150 52, 168 40"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: EASE_IN_OUT, delay: 0.4 }}
            />
          </svg>
          <span className="pin pin-a" />
          <motion.span
            className="pin pin-b"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 2, stiffness: 400, damping: 14 }}
          />
        </div>
        <div className="speedy-sheet">
          <div className="speedy-head">
            <img src="/projects/speedy-logo.webp" alt="" />
            <small>Order SP-20418</small>
          </div>
          <strong>Out for delivery</strong>
          <div className="speedy-steps">
            <i className="done" />
            <i className="done" />
            <i className="now" />
            <i />
          </div>
          <div className="speedy-row">
            <span className="qr" />
            <span>
              <b />
              <b className="short" />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Earlier work — accordion with a cursor-following preview            */
/* ------------------------------------------------------------------ */

function HoverPreview({ src, x, y }: { src: string | null; x: MotionValue<number>; y: MotionValue<number> }) {
  const sx = useSpring(x, { stiffness: 220, damping: 26 });
  const sy = useSpring(y, { stiffness: 220, damping: 26 });
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1600, 0, 1600], [-12, 0, 12], { clamp: true });
  return (
    <motion.div className="hover-preview" style={{ x: sx, y: sy, rotate }} aria-hidden="true">
      <AnimatePresence>
        {src && (
          <motion.img
            key={src}
            src={src}
            alt=""
            initial={{ opacity: 0, scale: 0.6, clipPath: "inset(50% 50% 50% 50% round 14px)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 14px)" }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EarlierWork() {
  const { setOpen } = useProjectModal();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const older = projects.filter((p) =>
    ["NativeTide", "Balsam United", "Taj Alsafah", "Trevi", "MotorWheels", "Gomint", "Sipes"].includes(p.title),
  );
  const preview = older.find((p) => p.title === hover)?.media?.[0]?.src ?? null;

  return (
    <div className="earlier-work">
      <RevealText as="h3" text="More products I’ve *built*" className="sub-title" />
      <div
        className="project-list"
        ref={list}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = list.current!.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <HoverPreview src={expanded ? null : preview} x={x} y={y} />
        {older.map((project, i) => {
          const id = `project-${slugOf(project.title)}`;
          const isOpen = expanded === project.title;
          return (
            <Reveal className={`project-row ${isOpen ? "is-open" : ""}`} key={project.title} delay={i * 0.04} y={20}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setExpanded(isOpen ? null : project.title)}
                onPointerEnter={() => setHover(project.title)}
              >
                <span className="pr-index mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="pr-title">{project.title}</span>
                <span className="pr-tag">{project.tag}</span>
                <motion.span
                  className="pr-icon"
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Plus size={18} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={id}
                    className="pr-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.55, ease: EASE }, opacity: { duration: 0.35 } }}
                  >
                    <motion.div
                      className="pr-inner"
                      initial={{ y: -16, filter: "blur(6px)" }}
                      animate={{ y: 0, filter: "blur(0px)" }}
                      exit={{ y: -10, filter: "blur(4px)" }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <div>
                        {project.period && <span className="mono pr-period">{project.period}</span>}
                        <p>{project.description}</p>
                        <ul className="tag-list">
                          {project.tech.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      {project.media?.[0] && (
                        <button
                          type="button"
                          className="pr-thumb"
                          onClick={(e) => setOpen(slugOf(project.title), e.currentTarget)}
                          data-cursor="View"
                          aria-label={`Open ${project.title} gallery`}
                        >
                          <img src={project.media[0].src} alt="" loading="lazy" />
                          <span className="pill-btn solid sm">
                            View the build <ArrowUpRight size={13} />
                          </span>
                        </button>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function SelectedWork() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const layer = layers[active];
  const speedy = projects.find((p) => p.title === "Speedy Hire")!;
  const pick = (i: number) => {
    setDir(i > active ? 1 : -1);
    setActive(i);
  };
  return (
    <section id="work" className="section work-section" aria-labelledby="work-title">
      <SectionHead
        index="01"
        label="Selected work"
        id="work-title"
        title="Work that ships, *down to the native layer.*"
        intro={
          <p>
            Product work across mobile and web, the native code underneath it, and the systems that hold it
            together.
          </p>
        }
      />

      <Reveal as="article" className="case">
        <header className="case-heading">
          <div>
            <span className="mono">TGC · 2026 → now</span>
            <h3>Aleena</h3>
            <p>Commerce across a React Native app, a Next.js storefront, and an admin dashboard.</p>
          </div>
        </header>
        <div className="layer-switcher" role="tablist" aria-label="Aleena work areas">
          {layers.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => pick(index)}
            >
              {index === active && (
                <motion.span layoutId="layer-pill" className="seg-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <item.icon size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="case-body">
          <div className="case-visual">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                className="visual-inner"
                key={layer.id}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, filter: "blur(10px)", scale: 0.97 }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, x: dir * -60, filter: "blur(10px)", scale: 0.97 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <AleenaVisual layer={layer.id} />
              </motion.div>
            </AnimatePresence>
          </div>
          <AutoHeight className="case-writing-wrap">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={layer.id}
                className="case-writing"
                aria-live="polite"
                initial="hide"
                animate="show"
                exit="leave"
                variants={{
                  hide: {},
                  show: { transition: { staggerChildren: 0.06 } },
                  leave: { transition: { staggerChildren: 0.02 } },
                }}
              >
                {[
                  <h4 key="h">{layer.title}</h4>,
                  <p key="p">{layer.summary}</p>,
                  ...layer.points.map((point) => (
                    <p key={point} className="case-point">
                      {point}
                    </p>
                  )),
                  <div key="t" className="tech-line">
                    {layer.tags.join(" · ")}
                  </div>,
                ].map((child, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hide: { opacity: 0, y: 18, filter: "blur(6px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
                      leave: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } },
                    }}
                  >
                    {child}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </AutoHeight>
        </div>
      </Reveal>

      <Reveal as="article" className="case case-speedy">
        <header className="case-heading">
          <div>
            <span className="mono">Digital Gates · 2025 → 2026</span>
            <h3>Speedy Hire</h3>
            <p>The customer mobile app for a UK equipment-hire company, on iOS and Android.</p>
          </div>
        </header>
        <div className="case-body">
          <div className="case-visual speedy">
            <SpeedyHireVisual />
          </div>
          <div className="case-writing">
            <h4>Equipment hire, from order to off-hire.</h4>
            <p>{speedy.description}</p>
            <p className="case-point">Live order tracking on Google Maps, with off-hire and collection requests built into the same flow.</p>
            <p className="case-point">QR and barcode asset inspection with VisionCamera and custom camera controls.</p>
            <p className="case-point">Biometric sign-in, Azure AD B2C tokens in Keychain, and persisted TanStack Query caches.</p>
            <p className="case-point">Native splash and restart modules, a Unistyles dark theme, and a React Native 0.81 to 0.85 upgrade.</p>
            <div className="tech-line">{speedy.tech.join(" · ")}</div>
          </div>
        </div>
      </Reveal>

      <div className="independent-projects">
        <Reveal as="article" className="independent-project">
          <ProjectCover title="MacHarmony" src="/projects/macharmony/home.webp" alt="MacHarmony storage-cleaner dashboard" />
          <div className="project-title">
            <h3>MacHarmony</h3>
            <span className="mono">Native macOS app</span>
          </div>
          <p>
            A SwiftUI storage cleaner shipped end to end: Stripe checkout, Supabase auth, device-bound licenses,
            and Sparkle auto-updates. Nine screens inside.
          </p>
        </Reveal>
        <Reveal as="article" className="independent-project" delay={0.1}>
          <a
            href="/os"
            className="project-cover"
            aria-label="Open SalehOS"
            data-cursor="Open"
            onClick={(e) => {
              e.preventDefault();
              leaveTo("/os", "SalehOS");
            }}
          >
            <span className="cover-media">
              <img src="/projects/salehos.jpg" alt="SalehOS browser desktop with dock and windows" loading="lazy" />
            </span>
            <span className="image-action">
              <ArrowUpRight size={18} />
            </span>
          </a>
          <div className="project-title">
            <h3>SalehOS</h3>
            <span className="mono">Browser experiment</span>
          </div>
          <p>A working desktop in the browser: windows, a terminal, a virtual filesystem, and an arcade.</p>
        </Reveal>
      </div>

      <EarlierWork />
    </section>
  );
}
