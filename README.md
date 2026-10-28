# Saleh Al-Mashni — portfolio

A CV you can read and an interface you can explore. Built with React 19, TypeScript, Vite, Motion, and locally hosted Manrope (WOFF2).

## Experience

- `/` — résumé, Aleena and Speedy Hire case studies, six phone-based package playgrounds (each mirrors the package's real API and links to a device recording), experience, and contact.
- `/os` — the original SalehOS desktop and iOS-style experience, retained as a project and loaded on demand.
- `/?cv=1` — the readable HTML CV dialog, also opened by “View CV” and résumé share links. PDF is available from “Download PDF”.
- `/Saleh_Al-Mashni_Resume_2026.pdf` — one-page, Harvard-style, ATS-friendly CV (single column, standard Times font, standard section headings, `Mon YYYY` dates). The same file remains available to the original Preview app.

The homepage uses native browser scrolling, keyboard-operable controls, visible focus, mobile layouts, and reduced-motion alternatives. Its package studies illustrate behavior in the browser; native recordings and repository links provide the actual package implementations.

## Development

```sh
npm install
npm run dev
npm run build       # TypeScript checks and production bundle
npm run preview
```

Existing GitHub Actions / Netlify deployment stays in place. Netlify rewrites `/os` and `/os/` to the React entry point. A push to `main` triggers the existing production workflow.

## Content and source

- `src/data/content.ts` — identity, professional experience, projects, education, skills. Shared by the new résumé and original OS apps.
- `src/data/resume.json` — résumé copy shared by the HTML CV and PDF generator.
- `src/data/packages.ts` — six package descriptions and playground selection.
- `src/portfolio/` — résumé components and scoped design styles.
- `src/OSExperience.tsx` — lazy entry for the original desktop/mobile experience.
- `docs/design/2026-refresh.md` — design direction, research references, evidence map, and date assumptions.

TGC: Senior React Native & Frontend Developer, August 2026–present. Digital Gates: June 2025–August 2026. The Aleena mobile app, frontend monorepo, and package repositories were read as research inputs and were not modified.

## Design notes (October 2026 refresh)

- Palette: cobalt `#2747D9` accent on a cool device-canvas grey `#EBEEF3` with a 22px dot grid; ink `#18202F`. Tokens live at the top of `src/portfolio/portfolio.css`.
- Header: fixed floating bar with a solid surface (no `backdrop-filter`), an IntersectionObserver for the active section, and a CSS-transform nav indicator. No scroll listeners run per frame.
- The design skill used for this pass is vendored in `.claude/skills/frontend-design`.
- `robots.txt`, `sitemap.xml`, and Person JSON-LD (in `index.html`) help search engines and link previews.

## Regenerate the PDF

The generator reads the same typed content used by the site. It verifies the page count and required content, then updates `public/Saleh_Al-Mashni_Resume_2026.pdf`.

```sh
python3 -m pip install reportlab pypdf
npm run resume
# Or select an existing Python environment:
PORTFOLIO_PYTHON=/absolute/path/to/python3 npm run resume
```

The CV copy lives in `src/data/resume.json` (phrased for the résumé, separate from the portfolio copy). The PDF generator in `scripts/build-resume.py` fails if the PDF grows past two pages or loses required keywords. Review the rendered page after content changes and run `pdftotext` on it to confirm a clean parse. PDF generation is deliberately separate from the web build; the checked-in PDF is deployable without Python.

## Assets

- Manrope is self-hosted under the SIL Open Font License (`public/fonts/OFL.txt`).
- Aleena artwork comes from the user-provided app repository. The browser illustration is labeled as an interface study.
- Package videos come from the corresponding user-provided example apps.
- MacHarmony and SalehOS images are retained project screenshots.
- `src/macos/` and the arcade bundles remain the original implementation.
