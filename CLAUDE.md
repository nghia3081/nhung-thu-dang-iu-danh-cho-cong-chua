# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal collection of standalone romantic "thiệp" (greeting card) pages in Vietnamese, deployed as a static site to GitHub Pages at `https://nghia3081.github.io/nhung-thu-dang-iu-danh-cho-cong-chua/`. The root `index.html` is a timeline dashboard that links to each dated page under `2026/MM/DD/`.

Each dated page is **independent** — its own theme, fonts, palette, animations, and stack. There is no shared design system or component library across dates. Treat each `2026/MM/DD/` folder as a separate mini-project.

## Architecture: two page patterns

Dated pages follow one of two patterns. Identify which before editing:

### Pattern A — Plain HTML/CSS/JS (no build step)

Used by: `2026/03/08/`, `2026/03/22/`.

- `2026/03/08/index.html` — single self-contained file with inline `<style>` and `<script>`. Fonts loaded from Google Fonts CDN.
- `2026/03/22/` — split into `index.html` + `styles.css` + `animations.js`, with **GSAP loaded from cdnjs** (`https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`). Uses `sessionStorage` key `thiep-v2-card-state` for scene progress.
- Edit files directly; the deploy workflow copies them verbatim into the published site.

### Pattern B — React + Vite + Tailwind v4 (built by CI)

Used by: `2026/04/19/`, `2026/04/30/`. **The dated folder IS the Vite project root** — no nested `rj/`/`prj/` subfolder. `src/`, `public/`, `package.json`, `vite.config.ts` etc. live directly inside the date folder.

- Stack: React 19, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), `motion` (Framer Motion successor), `lucide-react`, `@google/genai` (Gemini SDK — these are AI Studio apps), `html-to-image`/`html2canvas` (30/4 only, for "download as image" feature).
- `vite.config.ts` uses default `outDir: 'dist'`. Build produces `2026/MM/DD/dist/{index.html, assets/, ...}`. The `dist/` folder is gitignored. CI copies its contents into the deployed `_site/2026/MM/DD/` path.
- **Source `index.html` lives at the date-folder root** (e.g. `2026/04/19/index.html`). This is the Vite entry — it has `%SEO_*%` placeholders for 04/19, or is plain for 04/30. **Don't open it directly in a browser for preview** — it's a template, not the rendered page. Use `npm run dev` or `npm run preview` (after build) instead.

### Common commands (Pattern B, run from inside `2026/MM/DD/`)

```bash
npm install
npm run dev      # vite dev server on port 3000, host 0.0.0.0
npm run build    # builds to ./dist/
npm run lint     # tsc --noEmit (type check only; no ESLint config)
npm run preview  # serves ./dist on a local server
npm run clean    # rm -rf dist
```

There is no test framework configured anywhere in the repo.

### Build base path quirks

Both vite configs read env vars to control deploy URLs. CI sets these in `.github/workflows/deploy.yml`; for local builds you can either set them yourself or accept the relative-path fallback.

- **`2026/04/19/vite.config.ts`** — reads `APP_URL` (or `VITE_PUBLIC_SITE_URL`) and rewrites `%SEO_EXTRA_LINKS%` / `%SEO_OG_IMAGE%` placeholders in `index.html`. Without it, OG/canonical URLs fall back to relative paths.
- **`2026/04/30/vite.config.ts`** — reads `VITE_BASE_PATH` and sets Vite's `base`. CI sets `VITE_BASE_PATH=/nhung-thu-dang-iu-danh-cho-cong-chua/2026/04/30/`. If you build locally without it, asset URLs default to `/` and will 404 when served from the subpath.
- `.env.production` is NOT tracked (per-project `.gitignore` excludes `.env*` except `!.env.example`). CI sets env vars inline; a fresh clone won't have these files.

### Env vars (Pattern B)

`GEMINI_API_KEY` is exposed to client code via `define: { 'process.env.GEMINI_API_KEY': ... }`. Keep `.env*` files out of commits (the per-project `.gitignore` already enforces this).

### Asset path conventions (Pattern B)

- **`2026/04/19/`** references images and music as **plain string paths** (`"./assets/images/1.jpeg"` in `src/App.tsx`), NOT through Vite `import.meta.glob`. To get stable, deterministic output paths, these source assets live in **`2026/04/19/public/assets/`** so Vite copies them verbatim to `dist/assets/` (alongside the hashed `index-XXX.js`/`.css` Vite emits). Don't rename or move these files without also updating `App.tsx` references.
- **`2026/04/30/`** uses `import.meta.glob('./assets/images/*')` in `src/App.tsx`, so Vite content-hashes filenames (e.g. `moc.jpeg` → `moc-Bs2i1P63.jpeg`). That breaks any external reference (like the root dashboard cover) — so the dashboard cover image lives in **`2026/04/30/public/cover.jpeg`** to get a stable, non-hashed path at `dist/cover.jpeg` → deployed `2026/04/30/cover.jpeg`.

## Deployment

GitHub Pages is configured to deploy from **GitHub Actions** (Settings → Pages → Source: "GitHub Actions"). The workflow at `.github/workflows/deploy.yml`:

1. Triggers on push to `main` (and manual `workflow_dispatch`).
2. Installs deps + runs `npm run build` for each Pattern B project, passing the right env vars (`APP_URL` for 04/19, `VITE_BASE_PATH` for 04/30).
3. Assembles `_site/` with the root dashboard, Pattern A folders copied verbatim, and Pattern B `dist/` folders copied to their date paths.
4. Uploads the artifact and deploys via `actions/deploy-pages@v4`.

There is no fallback "deploy from branch" — the workflow is the only deploy path.

## Adding a new dated page

1. Create `2026/MM/DD/` and decide Pattern A or B based on complexity.
2. Pattern B: copy an existing flattened project (`2026/04/19/` or `2026/04/30/`) as a starting point. Add a build step for the new date to `.github/workflows/deploy.yml`, including any needed env vars. Update the `cache-dependency-path` list with the new `package-lock.json`. Add the assembly step (`cp -R 2026/MM/DD/dist _site/2026/MM/DD`).
3. Add a new `<a class="timeline-node">` block to the root `index.html` pointing to `2026/MM/DD/`. The cover image path is relative to the repo root (no leading slash). If using Pattern B with hashed assets, put a stable copy of the cover in `public/` so its deployed path doesn't change between builds.

## Empty scaffolding to ignore

`openspec/` (empty spec dirs), `.cursor/commands/`, `.cursor/skills/`, `.gitnexus/` are empty placeholder folders left from tooling — no active content. Don't waste time exploring them.
