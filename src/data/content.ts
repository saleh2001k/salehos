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
  bullets: string[];
}

export interface ProjectMedia {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Poster frame shown before a video loads. */
  poster?: string;
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
  role: "Senior Mobile & Full-Stack Engineer",
  tagline:
    "I build cross-platform mobile apps and modern web products — from the JavaScript layer down to native iOS & Android code.",
  location: "Jordan",
  email: "saleh.almashnie@gmail.com",
  phone: "+962 79 971 4069",
  phoneHref: "tel:+962799714069",
  github: "https://github.com/saleh2001k",
  linkedin: "https://www.linkedin.com/in/saleh-almashni",
  x: "https://x.com/saleh_almashne",
  footerLine: "© 2026 Saleh Al-Mashni · Built with React, Three.js & too much coffee",
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
    company: "Digital Gates",
    role: "Mobile Developer",
    period: "06/2025 – Present",
    bullets: [
      "Developed the Speedy Hire UK cross-platform app in React Native, owning architecture from setup through production release on App Store and Google Play",
      "Built custom native modules bridging React Native to native iOS and Android APIs — advanced splash screen behaviour, native-layer animations, platform-specific enhancements",
      "Engineered complex animation systems with Reanimated and Gesture Handler: physics-based gestures, shared element transitions, orchestrated sequences",
      "Integrated third-party native SDKs into the build pipeline, configuring Xcode and Gradle for stable dependency resolution",
      "Implemented secure authentication flows and API integrations; translated Figma designs into pixel-perfect responsive UI",
    ],
  },
  {
    company: "We The Makers",
    role: "Full-Stack Software Developer",
    period: "11/2023 – 06/2025",
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
    bullets: [
      "Full-stack development with JavaScript: Express.js backend, React.js frontend",
    ],
  },
];

export const projects: Project[] = [
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
    period: "2025",
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
    period: "2025",
    description:
      "Tiny, dependency-light parallax ScrollView for React Native — header parallax, pull-to-zoom, and a body that slides over the header. Fully style-prop driven, powered by Reanimated.",
    tech: ["React Native", "Reanimated", "Parallax", "iOS", "Android"],
    featured: false,
    link: "https://github.com/saleh-ayman/react-native-parallax-flow",
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
    period: "03 – 10/2025",
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
    media: [{ type: "image", src: "/projects/trevi.webp", alt: "Trevi finance app website" }],
  },
  {
    title: "MotorWheels",
    tag: "We The Makers",
    description:
      "Automotive marketplace website with a bilingual EN/AR experience — browse cars, dealer listings, and offers with a responsive, SEO-friendly build.",
    tech: ["Next.js", "EN/AR RTL", "SEO"],
    featured: false,
    media: [{ type: "image", src: "/projects/motorwheels.webp", alt: "MotorWheels marketplace website" }],
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
    skills: ["React", "Next.js", "TypeScript", "Zustand", "i18n / RTL", "Tailwind CSS"],
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
