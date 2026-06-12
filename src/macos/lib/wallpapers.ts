import type { CSSProperties } from "react";
import type { Wallpaper } from "./settings";

export interface WallpaperPreset {
  name: string;
  background: string;
}

export const WALLPAPERS: WallpaperPreset[] = [
  {
    name: "Sequoia Dusk",
    background: [
      "radial-gradient(110% 80% at 85% 110%, rgba(232,140,60,0.55) 0%, rgba(180,70,90,0.4) 35%, transparent 65%)",
      "radial-gradient(120% 90% at 10% 100%, rgba(90,60,160,0.5) 0%, transparent 60%)",
      "radial-gradient(100% 70% at 50% -10%, rgba(40,60,130,0.6) 0%, transparent 65%)",
      "linear-gradient(180deg, #0c1024 0%, #1a1530 55%, #2c1b33 100%)",
    ].join(", "),
  },
  {
    name: "Pacific",
    background: [
      "radial-gradient(120% 90% at 80% -10%, rgba(60,180,200,0.45) 0%, transparent 60%)",
      "radial-gradient(110% 80% at 10% 110%, rgba(20,90,160,0.55) 0%, transparent 65%)",
      "linear-gradient(180deg, #04121f 0%, #0a2438 55%, #0d3147 100%)",
    ].join(", "),
  },
  {
    name: "Amber Dunes",
    background: [
      "radial-gradient(120% 80% at 75% 105%, rgba(232,170,66,0.55) 0%, rgba(190,90,40,0.4) 40%, transparent 70%)",
      "radial-gradient(100% 70% at 15% -5%, rgba(120,40,60,0.5) 0%, transparent 60%)",
      "linear-gradient(180deg, #16080d 0%, #2c1014 50%, #45200f 100%)",
    ].join(", "),
  },
  {
    name: "Graphite",
    background: [
      "radial-gradient(110% 80% at 50% -20%, rgba(120,130,150,0.3) 0%, transparent 60%)",
      "radial-gradient(120% 90% at 85% 110%, rgba(60,65,80,0.5) 0%, transparent 65%)",
      "linear-gradient(180deg, #0a0b0e 0%, #14161c 60%, #1b1e26 100%)",
    ].join(", "),
  },
];

export function wallpaperStyle(wallpaper: Wallpaper): CSSProperties {
  switch (wallpaper.kind) {
    case "preset":
      return { background: (WALLPAPERS[wallpaper.index] ?? WALLPAPERS[0]!).background };
    case "image":
      return {
        backgroundImage: `url(${wallpaper.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#0c1024",
      };
    case "gradient":
      return {
        background: `linear-gradient(${wallpaper.gradient.angle}deg, ${wallpaper.gradient.colors.join(", ")})`,
      };
  }
}
