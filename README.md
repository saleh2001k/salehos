# salehOS — salehos.com

Saleh Al-Mashni's portfolio, built as a working operating system in the browser.
Desktop visitors get a macOS-style desktop; phones get an iOS-style home screen.
Everything — windows, dock, terminal, file system, games — is built from scratch
in React. No emojis, no UI libraries, no backend.

**Live:** [salehos.com](https://salehos.com)

---

## Stack

| Layer     | Choice                                                      |
| --------- | ----------------------------------------------------------- |
| Framework | React 19 + TypeScript (strict), Vite 8                      |
| Styling   | Tailwind CSS v4 (CSS-first `@theme`, no config file)        |
| Animation | `motion` (Framer Motion 12)                                 |
| Icons     | Real `.icns` artwork converted to PNG + lucide-react glyphs |
| DOS games | js-dos v8 (self-hosted `.jsdos` bundles)                    |
| Forms     | Netlify Forms                                               |
| Hosting   | Netlify, deployed by GitHub Actions on push to `main`       |

No router, no state library, no CMS. All copy lives in
[`src/data/content.ts`](src/data/content.ts) — edit that file to change any text
on the site.

---

## How it works

### Desktop (≥768px) — `src/macos/MacOS.tsx`

The window manager. Windows are an **instance array** (`WinInstance[]`), each
with a unique id, z-index, minimized/maximized flags, and an optional payload
(Finder section, file id). Finder and TextEdit can open many windows; every
other app is a singleton that re-focuses on launch.

- **Windows** (`components/Window.tsx`) — drag by title bar (Framer
  `dragControls`), resize from all 8 edges/corners (pointer handlers writing to
  motion values, min 380×260), traffic lights (close / minimize / maximize),
  double-click title bar to zoom. Maximize is sequenced like real macOS: the
  window glides to the corner first, then grows, leaving a uniform 10px margin.
  Windows can hang partially off-screen; they clamp on drag-end.
- **Dock** (`components/Dock.tsx`) — CSS frosted pill (`backdrop-blur` +
  saturation + inset highlights). Magnification is a shared `mouseX` motion
  value mapped through per-icon distance transforms; the pill height never
  changes — icons grow upward out of it. Right-click any icon for a context
  menu; the trash fills up when you delete things.
- **Menu bar** (`components/MenuBar.tsx`) — every menu works: File (new
  window/folder/file), Edit (copy email/phone), View (wallpaper, widgets,
  fullscreen), Go (sections, apps), Window (minimize/zoom + live window list),
  Help, and the Apple menu (About, Sleep, Restart, Shut Down — try them).
  Click opens a menu, hovering neighbors switches, like the real thing.
- **Desktop** — rubber-band multi-select, right-click context menus, drag
  files onto folders, rotating hero title blended into the wallpaper
  (`mix-blend-overlay` + radial mask), glass widgets (clock / calendar /
  status), Launchpad overlay, and Spotlight (**⌘K**) searching apps, sections,
  and actions.

### Mobile (<768px) — `src/macos/ios/IOS.tsx`

Chosen live via `matchMedia` in `src/main.tsx`. An iOS home screen: status bar,
app grid, quick-access section chips, frosted dock. Apps open full-screen with
a spring zoom; swipe the home indicator up to close (the app scales into a card
under your finger). Long-press icons for quick-action sheets; pull down for
search. Games get an on-screen D-pad + action button, 2048 is swipeable,
Minesweeper flags on long-press.

### The apps — `src/macos/apps/`

| App          | What it does                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Finder**   | Browses portfolio sections (Projects with prev/next navigation, Experience timeline, Skills, Education) plus a real virtual file system ("Desktop")                                                                                          |
| **Safari**   | A full one-page portfolio with scroll parallax (drifting orbs, sinking hero) rendered inside browser chrome                                                                                                                                  |
| **Terminal** | A working shell: `help`, `ls`, `cat`, `mkdir`, `touch`, `rm`, `open`, Tab completion, arrow-key history, tap-to-run chips, and several easter eggs (`sudo`, `coffee`, `doom`, `rm -rf /`…)                                                   |
| **Arcade**   | 12 games with real in-game cover art: DOOM, Prince of Persia, Crystal Caves, Lemmings 2 (all via js-dos), Snake, Breakout, 2048, Minesweeper, Pong, Simon, Tic-Tac-Toe, Memory. All sounds are synthesized live with WebAudio (`lib/sfx.ts`) |
| **TextEdit** | Rich-text editor (bold/italic/lists/headings) with debounced autosave into the virtual FS                                                                                                                                                    |
| **Preview**  | The CV as a PDF on a Preview-style board, with download                                                                                                                                                                                      |
| **Contact**  | Form posting to **Netlify Forms** (static registration form in `index.html`, fetch POST from the app), plus all contact links                                                                                                                |
| **Settings** | Wallpaper (gradient presets, 8 Unsplash HD photos, upload your own, custom gradient builder), Appearance (dark/light/system), 8 interface fonts, General (sound, 30s wallpaper shuffle, fullscreen, resets)                                  |
| **Welcome**  | Animated 7-step onboarding, opens on first visit, lives as a desktop file                                                                                                                                                                    |

### Virtual file system — `lib/fs.ts`

Folders and rich-text files persisted to `localStorage`
(`useSyncExternalStore`). Root nodes render as desktop icons. Create from the
desktop right-click, File menu, Finder, or terminal (`mkdir` / `touch`); move
by dragging onto folders (HTML5 drag-and-drop, cycle-guarded); rename inline in
Finder; delete to the trash.

### Settings & theming — `lib/settings.ts`

Persisted store (appearance / font / wallpaper / sound / shuffle). Light mode
is one CSS variable: Tailwind v4 compiles every `white/x` utility through
`var(--color-white)`, so `[data-appearance="light"]` re-inks the whole OS;
`.force-dark` keeps the terminal, game boards, and overlays dark. Google Fonts
load on demand when picked. Wallpaper changes crossfade; shuffle rotates the
photos every 30s until you pick one manually.

### DOS games

js-dos v8 runs in an isolated `public/dos.html?bundle=X` iframe. The `.jsdos`
bundles are **self-hosted in `public/`** because cdn.dos.zone blocks
cross-origin fetches. DOOM and the Apogee titles are shareware releases.

---

## Development

```bash
npm install
npm run dev       # vite dev server
npm run build     # type-check (tsc -b) + production bundle — must pass clean
npm run preview   # serve the production build locally
```

Note: the Contact form only delivers on the deployed Netlify site; locally it
shows a mailto fallback.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`: install → type-check +
build → `netlify deploy --prod`.

One-time setup:

1. Create the site on Netlify (drag-and-drop any build once, or `netlify init`).
2. In the GitHub repo settings → Secrets and variables → Actions, add:
   - `NETLIFY_AUTH_TOKEN` — Netlify → User settings → Applications → Personal access tokens
   - `NETLIFY_SITE_ID` — Netlify → Site configuration → Site information (API ID)
3. Point the `salehos.com` domain at the site in Netlify → Domain management.
4. Netlify Forms: after the first deploy, the `contact` form appears under
   Forms in the Netlify dashboard — enable email notifications there.

`netlify.toml` sets the build command, publish dir, and long-cache headers for
hashed assets and the game bundles.

---

## Editing content

Everything textual — name, role, tagline, contact channels, experience,
projects, skills, education, certificates — lives in
[`src/data/content.ts`](src/data/content.ts) with typed interfaces. Change it
there and every app (Finder, Safari, Terminal, Contact, widgets, Spotlight)
picks it up.

Icons live in `public/icons/` (256px PNGs converted from `.icns` via
`sips -s format png -Z 256 in.icns --out out.png`). Game covers in
`public/games/` are real screenshots captured from the running build.
