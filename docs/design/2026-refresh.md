# Portfolio refresh — October 2026

## Brief

A readable CV with the craft visible in its interactions. Keep SalehOS as a project. Prioritize the recent TGC role, native engineering, reusable packages, and the Aleena frontend monorepo. Update the downloadable PDF from the same facts.

## Direction: a résumé with depth

White document on a cool grey desk. A small violet page stack opens with scrolling: the interface, the native implementation, the shared system. Everything else stays quiet. Visitors can read the CV without interacting; exploration adds evidence, never gates it.

- Palette: desk `#f2f3f5`, paper `#ffffff`, ink `#292a32`, secondary `#6a6b76`, violet `#6652cc`, pale violet `#eeeafa`.
- Type: locally hosted Manrope for text and headings; system monospace only for code.
- Layout: a wide document with a compact sticky navigation, left-aligned profile, right-hand interactive paper object, generous section spacing, and dates in a consistent résumé gutter.
- Motion: one scroll-driven paper composition, responsive click-driven package demonstrations, native scrolling, restrained section transitions. Respect reduced motion; keep every action keyboard accessible.
- Avoid: OS as navigation, terminal hero, generic card grid, skills percentages, invented project metrics, scroll hijacking.

```
SA.                                  Work   Packages   Experience   CV
┌──────────────────────────────────────────────────────────────────┐
│ Curriculum vitae                           Updated October 2026  │
│ Saleh Al-Mashni.                 layered sheets:                  │
│ Senior React Native &           interface / native / systems      │
│ Frontend Developer                                               │
│ intro + contact + CV              scroll to unfold                │
├──────────────────────────────────────────────────────────────────┤
│ Selected work            Aleena: mobile / native / web            │
│                          visual + selectable evidence             │
│ Independent work         MacHarmony / SalehOS / earlier products  │
│ Open source              interactive demo + six package index    │
│ Experience               TGC / Digital Gates / We The Makers      │
│ Toolkit + education                                              │
│ Contact                                                          │
└──────────────────────────────────────────────────────────────────┘
```

Critique: a plain résumé alone would lose the user's requested surprise. A full 3D playground would repeat the original navigation problem. Keep one tangible paper object and let the package demos show the actual areas of expertise. No decorative stock imagery needed.

## Evidence checked

- TGC role and Digital Gates end date: user confirmed TGC and Digital Gates ending August 2026. TGC start August 2026 inferred from “last two months.”
- Aleena app: `modules/apple-pay/ios/ApplePayModule.swift` (PassKit), `modules/splash-flow` (native flight and reveal), `modules/camera-hardware`, `modules/predictive-back` (adapted local Expo module), `modules/app-icons`, `src/api/customer/auth.ts` (PKCE), `src/api/persist.ts` (synchronous MMKV query hydration). Describe implemented work; do not claim an unverified store release or payment approval.
- Frontends: two Next.js apps; `packages/ui`, `theme`, `i18n`, `config`, `storefront`. `HomeSections` and `StorefrontCommerceProvider` reuse presentation in storefront and CMS preview. Git history confirms Saleh contributions; avoid claiming sole authorship of team product.
- Packages: all six package manifests and READMEs; native RTL implementation and Nitro transition implementation inspected. Source/demo links taken from package metadata.
- Previous experience, education and projects: existing portfolio content and two-page résumé. No new unverified impact metrics.

## Design and implementation references

- https://paco.me — concise content hierarchy and project descriptions.
- https://rauno.me — interaction-focused presentation.
- https://emilkowal.ski — projects as evidence of interface craft.
- https://motion.dev/docs/react-use-scroll — scroll-linked motion values.
- https://motion.dev/docs/react-use-reduced-motion — accessible motion alternatives.

Source repositories are research inputs only; no changes made there. Local repository redesign; no new hosting project or deployment requested.
