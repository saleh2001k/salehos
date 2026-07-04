import { ArrowUpRight, Github, Linkedin, Mail, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "../lib/sfx";
import { XIcon } from "./AppIcons";

/** Set once the visitor confirms leaving so the back guard stops re-arming. */
let leaving = false;

/** Confirmed exit: step back past the sentinel and the original entry. */
export function leaveSite() {
  leaving = true;
  history.go(-2);
}

/**
 * Traps browser back navigation behind an in-app handler. A sentinel history
 * entry is pushed on mount; every back press pops it, runs `onBack`, and
 * re-arms — so back closes overlays/apps instead of silently leaving the
 * site. `leaveSite()` is the only way out.
 */
export function useBackGuard(onBack: () => void) {
  const handler = useRef(onBack);
  handler.current = onBack;

  useEffect(() => {
    // Reloads land back on the sentinel entry — never stack a second one,
    // or leaveSite()'s go(-2) stops short of the real previous page.
    if (!(history.state as { salehos?: boolean } | null)?.salehos) {
      history.pushState({ salehos: true }, "");
    }
    const onPop = () => {
      if (leaving) return;
      history.pushState({ salehos: true }, "");
      handler.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
}

const nativeOpen = window.open.bind(window);

const isExternal = (href: string) => {
  if (/^(mailto:|tel:)/i.test(href)) return true;
  if (!/^https?:/i.test(href)) return false;
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
};

interface Destination {
  name: string;
  note: string;
  icon: ReactNode;
}

function describe(href: string): Destination {
  if (/^mailto:/i.test(href)) {
    return {
      name: "Mail",
      note: `Opens your mail app — ${href.replace(/^mailto:/i, "").split("?")[0]}.`,
      icon: <Mail size={22} />,
    };
  }
  if (/^tel:/i.test(href)) {
    return {
      name: "Phone",
      note: `Starts a call to ${href.replace(/^tel:/i, "")}.`,
      icon: <Phone size={22} />,
    };
  }
  const host = new URL(href).hostname.replace(/^www\./, "");
  if (host === "github.com") {
    return { name: "GitHub", note: "Opens github.com in a new tab.", icon: <Github size={22} /> };
  }
  if (host.endsWith("linkedin.com")) {
    return {
      name: "LinkedIn",
      note: "Opens linkedin.com in a new tab.",
      icon: <Linkedin size={22} />,
    };
  }
  if (host === "x.com" || host === "twitter.com") {
    return {
      name: "X",
      note: "Opens x.com in a new tab.",
      icon: <span className="h-5 w-5 *:h-full *:w-full"><XIcon /></span>,
    };
  }
  return { name: host, note: `Opens ${host} in a new tab.`, icon: <ArrowUpRight size={22} /> };
}

/**
 * Confirms before any action that leaves the site: external anchors are
 * intercepted with a capture-phase click listener, and programmatic
 * `window.open` calls (dock icons, Spotlight, the terminal's `open`) are
 * routed through a patched `window.open`. Same-origin links pass through.
 */
export function LeaveGuard({ variant }: { variant: "mac" | "ios" }) {
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      const href = anchor?.getAttribute("href") ?? "";
      if (!href || !isExternal(href)) return;
      event.preventDefault();
      event.stopPropagation();
      sfx.open();
      setPending(href);
    };
    document.addEventListener("click", onClick, true);

    window.open = ((url?: string | URL, target?: string, features?: string) => {
      const href = String(url ?? "");
      if (isExternal(href)) {
        sfx.open();
        setPending(href);
        return null;
      }
      return nativeOpen(url as string, target, features);
    }) as typeof window.open;

    return () => {
      document.removeEventListener("click", onClick, true);
      window.open = nativeOpen;
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPending(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  const go = () => {
    if (!pending) return;
    const href = pending;
    setPending(null);
    sfx.click();
    if (/^(mailto:|tel:)/i.test(href)) window.location.href = href;
    else nativeOpen(href, "_blank", "noopener,noreferrer");
  };

  const dest = pending ? describe(pending) : null;
  const ios = variant === "ios";

  return (
    <AnimatePresence>
      {pending && dest && (
        <motion.div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setPending(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Open ${dest.name}?`}
        >
          <motion.div
            className={`w-full overflow-hidden bg-[var(--panel)] text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl ${
              ios ? "max-w-[280px] rounded-3xl" : "max-w-[300px] rounded-2xl border border-white/10"
            }`}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={ios ? "px-4 pb-4 pt-5" : "px-5 pb-5 pt-6"}>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white">
                {dest.icon}
              </span>
              <h2 className="mt-3 text-[17px] font-semibold text-white">Open {dest.name}?</h2>
              <p className="mt-1 break-words text-[13px] leading-relaxed text-white/60">
                {dest.note}
              </p>
            </div>

            {ios ? (
              <div className="border-t border-white/10 text-[16px]">
                <button
                  type="button"
                  className="block w-full border-b border-white/10 px-4 py-3 font-semibold text-[#3b8af0] active:bg-white/10"
                  onClick={go}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-3 text-[#3b8af0] active:bg-white/10"
                  onClick={() => setPending(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-5 pb-5 text-[13px]">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#2a7de1] py-1.5 font-medium text-[#fff] hover:bg-[#3b8af0]"
                  onClick={go}
                >
                  Open {dest.name}
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg bg-white/10 py-1.5 text-white/85 hover:bg-white/20"
                  onClick={() => setPending(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
