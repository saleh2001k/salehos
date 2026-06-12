import { motion } from "motion/react";
import { useEffect } from "react";
import { AppleLogo } from "./AppIcons";

interface BootScreenProps {
  onDone: () => void;
}

export function BootScreen({ onDone }: BootScreenProps) {
  useEffect(() => {
    const id = setTimeout(onDone, 2100);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex flex-col items-center justify-center gap-10 bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AppleLogo size={76} className="text-[#e6e6ea]" />
      <div className="h-1.5 w-44 overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full rounded-full bg-white/85"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.7, ease: [0.3, 0.6, 0.4, 1] }}
        />
      </div>
    </motion.div>
  );
}
