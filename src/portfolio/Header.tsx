import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { ArrowUpRight, FileText } from "lucide-react";
import { site } from "../data/content";
import { CVButton } from "./CVModal";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "./Icons";
import { useScrollLock } from "./Modal";
import { EASE, EASE_IN_OUT } from "./motion";
import { isNavigating, scrollToSection, useActiveSection, useAmmanTime } from "./navigation";
import { toggleTheme, useTheme } from "./theme";

export const nav = [
  { id: "work", label: "Work" },
  { id: "packages", label: "Open source" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];
const navIds = nav.map((n) => n.id);

export const socials = [
  { label: "GitHub", href: site.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: site.linkedin, Icon: LinkedInIcon },
  { label: "X", href: site.x, Icon: XIcon },
];

/* ------------------------------------------------------------------ */

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";
  const t = { duration: 0.6, ease: EASE_IN_OUT };
  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <mask id={`moon-${className || "m"}`}>
          <rect width="24" height="24" fill="#fff" />
          <motion.circle
            r="7"
            fill="#000"
            initial={false}
            animate={dark ? { cx: 17, cy: 7 } : { cx: 30, cy: -6 }}
            transition={t}
          />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask={`url(#moon-${className || "m"})`}
          initial={false}
          animate={{ r: dark ? 8.5 : 4.6 }}
          transition={t}
        />
        <motion.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ rotate: dark ? 45 : 0, scale: dark ? 0.4 : 1, opacity: dark ? 0 : 1 }}
          transition={t}
          style={{ originX: "12px", originY: "12px" }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1="12"
              y1="2.2"
              x2="12"
              y2="4.2"
              transform={`rotate(${a} 12 12)`}
            />
          ))}
        </motion.g>
      </svg>
    </button>
  );
}

function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`socials ${className}`}>
      {socials.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="icon-btn">
          <Icon size={15} />
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SiteHeader() {
  const active = useActiveSection(navIds);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
    const delta = y - last.current;
    // Tuck away on a deliberate downward scroll, return on any upward one.
    if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 600 && !isNavigating());
    last.current = y;
  });

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setHidden(false);
    scrollToSection(id);
  };

  return (
    <>
      <motion.header
        className={`site-header ${scrolled ? "is-scrolled" : ""}`}
        initial={false}
        animate={{ y: hidden && !open ? "-130%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="header-shell">
          <a href="#top" className="mark" aria-label="Saleh Al-Mashni, back to top" onClick={go("top")}>
            <span className="mark-glyph" aria-hidden="true">
              sa
            </span>
            <span className="mark-name" aria-hidden="true">
              <span>Saleh Al-Mashni</span>
              <small>React Native · Frontend</small>
            </span>
          </a>

          <nav className="header-nav" aria-label="Main navigation">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                aria-current={active === n.id ? "location" : undefined}
                onClick={go(n.id)}
              >
                {active === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="nav-label">{n.label}</span>
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <SocialLinks className="header-socials" />
            <span className="header-divider" aria-hidden="true" />
            <ThemeToggle />
            <CVButton id="header" className="header-cv" radius={11}>
              <FileText size={14} />
              <span>View CV</span>
            </CVButton>
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-expanded={open}
              aria-controls="menu-screen"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
            >
              <span className={`burger ${open ? "is-open" : ""}`} aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
        <motion.i className="header-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </motion.header>
      <AnimatePresence>
        {open && <MenuScreen active={active} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Full-screen menu (phones)                                           */
/* ------------------------------------------------------------------ */

function MenuScreen({ active, onClose }: { active: string; onClose: () => void }) {
  useScrollLock();
  const time = useAmmanTime();
  return (
    <motion.div
      id="menu-screen"
      className="menu-screen"
      initial={{ clipPath: "circle(0% at calc(100% - 38px) 38px)" }}
      animate={{ clipPath: "circle(150% at calc(100% - 38px) 38px)" }}
      exit={{ clipPath: "circle(0% at calc(100% - 38px) 38px)", transition: { duration: 0.55, ease: EASE_IN_OUT, delay: 0.1 } }}
      transition={{ duration: 0.75, ease: EASE_IN_OUT }}
    >
      <nav aria-label="Main navigation" className="menu-links">
        {nav.map((n, i) => (
          <div className="rt-mask" key={n.id}>
            <motion.a
              href={`#${n.id}`}
              aria-current={active === n.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onClose();
                window.setTimeout(() => scrollToSection(n.id), 320);
              }}
              initial={{ y: "110%" }}
              animate={{ y: "0%", transition: { delay: 0.18 + i * 0.07, duration: 0.8, ease: EASE } }}
              exit={{ y: "110%", transition: { duration: 0.3, delay: i * 0.03 } }}
            >
              <small className="mono">0{i + 1}</small>
              {n.label}
            </motion.a>
          </div>
        ))}
      </nav>
      <motion.div
        className="menu-foot"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.6, ease: EASE } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        <div className="menu-row">
          <CVButton id="menu" className="pill-btn solid" radius={999} onOpen={onClose}>
            <FileText size={15} /> View CV
          </CVButton>
          <a className="pill-btn" href={site.whatsapp} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={15} /> WhatsApp
          </a>
        </div>
        <div className="menu-row">
          <SocialLinks />
          <ThemeToggle className="menu" />
        </div>
        <a className="menu-mail" href={`mailto:${site.email}`}>
          {site.email} <ArrowUpRight size={15} />
        </a>
        <span className="mono menu-time">Amman · {time}</span>
      </motion.div>
    </motion.div>
  );
}
