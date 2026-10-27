export const packages = [
  {
    id: "theme",
    name: "react-native-nitro-theme-transition",
    title: "A change you can feel.",
    description:
      "Sixteen native transitions. Core Animation on iOS, platform animators on Android. No Skia or Reanimated dependency.",
    detail: "Nitro Modules · Swift · Kotlin",
    label: "Theme transitions",
  },
  {
    id: "rtl",
    name: "react-native-rtl",
    title: "A new direction. Same state.",
    description:
      "Mirror live Fabric surfaces and native navigation chrome between Arabic and English. No restart, reload, or screen remount.",
    detail: "Fabric · Objective-C · Kotlin",
    label: "Runtime RTL",
  },
  {
    id: "text",
    name: "react-native-silk-text",
    title: "Every letter has a little life.",
    description:
      "Per-letter text animation rendered by SwiftUI and Jetpack Compose, with no per-frame work crossing the JavaScript bridge.",
    detail: "SwiftUI · Jetpack Compose",
    label: "Animated text",
  },
  {
    id: "splash",
    name: "react-native-splash-flow",
    title: "The first frame matters.",
    description:
      "Native animated launches, an Expo config plugin, and coordinated exit reveals. A familiar splash-screen API with more room for character.",
    detail: "TurboModule · Expo · SwiftUI",
    label: "Native splash",
  },
  {
    id: "parallax",
    name: "react-native-parallax-flow",
    title: "A little perspective.",
    description:
      "Layered scroll depth, pull-to-zoom headers, and a body that slides over the image. A compact, style-driven Reanimated primitive.",
    detail: "Reanimated · Scroll interaction",
    label: "Parallax flow",
  },
  {
    id: "pull",
    name: "react-native-pull-flow",
    title: "Pull. Make it yours.",
    description:
      "A headless gesture engine for custom refresh indicators, preserving native bounce and list virtualization.",
    detail: "Reanimated · Gesture Handler",
    label: "Pull to refresh",
  },
] as const;

export type PackageId = (typeof packages)[number]["id"];
