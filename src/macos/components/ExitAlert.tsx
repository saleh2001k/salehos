import { Hand } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { site } from "../../data/content";
import { sfx } from "../lib/sfx";

const CV_URL = "/Saleh_Al-Mashni_Resume_2026.pdf";

/** Set once the visitor confirms leaving so the guard stops re-arming. */
let leaving = false;

/** Confirmed exit: step back past the sentinel and the original entry. */
export function leaveSite() {
  leaving = true;
  history.go(-2);
}

/**
 * Traps browser back navigation behind an in-app handler. A sentinel history
 * entry is pushed on mount; every back press pops it, runs `onBack`, and
 * re-arms — so back closes overlays/apps (or raises the exit alert) instead
 * of silently leaving the site. `leaveSite()` is the only way out.
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

/**
 * Desktop exit intent: the pointer darting past the top of the viewport
 * (toward the close button / URL bar) fires `onIntent` once per session.
 */
export function useExitIntent(onIntent: () => void) {
  const handler = useRef(onIntent);
  handler.current = onIntent;

  useEffect(() => {
    const onLeave = (event: MouseEvent) => {
      if (event.relatedTarget || event.clientY > 0) return;
      try {
        if (sessionStorage.getItem("exit-intent-shown")) return;
        sessionStorage.setItem("exit-intent-shown", "1");
      } catch {
        /* private mode — show at most once per load instead */
      }
      handler.current();
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => document.documentElement.removeEventListener("mouseleave", onLeave);
  }, []);
}

interface ExitAlertProps {
  open: boolean;
  variant: "mac" | "ios";
  onStay: () => void;
}

/** Platform-styled "leaving already?" dialog with CV + contact escape hatches. */
export function ExitAlert({ open, variant, onStay }: ExitAlertProps) {
  useEffect(() => {
    if (!open) return;
    sfx.open();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") onStay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const ios = variant === "ios";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onStay}
          role="dialog"
          aria-modal="true"
          aria-label="Before you go"
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
              <span className="relative mx-auto block h-14 w-14">
                <img
                  src={site.photo}
                  alt={site.name}
                  className="h-full w-full rounded-full border-2 border-[#e8aa42]/70 object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e8aa42] text-[#101013]">
                  <Hand size={11} />
                </span>
              </span>
              <h2 className="mt-3 text-[17px] font-semibold text-white">Leaving already?</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                Thanks for stopping by. Grab the CV — or say hi, replies are fast.
              </p>
            </div>

            {ios ? (
              <div className="border-t border-white/10 text-[16px]">
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full border-b border-white/10 px-4 py-3 text-[#3b8af0] active:bg-white/10"
                  onClick={onStay}
                >
                  Download CV
                </a>
                <button
                  type="button"
                  className="block w-full border-b border-white/10 px-4 py-3 text-[#ff6b64] active:bg-white/10"
                  onClick={() => {
                    sfx.close();
                    leaveSite();
                    onStay();
                  }}
                >
                  Leave
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-3 font-semibold text-[#3b8af0] active:bg-white/10"
                  onClick={onStay}
                >
                  Stay
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-5 pb-5 text-[13px]">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#2a7de1] py-1.5 font-medium text-[#fff] hover:bg-[#3b8af0]"
                  onClick={onStay}
                >
                  Stay
                </button>
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-lg bg-white/10 py-1.5 text-white/85 hover:bg-white/20"
                  onClick={onStay}
                >
                  Download CV
                </a>
                <button
                  type="button"
                  className="w-full rounded-lg py-1.5 text-[#ff6b64] hover:bg-[#ff6b64]/10"
                  onClick={() => {
                    sfx.close();
                    leaveSite();
                    onStay();
                  }}
                >
                  Leave
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
