import { motion } from "motion/react";
import { useEffect, type ReactNode } from "react";

export interface LaunchpadApp {
  id: string;
  label: string;
  icon: ReactNode;
  onOpen?: () => void;
  href?: string;
}

interface LaunchpadProps {
  apps: LaunchpadApp[];
  onClose: () => void;
}

export function Launchpad({ apps, onClose }: LaunchpadProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="force-dark absolute inset-0 z-[950] flex items-center justify-center bg-black/45 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className="grid grid-cols-3 gap-x-10 gap-y-8 sm:grid-cols-4 lg:grid-cols-5"
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.08, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      >
        {apps.map((app) => {
          const content = (
            <>
              <span className="h-[72px] w-[72px] transition-transform group-hover:scale-105 group-active:scale-95 [&>*]:h-full [&>*]:w-full">
                {app.icon}
              </span>
              <span className="text-[13px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
                {app.label}
              </span>
            </>
          );
          return app.href ? (
            <a
              key={app.id}
              href={app.href}
              target="_blank"
              rel="noreferrer"
              className="group flex w-24 flex-col items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              {content}
            </a>
          ) : (
            <button
              key={app.id}
              type="button"
              className="group flex w-24 flex-col items-center gap-2"
              onClick={(event) => {
                event.stopPropagation();
                app.onOpen?.();
                onClose();
              }}
            >
              {content}
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
