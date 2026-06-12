import { Briefcase, MapPin, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "../../data/content";

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const glass =
  "rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl";

function ClockWidget() {
  const now = useNow(1000);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return (
    <div className={`${glass} w-44 p-4`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
        Amman, Jordan
      </p>
      <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-white">
        {time}
        <span className="text-base text-white/40">:{seconds}</span>
      </p>
    </div>
  );
}

function CalendarWidget() {
  const now = useNow(60_000);
  return (
    <div className={`${glass} w-44 p-4`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#ff6b64]">
        {new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now)}
      </p>
      <p className="font-display text-4xl font-semibold text-white">{now.getDate()}</p>
      <p className="text-xs text-white/50">
        {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now)}
      </p>
    </div>
  );
}

function StatusWidget() {
  return (
    <div className={`${glass} w-44 space-y-2 p-4 text-[12px]`}>
      <p className="flex items-center gap-2 text-white/80">
        <Briefcase size={13} className="shrink-0 text-[#e8aa42]" />
        {site.role.split(" — ")[0]}
      </p>
      <p className="flex items-center gap-2 text-white/80">
        <MapPin size={13} className="shrink-0 text-[#5aa7f2]" />
        {site.location}
      </p>
      <p className="flex items-center gap-2 text-white/80">
        <Rocket size={13} className="shrink-0 text-[#34d058]" />
        10+ apps in production
      </p>
    </div>
  );
}

export function Widgets() {
  return (
    <div className="pointer-events-none absolute left-4 top-4 hidden flex-col gap-3 lg:flex">
      <ClockWidget />
      <CalendarWidget />
      <StatusWidget />
    </div>
  );
}
