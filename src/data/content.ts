export interface NavLink {
  label: string;
  id: string;
}

export interface SiteInfo {
  name: string;
  monogram: string;
  photo: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  phoneHref: string;
  github: string;
  linkedin: string;
  x: string;
  whatsapp: string;
  cv: string;
  footerLine: string;
}

export interface AboutContent {
  paragraph: string;
  stats: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location?: string;
  bullets: string[];
}

export interface ProjectMedia {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Poster frame shown before a video loads. */
  poster?: string;
  /** Full-page capture: scroll it instead of cropping. */
  tall?: boolean;
}

export interface Project {
  title: string;
  tag: string;
  period?: string;
  description: string;
  tech: string[];
  featured: boolean;
  link?: string;
  media?: ProjectMedia[];
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface EducationItem {
  title: string;
  org: string;
  period?: string;
}

export interface Certificate {
  name: string;
  org: string;
}

export const site: SiteInfo = {
  name: "Saleh Al-Mashni",
  monogram: "SA.",
  photo: "/me.webp",
  role: "Senior React Native & Frontend Developer",
  tagline:
    "I build the interface you touch, the native code underneath, and the systems that hold it together.",
  location: "Jordan",
  email: "saleh.almashnie@gmail.com",
  phone: "+962 79 971 4069",
  phoneHref: "tel:+962799714069",
  github: "https://github.com/saleh2001k",
  linkedin: "https://www.linkedin.com/in/saleh-almashni",
  x: "https://x.com/saleh_almashne",
  whatsapp: "https://wa.me/962799714069?text=Hi%20Saleh%2C%20I%20found%20your%20portfolio%20and%20wanted%20to%20reach%20out.",
  cv: "/Saleh_Al-Mashni_Resume_2026.pdf",
  footerLine: "© 2026 Saleh Al-Mashni. Thoughtfully built in Jordan.",
};

export const navLinks: NavLink[] = [
  { label: "Work", id: "work" },
  { label: "Experience", id: "experience" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
];

export const about: AboutContent = {
  paragraph:
    "I'm a senior engineer delivering scalable products from concept to production across mobile and web, with deep expertise on both the JavaScript and native layers. I'm the author of open-source React Native tooling and native packages that extend React Native beyond its out-of-the-box capabilities.",
  stats: [
    "10+ apps shipped to App Store & Play Store",
    "Open-source author",
    "Native iOS & Android module development",
  ],
};

export const experience: ExperienceItem[] = [
  {
    company: "TGC",
    role: "Senior React Native & Frontend Developer",
    period: "08/2026 – Present",
    location: "Amman, Jordan",
    bullets: [
      "Develop Aleena across React Native mobile, a Next.js storefront, and an admin dashboard in a shared Turborepo monorepo.",
      "Build native iOS and Android integrations for animated launch sequences, PassKit Apple Pay, camera hardware controls, seasonal app icons, and Android predictive-back gestures.",
      "Implement Arabic/English runtime direction changes, Shopify customer authentication with PKCE, and synchronous MMKV-backed query-cache hydration for the first render.",
      "Develop shared storefront, UI, theme, localization, and configuration packages; reuse storefront components in the dashboard's live CMS preview.",
    ],
  },
  {
    company: "Digital Gates",
    role: "Mobile Developer",
    period: "06/2025 – 08/2026",
    location: "Amman, Jordan",
    bullets: [
      "Developed the Speedy Hire mobile app (iOS and Android) in React Native and TypeScript for a UK equipment-hire client, from initial project setup through App Store and Google Play releases.",
      "Delivered core customer features: live order tracking on Google Maps, off-hire and collection requests, invoices and payments, depot finder, and checkout with address management.",
      "Built QR and barcode asset inspection with VisionCamera and custom camera controls, plus biometric sign-in and OAuth (Azure AD B2C) token management stored in Keychain.",
      "Wrote native iOS and Android modules for splash-screen choreography and in-app restart; added a dark theme with Unistyles and native theme transitions; upgraded React Native 0.81 to 0.85.",
      "Persisted server state with TanStack Query, implemented deep linking, and automated builds with Azure Pipelines and fastlane.",
      "Interviewed mid-level and junior candidates for mobile roles.",
    ],
  },
  {
    company: "We The Makers",
    role: "Full-Stack Software Developer",
    period: "11/2023 – 06/2025",
    location: "Amman, Jordan",
    bullets: [
      "Led and mentored a mobile team: code reviews, branching strategy, PR standards, architectural decisions across concurrent projects",
      "Built and shipped scalable React Native and Next.js apps from concept to production — complex state management, offline support, push notifications, bilingual RTL/LTR UI",
      "Optimised Next.js sites (ISR, image optimisation, bundle analysis), improving Lighthouse scores and SEO",
      "Designed CI/CD pipelines with GitHub Actions automating build, test, and deployment",
    ],
  },
  {
    company: "ASAC (Abdul Aziz Al Ghurair School of Advanced Computing)",
    role: "Full-Stack JavaScript Trainee",
    period: "12/2022 – 10/2023",
    location: "Amman, Jordan",
    bullets: [
      "Full-stack development with JavaScript: Express.js backend, React.js frontend",
    ],
  },
];

export const projects: Project[] = [
  {
    title: "Aleena",
    tag: "TGC · Mobile & Web",
    period: "08/2026 – Present",
    description: "Commerce across a React Native app, Next.js storefront, and admin dashboard. My work spans native launch choreography, PassKit checkout, camera hardware, live RTL, cached first renders, and shared storefront components that also power the CMS preview.",
    tech: ["React Native", "Next.js", "Swift", "Kotlin", "Turborepo", "Shopify"],
    featured: true,
  },
  {
    title: "Speedy Hire",
    tag: "Digital Gates · Mobile app",
    period: "06/2025 – 08/2026",
    description:
      "The customer mobile app for a UK equipment-hire company, on iOS and Android. Order tracking on live maps, off-hire and collections, invoices and payments, QR asset inspection, biometric sign-in, and native splash and theme work.",
    tech: ["React Native", "TypeScript", "VisionCamera", "Google Maps", "TanStack Query", "Azure Pipelines"],
    featured: true,
  },
  {
    title: "react-native-nitro-theme-transition",
    tag: "Open Source",
    description: "Sixteen native theme-change effects built on Nitro Modules, using Core Animation on iOS and platform animators on Android. Snapshot transitions without Skia or a JavaScript animation dependency.",
    tech: ["Nitro Modules", "Swift", "Kotlin", "Core Animation"],
    featured: true,
    link: "https://github.com/saleh2001k/react-native-nitro-theme-transition",
  },
  {
    title: "react-native-rtl",
    tag: "Open Source",
    description: "Switch live Fabric surfaces and native navigation chrome between LTR and RTL without restarting the app or remounting its screens.",
    tech: ["Fabric", "Objective-C", "Kotlin", "RTL"],
    featured: true,
    link: "https://github.com/saleh2001k/react-native-rtl",
  },
  {
    title: "react-native-splash-flow",
    tag: "Open Source",
    description: "Native animated splash screens with an Expo config plugin, Android SplashScreen API, custom SwiftUI launch views, and coordinated exit animations.",
    tech: ["SwiftUI", "Kotlin", "TurboModule", "Expo"],
    featured: false,
    link: "https://github.com/saleh2001k/react-native-splash-flow",
  },
  {
    title: "react-native-pull-flow",
    tag: "Open Source",
    description: "Headless pull-to-refresh with a UI-thread gesture engine and customizable indicators. Preserves native iOS bounce and list virtualization.",
    tech: ["Reanimated", "Gesture Handler", "React Native"],
    featured: false,
    link: "https://github.com/saleh2001k/react-native-pull-flow",
  },
  {
    title: "SalehOS",
    tag: "Interactive Experiment",
    description: "A working desktop in your browser: draggable windows, a persistent virtual filesystem, terminal, settings, and arcade. A companion iOS-style interface adapts the experience to phones.",
    tech: ["React", "TypeScript", "Motion", "Web Audio"],
    featured: true,
    link: "/os",
    media: [{ type: "image", src: "/projects/salehos.jpg", alt: "SalehOS interactive desktop" }],
  },
  {
    title: "NativeTide",
    tag: "Open Source",
    period: "06/2025 – Present",
    description:
      "Open-source CLI that scaffolds a production-ready React Native (Expo) project in seconds — TypeScript, Zustand, i18n with instant LTR/RTL switching, auth-ready navigation, Axios API layer, full dev tooling. Eliminates weeks of boilerplate.",
    tech: ["CLI", "Expo", "TypeScript", "Zustand", "i18n"],
    featured: true,
    link: "https://github.com/saleh2001k",
  },
  {
    title: "MacHarmony",
    tag: "macOS App",
    period: "2025",
    description:
      "Native SwiftUI storage cleaner for macOS, shipped end-to-end with its own licensing and distribution stack: Stripe checkout, Supabase auth + Postgres + Edge Functions, device-bound licenses with a browser-to-app token handoff, Resend transactional email, and Sparkle in-app auto-updates from GitHub Releases — with zero always-on backend.",
    tech: ["SwiftUI", "Supabase", "Stripe", "Sparkle", "Netlify"],
    featured: true,
    media: [
      { type: "image", src: "/projects/macharmony/home.webp", alt: "MacHarmony home dashboard" },
      { type: "image", src: "/projects/macharmony/scan-history.webp", alt: "MacHarmony scan history" },
      { type: "image", src: "/projects/macharmony/appuninstaller.webp", alt: "MacHarmony app uninstaller" },
      { type: "image", src: "/projects/macharmony/nodemodules.webp", alt: "MacHarmony node_modules cleaner" },
      { type: "image", src: "/projects/macharmony/devicesupport.webp", alt: "MacHarmony iOS device support cleaner" },
      { type: "image", src: "/projects/macharmony/memory.webp", alt: "MacHarmony memory monitor" },
      { type: "image", src: "/projects/macharmony/startup.webp", alt: "MacHarmony startup items manager" },
      { type: "image", src: "/projects/macharmony/health.webp", alt: "MacHarmony system health view" },
      { type: "image", src: "/projects/macharmony/menubar.webp", alt: "MacHarmony menu bar quick access" },
    ],
  },
  {
    title: "react-native-silk-text",
    tag: "Open Source",
    period: "06/2026",
    description:
      "Fully-native animated text for React Native on the New Architecture: per-letter animations rendered by SwiftUI on iOS and Jetpack Compose on Android — no JS-thread jank, no Reanimated dependency.",
    tech: ["React Native", "SwiftUI", "Jetpack Compose", "Native Modules", "Fabric"],
    featured: true,
    link: "https://github.com/saleh2001k/react-native-silk-text",
    media: [
      {
        type: "video",
        src: "/projects/silk-text/demo.mp4",
        poster: "/projects/silk-text/demo-poster.webp",
        alt: "react-native-silk-text per-letter animation demo",
      },
    ],
  },
  {
    title: "react-native-parallax-flow",
    tag: "Open Source",
    period: "07/2026",
    description:
      "Tiny, dependency-light parallax ScrollView for React Native — header parallax, pull-to-zoom, and a body that slides over the header. Fully style-prop driven, powered by Reanimated.",
    tech: ["React Native", "Reanimated", "Parallax", "iOS", "Android"],
    featured: false,
    link: "https://github.com/saleh2001k/react-native-parallax-flow",
    media: [
      {
        type: "video",
        src: "/projects/parallax/layers.mp4",
        poster: "/projects/parallax/layers-poster.webp",
        alt: "Parallax layers scroll demo",
      },
      {
        type: "video",
        src: "/projects/parallax/profile.mp4",
        poster: "/projects/parallax/profile-poster.webp",
        alt: "Profile header parallax demo",
      },
      {
        type: "video",
        src: "/projects/parallax/magazine.mp4",
        poster: "/projects/parallax/magazine-poster.webp",
        alt: "Magazine layout parallax demo",
      },
      {
        type: "video",
        src: "/projects/parallax/artist.mp4",
        poster: "/projects/parallax/artist-poster.webp",
        alt: "Artist page pull-to-zoom parallax demo",
      },
    ],
  },
  {
    title: "Balsam United",
    tag: "Mobile App",
    period: "09 – 10/2025",
    description:
      "Rebuilt the entire React Native app from the ground up, delivering production-ready architecture in 3 weeks against a projected 6-month timeline. Role-based flows, real-time chat, health integrations, secure REST APIs, full EN/AR RTL. Shipped to both stores.",
    tech: ["React Native", "Real-time chat", "Health APIs", "EN/AR RTL"],
    featured: true,
  },
  {
    title: "Taj Alsafah",
    tag: "Mobile App",
    period: "03/2025 – 12/2025",
    description:
      "Internal operations app with role-based workflows and multi-stage approval chains. Advanced list/table UX, dashboards, offline support, bilingual EN/AR RTL. Released to App Store and Google Play.",
    tech: ["React Native", "Offline support", "Dashboards", "EN/AR RTL"],
    featured: false,
  },
  {
    title: "Trevi",
    tag: "We The Makers",
    description:
      "Modern finance app: smooth wallet top-ups, cashback incentives, spending insights, shared family wallets.",
    tech: ["React Native", "Fintech", "Payments"],
    featured: false,
    media: [{ type: "image", src: "/projects/trevi.webp", alt: "Trevi finance app website", tall: true }],
  },
  {
    title: "MotorWheels",
    tag: "We The Makers",
    description:
      "Automotive marketplace website with a bilingual EN/AR experience — browse cars, dealer listings, and offers with a responsive, SEO-friendly build.",
    tech: ["Next.js", "EN/AR RTL", "SEO"],
    featured: false,
    media: [{ type: "image", src: "/projects/motorwheels.webp", alt: "MotorWheels marketplace website", tall: true }],
  },
  {
    title: "Gomint",
    tag: "We The Makers",
    description:
      "On-demand pickup & delivery: geo-tracking, accurate delivery estimates, real-time user–provider communication.",
    tech: ["React Native", "Geolocation", "Real-time"],
    featured: false,
  },
  {
    title: "Sipes",
    tag: "We The Makers",
    description:
      "Customer loyalty platform: earn points from purchases, QR scanning via mobile app, rewards redemption.",
    tech: ["React Native", "QR scanning", "Loyalty"],
    featured: false,
  },
];

export const projectsNote = "+8 private projects across web and mobile.";

export const skillGroups: SkillGroup[] = [
  {
    label: "Native engineering",
    skills: ["Swift", "Kotlin", "Objective-C", "SwiftUI", "Jetpack Compose", "Fabric", "Nitro Modules", "PassKit"],
  },
  {
    label: "Mobile",
    skills: [
      "React Native",
      "Expo",
      "EAS Build",
      "Reanimated",
      "Gesture Handler",
      "TypeScript",
      "Native Modules (iOS/Android)",
    ],
  },
  {
    label: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Turborepo", "TanStack Query", "Zustand", "i18n / RTL", "Tailwind CSS"],
  },
  {
    label: "DevOps & Cloud",
    skills: [
      "AWS EC2",
      "GitHub Actions",
      "CI/CD pipelines",
      "App Store & Play Store deployment",
    ],
  },
  {
    label: "Tools",
    skills: ["Figma", "Git", "Xcode", "Android Studio", "Postman"],
  },
];

export const education: EducationItem[] = [
  { title: "British Diploma in Software Engineering", org: "ASAC" },
  { title: "AWS re/Start", org: "Amazon Web Services", period: "03 – 07/2022" },
];

export const certificates: Certificate[] = [
  { name: "AWS Cloud Practitioner", org: "Chams" },
  { name: "Front End Development Libraries", org: "FreeCodeCamp" },
  { name: "Responsive Web Design", org: "FreeCodeCamp" },
  { name: "Mobile Development", org: "Udacity" },
];
