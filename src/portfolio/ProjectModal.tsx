import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { projects, type Project } from "../data/content";
import { Modal } from "./Modal";
import { EASE } from "./motion";

export const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

type Open = { slug: string; el: HTMLElement | null };
const ProjectContext = createContext<{ setOpen: (slug: string, el?: HTMLElement | null) => void }>({
  setOpen: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Open | null>(null);
  const project = projects.find((p) => slugOf(p.title) === open?.slug);
  return (
    <ProjectContext.Provider value={{ setOpen: (slug, el = null) => setOpen({ slug, el }) }}>
      {children}
      <AnimatePresence>
        {project && open && (
          <ProjectModal key={open.slug} project={project} origin={open.el} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </ProjectContext.Provider>
  );
}

export const useProjectModal = () => useContext(ProjectContext);

/** Cover image the project dialog grows out of. */
export function ProjectCover({
  title,
  src,
  alt,
  className = "",
  position,
}: {
  title: string;
  src: string;
  alt: string;
  className?: string;
  position?: string;
}) {
  const { setOpen } = useProjectModal();
  return (
    <button
      type="button"
      className={`project-cover ${className}`}
      onClick={(e) => setOpen(slugOf(title), e.currentTarget)}
      aria-label={`Open ${title} gallery`}
      aria-haspopup="dialog"
      data-cursor="View"
    >
      <span className="cover-media">
        <img src={src} alt={alt} loading="lazy" decoding="async" style={{ objectPosition: position }} />
      </span>
    </button>
  );
}

function ProjectModal({
  project,
  origin,
  onClose,
}: {
  project: Project;
  origin: HTMLElement | null;
  onClose: () => void;
}) {
  const media = project.media ?? [];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (next: number) => {
    if (!media.length) return;
    setDir(next > index ? 1 : -1);
    setIndex((next + media.length) % media.length);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const item = media[index];
  return (
    <Modal onClose={onClose} label={`${project.title} gallery`} className="project-modal" origin={origin} originRadius={16}>
      <div className="pm-grid">
        <div className="pm-media">
          <div className={`pm-stage ${item?.tall ? "is-tall" : ""}`}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              {item && (
                <motion.div
                  key={item.src}
                  className="pm-slide"
                  custom={dir}
                  initial={{ x: `${dir * 30}%`, opacity: 0, filter: "blur(10px)" }}
                  animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ x: `${dir * -30}%`, opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  {item.type === "video" ? (
                    <video src={item.src} poster={item.poster} autoPlay muted loop playsInline aria-label={item.alt} />
                  ) : (
                    <img src={item.src} alt={item.alt} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {media.length > 1 && (
              <div className="pm-arrows">
                <button type="button" className="icon-btn glass" onClick={() => go(index - 1)} aria-label="Previous image">
                  <ArrowLeft size={16} />
                </button>
                <span className="mono">
                  {String(index + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
                </span>
                <button type="button" className="icon-btn glass" onClick={() => go(index + 1)} aria-label="Next image">
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
          {media.length > 1 && (
            <motion.div
              className="pm-thumbs"
              role="tablist"
              aria-label="Gallery"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              {media.map((m, i) => (
                <button
                  key={m.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={m.alt}
                  onClick={() => go(i)}
                >
                  <img src={m.poster ?? m.src} alt="" loading="lazy" />
                  {i === index && <motion.span layoutId="pm-thumb-ring" className="thumb-ring" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        <motion.div
          className="pm-info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.6, ease: EASE } }}
          exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
        >
          <div className="pm-top">
            <span className="mono">({project.tag})</span>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" data-autofocus>
              <X size={17} />
            </button>
          </div>
          <h3>{project.title}</h3>
          {project.period && <span className="pm-period">{project.period}</span>}
          <p>{project.description}</p>
          <ul className="tag-list">
            {project.tech.map((t, i) => (
              <motion.li key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.04 } }}>
                {t}
              </motion.li>
            ))}
          </ul>
          {item && <p className="pm-caption">{item.alt}</p>}
          {project.link && (
            <a className="pill-btn solid" href={project.link} target={project.link.startsWith("/") ? undefined : "_blank"} rel="noreferrer">
              {project.link.startsWith("/") ? "Open it" : "View source"} <ArrowUpRight size={15} />
            </a>
          )}
        </motion.div>
      </div>
    </Modal>
  );
}
