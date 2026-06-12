import { motion, useScroll, useTransform } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Github,
  GraduationCap,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCw,
  Share,
} from "lucide-react";
import { useRef } from "react";
import {
  about,
  certificates,
  education,
  experience,
  projects,
  site,
  skillGroups,
} from "../../data/content";
import { XIcon } from "../components/AppIcons";

function Reveal({
  children,
  root,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  root: React.RefObject<HTMLDivElement | null>;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ root, once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8aa42]">{children}</p>
  );
}

export function SafariApp() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });

  // Parallax layers: orbs drift at different speeds, hero sinks and fades.
  const orbSlow = useTransform(scrollY, [0, 900], [0, 140]);
  const orbFast = useTransform(scrollY, [0, 900], [0, -200]);
  const orbMid = useTransform(scrollY, [0, 900], [0, 90]);
  const heroY = useTransform(scrollY, [0, 500], [0, 130]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0.25]);
  const avatarScale = useTransform(scrollY, [0, 400], [1, 0.82]);

  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <div className="force-dark flex h-full flex-col">
      {/* Browser chrome */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-white/10 bg-[#1b1b20]/70 px-3 py-2">
        <ChevronLeft size={17} className="text-white/35" />
        <ChevronRight size={17} className="text-white/25" />
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/70">
          <Lock size={11} />
          saleh-almashni.dev
        </div>
        <RotateCw size={14} className="text-white/40" />
        <Share size={15} className="text-white/40" />
        <Plus size={16} className="text-white/40" />
      </div>

      {/* Page */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto bg-[#0b0b10]">
        {/* Parallax orbs */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] overflow-hidden">
          <motion.div
            style={{ y: orbSlow }}
            className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#e8aa42]/15 blur-3xl"
          />
          <motion.div
            style={{ y: orbFast }}
            className="absolute -right-20 top-44 h-80 w-80 rounded-full bg-[#5a3cb0]/25 blur-3xl"
          />
          <motion.div
            style={{ y: orbMid }}
            className="absolute left-1/3 top-[420px] h-64 w-64 rounded-full bg-[#2a7de1]/15 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 pb-16">
          {/* Hero */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="pt-16 text-center">
            <motion.div
              style={{ scale: avatarScale }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e8aa42_0%,#a8690f_100%)] font-display text-3xl font-semibold text-[#101013] shadow-[0_12px_40px_rgba(232,170,66,0.35)]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              SA
            </motion.div>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-white">
              {site.name}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#e8aa42]">{site.role}</p>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
              {site.tagline}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#e8aa42] px-4 py-2 text-sm font-medium text-[#101013] hover:bg-[#f0b755]"
              >
                <Mail size={15} />
                Get in Touch
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 hover:border-white/40"
              >
                <Github size={15} />
                GitHub
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 hover:border-white/40"
              >
                <Linkedin size={15} />
                LinkedIn
              </a>
              <a
                href={site.x}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 hover:border-white/40"
              >
                <span className="h-4 w-4 [&>*]:h-full [&>*]:w-full">
                  <XIcon />
                </span>
                @saleh_almashne
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/45">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {site.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={12} />
                {site.phone}
              </span>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-16 grid gap-3 sm:grid-cols-3">
            {about.stats.map((stat, index) => (
              <Reveal key={stat} root={scrollRef} delay={index * 0.08}>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-[13px] leading-snug text-white/80 backdrop-blur">
                  {stat}
                </div>
              </Reveal>
            ))}
          </div>

          {/* About */}
          <Reveal root={scrollRef} className="mt-16">
            <SectionLabel>About</SectionLabel>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">{about.paragraph}</p>
          </Reveal>

          {/* Experience */}
          <Reveal root={scrollRef} className="mt-16">
            <SectionLabel>Experience</SectionLabel>
          </Reveal>
          <div className="mt-4 space-y-3 border-l border-white/10 pl-5">
            {experience.map((item, index) => (
              <Reveal key={item.company} root={scrollRef} delay={index * 0.06}>
                <div className="relative rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="absolute -left-[26px] top-5 h-2 w-2 rounded-full bg-[#e8aa42] shadow-[0_0_10px_rgba(232,170,66,0.8)]" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-white">{item.company}</h3>
                    <span className="text-xs tabular-nums text-white/45">{item.period}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#e8aa42]">{item.role}</p>
                  <ul className="mt-2.5 space-y-1">
                    {item.bullets.slice(0, 3).map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-[13px] leading-relaxed text-white/65">
                        <span className="mt-[9px] h-px w-2.5 shrink-0 bg-[#e8aa42]/60" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Projects */}
          <Reveal root={scrollRef} className="mt-16">
            <SectionLabel>Featured Work</SectionLabel>
          </Reveal>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {featured.map((project, index) => (
              <Reveal key={project.title} root={scrollRef} delay={index * 0.07}>
                <div className="group h-full rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#e8aa42]/40">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium text-white">{project.title}</h3>
                    <span className="shrink-0 text-[11px] text-white/40">{project.tag}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-white/60">
                    {project.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.tech.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {rest.length > 0 && (
            <Reveal root={scrollRef} className="mt-3">
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">
                Plus {rest.map((project) => project.title).join(", ")} — open Finder → Projects for
                details.
              </div>
            </Reveal>
          )}

          {/* Skills */}
          <Reveal root={scrollRef} className="mt-16">
            <SectionLabel>Skills</SectionLabel>
          </Reveal>
          <div className="mt-4 space-y-4">
            {skillGroups.map((group, index) => (
              <Reveal key={group.label} root={scrollRef} delay={index * 0.05}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  {group.label}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          {/* Education */}
          <Reveal root={scrollRef} className="mt-16">
            <SectionLabel>Education & Certificates</SectionLabel>
          </Reveal>
          <div className="mt-4 space-y-2">
            {education.map((item) => (
              <Reveal key={item.title} root={scrollRef}>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <GraduationCap size={18} className="shrink-0 text-[#5aa7f2]" />
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-white/45">
                      {item.org}
                      {item.period ? ` · ${item.period}` : ""}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal root={scrollRef}>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {certificates.map((cert) => (
                  <span
                    key={cert.name}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/65"
                  >
                    {cert.name} · {cert.org}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Contact CTA */}
          <Reveal root={scrollRef} className="mt-16">
            <div className="rounded-2xl border border-[#e8aa42]/30 bg-[linear-gradient(135deg,rgba(232,170,66,0.12)_0%,rgba(42,125,225,0.08)_100%)] p-6 text-center">
              <h3 className="font-display text-xl font-semibold text-white">
                Let’s build something
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-white/60">
                Open the Contact app in the dock, or email {site.email} — replies are fast.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e8aa42] px-5 py-2 text-sm font-medium text-[#101013] hover:bg-[#f0b755]"
              >
                <Mail size={14} />
                {site.email}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
