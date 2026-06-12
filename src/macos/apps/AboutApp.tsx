import { about, site } from "../../data/content";

const SPECS: [string, string][] = [
  ["Chip", "Saleh M1 Pro — JavaScript & Native cores"],
  ["Memory", "10+ shipped apps, unified"],
  ["Startup Disk", "React Native HD"],
  ["Graphics", "Reanimated 60fps engine"],
  ["Serial", "JOR-2001-SA"],
];

export function AboutApp() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5aa7f2_0%,#2a7de1_60%,#1b3a5c_100%)] font-display text-3xl font-semibold text-white shadow-[0_8px_24px_rgba(42,125,225,0.4)]">
        SA
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold text-white">{site.name}</h2>
        <p className="mt-0.5 text-sm text-white/55">{site.role}</p>
      </div>
      <dl className="w-full max-w-xs space-y-1.5 text-[13px]">
        {SPECS.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt className="shrink-0 text-white/45">{key}</dt>
            <dd className="text-right text-white/85">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="max-w-sm text-xs leading-relaxed text-white/50">{about.paragraph}</p>
    </div>
  );
}
