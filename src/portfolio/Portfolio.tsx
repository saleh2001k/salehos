import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpRight, Asterisk, Check, Copy, FileText, MapPin } from "lucide-react";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { certificates, education, experience, site, skillGroups } from "../data/content";
import { DotField, SnakeCard } from "./Arcade";
import ContactForm from "./ContactForm";
import { CVButton, CVProvider } from "./CVModal";
import { SiteHeader, socials } from "./Header";
import { WhatsAppIcon } from "./Icons";
import {
  Counter,
  EASE,
  EASE_IN_OUT,
  Magnetic,
  Marquee,
  ParallaxImage,
  Reveal,
  RevealText,
  SectionFX,
  SectionHead,
} from "./motion";
import { leaveTo, scrollToSection, useAmmanTime } from "./navigation";
import { CursorLabel, Curtain, Preloader, shouldPlayIntro, WhatsAppButton } from "./Overlays";
import PackageLab from "./PackageLab";
import PaperStack from "./PaperStack";
import { ProjectProvider } from "./ProjectModal";
import SelectedWork from "./Work";
import "./portfolio.css";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Letters({ text, play, delay = 0, className }: { text: string; play: boolean; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span className={className} aria-hidden="true">
      {text.split("").map((ch, i) => (
        <span className="rt-mask" key={i}>
          <motion.span
            initial={reduced ? false : { y: "105%", rotate: 8 }}
            animate={play ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.045 }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const time = useAmmanTime();
  const [playing, setPlaying] = useState(false);
  const exit = useCallback(() => setPlaying(false), []);
  const play = () => {
    if (window.scrollY > 4) {
      scrollToSection("top");
      window.setTimeout(() => setPlaying(true), 700);
    } else setPlaying(true);
  };
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x1 = useTransform(p, [0, 1], ["0%", "-14%"]);
  const x2 = useTransform(p, [0, 1], ["0%", "12%"]);
  const nameY = useTransform(p, [0, 1], ["0%", "40%"]);
  const paperY = useTransform(p, [0, 1], [0, -160]);
  const copyY = useTransform(p, [0, 1], [0, -60]);
  const fade = useTransform(p, [0, 0.7], [1, 0]);
  const show = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 24, filter: "blur(8px)" },
    animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section className={`hero ${playing ? "is-playing" : ""}`} ref={ref} aria-labelledby="name">
      <DotField playing={playing} onExit={exit} />
      <motion.div className="hero-meta mono" {...show(0.1)}>
        <span>(Portfolio ©2026)</span>
        <span className="hide-sm">
          <MapPin size={12} /> Amman, Jordan · {time}
        </span>
        <span className="status">
          <i /> Open to remote roles
        </span>
      </motion.div>

      <motion.h1 id="name" className="hero-name" aria-label={site.name} style={reduced ? undefined : { y: nameY }}>
        <motion.span className="hn-line" style={reduced ? undefined : { x: x1 }}>
          <Letters text="Saleh" play={ready} delay={0.05} />
        </motion.span>
        <motion.span className="hn-line hn-second" style={reduced ? undefined : { x: x2 }}>
          <Letters text="Al-Mashni" play={ready} delay={0.25} className="serif" />
        </motion.span>
      </motion.h1>

      <div className="hero-body">
        <motion.div className="hero-copy" style={reduced ? undefined : { y: copyY, opacity: fade }}>
          <motion.h2 {...show(0.55)}>{site.role}</motion.h2>
          <motion.p {...show(0.65)}>{site.tagline}</motion.p>
          <motion.div className="hero-actions" {...show(0.75)}>
            <Magnetic>
              <a href={`mailto:${site.email}`} className="pill-btn solid lg">
                Email me <ArrowUpRight size={16} />
              </a>
            </Magnetic>
            <Magnetic>
              <CVButton id="hero" className="pill-btn lg" radius={999}>
                <FileText size={15} /> View CV
              </CVButton>
            </Magnetic>
          </motion.div>
          <motion.div className="hero-launch" {...show(0.85)}>
            <a
              href="/os"
              className="launch-card featured"
              data-cursor="Open"
              onClick={(e) => {
                e.preventDefault();
                leaveTo("/os", "SalehOS");
              }}
            >
              <span className="launch-thumb os-thumb">
                <img src="/projects/salehos.jpg" alt="" width="1600" height="1004" />
              </span>
              <span className="launch-text">
                <span className="mono launch-tag">(Featured)</span>
                <strong>Open SalehOS</strong>
                <small>A whole desktop in your browser</small>
              </span>
              <ArrowUpRight size={16} className="launch-arrow" />
            </a>
            <SnakeCard onPlay={play} />
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-object"
          style={reduced ? undefined : { y: paperY }}
          initial={reduced ? false : { opacity: 0, scale: 0.9, rotate: -4 }}
          animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.2, ease: EASE, delay: 0.45 }}
        >
          <PaperStack progress={scrollYProgress} />
        </motion.div>
      </div>

      <motion.dl className="hero-facts" {...show(0.95)}>
        <div>
          <dt>
            <Counter to={10} suffix="+" />
          </dt>
          <dd>Apps shipped to the App Store and Google Play</dd>
        </div>
        <div>
          <dt>
            <Counter to={6} />
          </dt>
          <dd>Open-source React Native packages</dd>
        </div>
        <div>
          <dt>
            <Counter to={4} suffix="+" />
          </dt>
          <dd>Years across iOS, Android, and the web</dd>
        </div>
        <div>
          <dt>Now</dt>
          <dd>Senior engineer at TGC, building Aleena</dd>
        </div>
      </motion.dl>

      <motion.a
        href="#work"
        className="scroll-cue mono"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("work");
        }}
        style={{ opacity: fade }}
        aria-label="Scroll to work"
      >
        <span>Scroll</span>
        <i>
          <ArrowDown size={13} />
        </i>
      </motion.a>
    </section>
  );
}

const stack = [
  "React Native",
  "Swift",
  "Kotlin",
  "TypeScript",
  "Next.js",
  "Expo",
  "Reanimated",
  "Nitro Modules",
  "SwiftUI",
  "Jetpack Compose",
  "Turborepo",
  "Fabric",
];

/* ------------------------------------------------------------------ */
/* Tapes — two marquees crossing between sections, tilting with scroll */
/* ------------------------------------------------------------------ */

const tapeWords = ["Open to remote roles", "React Native", "Native modules", "Amman, Jordan", "Let’s build something"];

function Tapes() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], [-7, 3]);
  const b = useTransform(scrollYProgress, [0, 1], [6, -3]);
  const items = tapeWords.map((w) => (
    <span key={w} className="tape-item">
      {w}
      <Asterisk size={18} strokeWidth={1.75} aria-hidden="true" />
    </span>
  ));
  return (
    <div className="tapes" ref={ref} aria-hidden="true">
      <motion.div className="tape tape-a" style={reduced ? { rotate: -3 } : { rotate: a }}>
        <Marquee base={1.6}>{items}</Marquee>
      </motion.div>
      <motion.div className="tape tape-b" style={reduced ? { rotate: 3 } : { rotate: b }}>
        <Marquee base={1.6} reverse>
          {items}
        </Marquee>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

function Experience() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 75%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  return (
    <section id="experience" className="section experience-section" aria-labelledby="exp-title">
      <SectionHead
        index="03"
        label="Experience"
        id="exp-title"
        title="The teams, products, and *platforms* along the way."
      />
      <ol className="timeline" ref={list}>
        <motion.i className="timeline-line" style={{ scaleY: line }} aria-hidden="true" />
        {experience.map((job, index) => (
          <li className="experience-item" key={job.company}>
            <div className="experience-date">
              <Reveal y={12}>
                <span className={index === 0 ? "timeline-dot current" : "timeline-dot"} />
                <span className="mono">{job.period}</span>
              </Reveal>
            </div>
            <div className="experience-content">
              <div className="experience-heading">
                <RevealText as="h3" text={job.company.startsWith("ASAC") ? "ASAC" : job.company} />
                {index === 0 && (
                  <motion.span
                    className="current-role"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.4 }}
                  >
                    Current
                  </motion.span>
                )}
              </div>
              <Reveal y={16} delay={0.1}>
                <h4>
                  {job.role}
                  {job.location && <span>{job.location}</span>}
                </h4>
              </Reveal>
              <ul>
                {job.bullets.map((bullet, i) => (
                  <Reveal as="li" key={bullet} delay={0.15 + i * 0.06} y={18}>
                    {bullet}
                  </Reveal>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Toolkit                                                             */
/* ------------------------------------------------------------------ */

function Toolkit() {
  return (
    <section className="section toolkit-section" aria-labelledby="toolkit-title">
      <SectionHead index="04" label="Toolkit" id="toolkit-title" title="Tools I *reach for.*" />
      <div className="toolkit-grid">
        <div className="toolkit-column">
          {skillGroups.slice(0, 4).map((group, g) => (
            <div className="skill-group" key={group.label}>
              <Reveal as="span" className="mono skill-label" y={10}>
                {group.label}
              </Reveal>
              <ul>
                {group.skills.map((s, i) => (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, y: 14, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={{ duration: 0.45, ease: EASE, delay: g * 0.05 + i * 0.035 }}
                    whileHover={{ y: -3 }}
                  >
                    {s}
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="education-column">
          <Reveal as="span" className="mono skill-label">
            Education
          </Reveal>
          {education.map((item, i) => (
            <Reveal className="education-item" key={item.title} delay={i * 0.08}>
              <h3>{item.title}</h3>
              <p>
                {item.org}
                {item.period && <small>{item.period}</small>}
              </p>
            </Reveal>
          ))}
          <Reveal as="span" className="mono skill-label cert-heading">
            Certifications
          </Reveal>
          <ul className="certificates">
            {certificates.map((cert, i) => (
              <Reveal as="li" key={cert.name} delay={i * 0.06} y={12}>
                {cert.name}
                <span>{cert.org}</span>
              </Reveal>
            ))}
          </ul>
          <figure className="portrait">
            <ParallaxImage src={site.photo} alt="Saleh outdoors in Jordan" width={1000} height={1334} strength={10} />
            <figcaption className="mono">(Away from the keyboard, in Jordan)</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact + footer                                                    */
/* ------------------------------------------------------------------ */

function Contact() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 30%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [80, 28]);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (copied === "idle") return;
    const t = window.setTimeout(() => setCopied("idle"), 2600);
    return () => clearTimeout(t);
  }, [copied]);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  }
  return (
    <motion.section
      id="contact"
      ref={ref}
      className="section contact-section"
      aria-labelledby="contact-title"
      style={reduced ? undefined : { scale, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
    >
      <div className="eyebrow invert">
        <span>(05)</span>
        <motion.i
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE_IN_OUT }}
        />
        <span>Contact</span>
      </div>
      <div className="contact-grid">
        <div className="contact-lead">
          <RevealText text="Have something in *mind?* Let’s talk." className="contact-title" id="contact-title" />
          <Reveal delay={0.2}>
            <p>I reply to every message, usually within a day. Pick whatever is easiest for you.</p>
          </Reveal>
          <Reveal className="contact-email" delay={0.3}>
            <a href={`mailto:${site.email}`}>
              {site.email}
              <ArrowUpRight size={20} />
            </a>
            <button type="button" className="icon-btn invert" onClick={copyEmail} aria-label="Copy email address">
              {copied === "copied" ? <Check size={17} /> : <Copy size={17} />}
            </button>
          </Reveal>
          <span className="copy-feedback" role="status">
            {copied === "copied"
              ? "Email copied."
              : copied === "failed"
                ? "Copy isn’t available here. Use the email link instead."
                : ""}
          </span>
          <Reveal className="contact-channels" delay={0.4}>
            <a href={site.whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">
                <Icon size={15} /> {label}
              </a>
            ))}
            <a href={site.phoneHref}>{site.phone}</a>
          </Reveal>
          <Reveal delay={0.5}>
            <CVButton id="contact" className="pill-btn invert-ghost" radius={999}>
              <FileText size={15} /> View CV
            </CVButton>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <ContactForm />
        </Reveal>
      </div>
      <Footer />
    </motion.section>
  );
}

function Footer() {
  const time = useAmmanTime();
  const reduced = useReducedMotion();
  // Watch the row, not the letters: each letter starts tucked inside its
  // clipping mask, so on its own it never registers as visible.
  const name = useRef<HTMLDivElement>(null);
  const shown = useInView(name, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <footer className="site-footer">
      <div className="footer-row mono">
        <span>{site.footerLine}</span>
        <span>Amman · {time}</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("top");
          }}
        >
          Back to top <ArrowUp size={13} />
        </a>
      </div>
      <div className="footer-name" aria-hidden="true" ref={name}>
        {"Saleh Al-Mashni".split("").map((ch, i) => (
          <span className="rt-mask" key={i}>
            <motion.span
              className={i > 5 ? "serif" : undefined}
              initial={reduced ? false : { y: "100%" }}
              animate={shown ? { y: "0%" } : undefined}
              transition={{ duration: 1, ease: EASE, delay: i * 0.035 }}
            >
              {ch === " " ? "\u00a0" : ch}
            </motion.span>
          </span>
        ))}
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function Portfolio() {
  const [intro] = useState(shouldPlayIntro);
  const [ready, setReady] = useState(!intro);
  const done = useCallback(() => setReady(true), []);

  useEffect(() => {
    // Honour #section links on first load, after layout settles.
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <CVProvider>
      <ProjectProvider>
        <div className="cv-app" id="top">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">
            <Hero ready={ready} />
            <div className="marquee-band">
              <Marquee>
                {stack.map((s) => (
                  <span key={s} className="mq-item">
                    {s}
                    <Asterisk size={28} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                ))}
              </Marquee>
            </div>
            <SectionFX>
              <SelectedWork />
            </SectionFX>
            <SectionFX panel>
              <PackageLab />
            </SectionFX>
            <Tapes />
            <SectionFX>
              <Experience />
            </SectionFX>
            <SectionFX panel>
              <Toolkit />
            </SectionFX>
            <Contact />
          </main>
          <WhatsAppButton show={ready} />
          <CursorLabel />
          <Curtain />
          {intro && <Preloader onDone={done} />}
          <div className="grain" aria-hidden="true" />
        </div>
      </ProjectProvider>
    </CVProvider>
  );
}
