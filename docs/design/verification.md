# Verification — 28 October 2026

- `npm run build`: TypeScript and Vite production build pass.
- `git diff --check`: pass.
- Browser QA: 1440px desktop, 1200px desktop, 390px phone, 320px narrow phone. No horizontal document overflow at checked sizes; reviewed hero, Aleena case study, package playground, and experience layouts.
- Aleena case study: mobile, native, and monorepo controls change both the visual and accompanying implementation details.
- Paper composition: expand/collapse button and scroll-driven transforms inspected.
- Package studies: theme toggle; RTL direction change retaining incremented bag count; animated text replacement; splash replay; keyboard-adjustable parallax range; refresh button and count. Native theme recording loaded with `readyState === 4` and no media error.
- Production preview (`vite preview`): loaded assets, no observed production console errors; RTL toggle works with Enter; email copy reports success.
- Native scrolling, semantic buttons/links, visible focus, and motion alternatives implemented. OS reduced-motion preference is handled through MotionConfig/useReducedMotion and CSS; system preference itself was not changed during QA.
- SalehOS: desktop and mobile layouts load at `/os`; mobile Experience shows TGC and corrected Digital Gates dates; return link navigates back to résumé. OS is a separate lazy-loaded chunk.
- PDF: both rendered pages inspected. Selectable text, 11 link annotations, expected TGC/native/package content, exactly two pages. Served PDF hash matches public and output copies.
- Social image: actual new homepage capture at 1200 × 630.
- Homepage typography remains self-hosted; original OS fonts load only on the OS route.

Code changes remain local. No commit, push, or deployment performed. Source Aleena and package repositories were read only.
