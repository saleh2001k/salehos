import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Download, ExternalLink, Link2, Mail, Share2, X } from "lucide-react";
import { site } from "../data/content";
import { Modal } from "./Modal";
import { CVDocument } from "./CVDocument";
import { LinkedInIcon, WhatsAppIcon } from "./Icons";
import { EASE } from "./motion";

type Origin = { el: HTMLElement; radius: number };
const CVContext = createContext<(o: Origin) => void>(() => {});

export function CVProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<{ origin?: Origin } | null>(() =>
    new URLSearchParams(window.location.search).has("cv") ? {} : null,
  );
  return (
    <CVContext.Provider value={(origin) => setOpen({ origin })}>
      {children}
      <AnimatePresence>{open && <CVModal key="cv" origin={open.origin} onClose={() => setOpen(null)} />}</AnimatePresence>
    </CVContext.Provider>
  );
}

/** Button the résumé dialog grows out of (and shrinks back into). */
export function CVButton({
  id,
  className = "",
  children,
  radius = 12,
  onOpen,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  radius?: number;
  onOpen?: () => void;
}) {
  const setOpen = useContext(CVContext);
  return (
    <button
      type="button"
      className={`morph-button ${className}`}
      aria-haspopup="dialog"
      data-cv={id}
      onClick={(e) => {
        onOpen?.();
        setOpen({ el: e.currentTarget, radius });
      }}
    >
      <span className="morph-label">{children}</span>
    </button>
  );
}

const shareUrl = () => new URL("/?cv=1", window.location.origin).href;

function CVModal({ origin, onClose }: { origin?: Origin; onClose: () => void }) {
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (copied === "idle") return;
    const t = window.setTimeout(() => setCopied("idle"), 2400);
    return () => clearTimeout(t);
  }, [copied]);

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;
  const title = `${site.name} — Résumé`;

  async function copyLink() {
    const url = shareUrl();
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // Older or locked-down browsers: copy through a temporary field.
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(field);
      field.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      field.remove();
    }
    setCopied(ok ? "copied" : "failed");
    if (ok) setMenu(false);
  }

  function nativeShare() {
    setMenu(false);
    navigator.share({ title, url: shareUrl() }).catch(() => {
      /* dismissed */
    });
  }

  const text = encodeURIComponent(`${title}: ${shareUrl()}`);
  const targets = [
    {
      label: copied === "copied" ? "Link copied" : "Copy link",
      icon: copied === "copied" ? <Check size={16} /> : <Link2 size={16} />,
      onClick: copyLink,
    },
    { label: "Email", icon: <Mail size={16} />, href: `mailto:?subject=${encodeURIComponent(title)}&body=${text}` },
    { label: "WhatsApp", icon: <WhatsAppIcon size={16} />, href: `https://wa.me/?text=${text}` },
    {
      label: "LinkedIn",
      icon: <LinkedInIcon size={15} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl())}`,
    },
  ];

  return (
    <Modal onClose={onClose} label="Résumé" origin={origin?.el} originRadius={origin?.radius} className="cv-modal">
      <div className="cv-bar">
        <div className="cv-title">
          <span className="mono">(Résumé)</span>
          <strong>{site.name}</strong>
          <small>Updated October 2026</small>
        </div>
        <div className="cv-actions">
          <a className="pill-btn solid" href={site.cv} download data-autofocus>
            <Download size={15} />
            <span>Download PDF</span>
          </a>
          <div className="share-wrap">
            <button
              type="button"
              className="pill-btn"
              aria-expanded={menu}
              aria-haspopup="menu"
              onClick={() => setMenu(!menu)}
            >
              {copied === "copied" ? <Check size={15} /> : <Share2 size={15} />}
              <span>{copied === "copied" ? "Copied" : "Share"}</span>
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div
                  className="share-menu"
                  role="menu"
                  initial={{ opacity: 0, scale: 0.92, y: -6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  {targets.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.04 * i } }}
                    >
                      {t.href ? (
                        <a role="menuitem" href={t.href} target="_blank" rel="noreferrer" onClick={() => setMenu(false)}>
                          {t.icon}
                          {t.label}
                        </a>
                      ) : (
                        <button role="menuitem" type="button" onClick={t.onClick}>
                          {t.icon}
                          {t.label}
                        </button>
                      )}
                    </motion.div>
                  ))}
                  {copied === "failed" && (
                    <input
                      className="share-link"
                      readOnly
                      value={shareUrl()}
                      aria-label="Résumé link"
                      onFocus={(e) => e.currentTarget.select()}
                      autoFocus
                    />
                  )}
                  {canNativeShare && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.16 } }}>
                      <button role="menuitem" type="button" onClick={nativeShare}>
                        <Share2 size={16} />
                        More options…
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a className="icon-btn" href={shareUrl()} target="_blank" rel="noreferrer" aria-label="Open résumé in a new tab">
            <ExternalLink size={16} />
          </a>
          <button type="button" className="icon-btn cv-close" onClick={onClose} aria-label="Close résumé">
            <X size={17} />
          </button>
        </div>
      </div>
      <div className="cv-scroll">
        <motion.div
          className="cv-paper"
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          initial={{ rotateX: 14, y: 50, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
        >
          <CVDocument />
        </motion.div>
      </div>
    </Modal>
  );
}
