# Portfolio — Janos Lei A. Arana

**Live:** https://janos-arana.vercel.app

Personal portfolio site. Plain HTML, CSS and JavaScript — no build step.

## Structure

```
index.html        all content lives here
css/style.css     design tokens (dark/light), layout, components
js/main.js        theme, nav highlighting, Ctrl+K palette, typing test, GitHub graph
assets/           photo.jpg, favicon.svg, projects/*.jpg
```

## Editing content

- **Bio / hero** — `<section class="hero">` in `index.html`.
- **Projects** — duplicate an `<article class="project">` block.
- **Experience, skills, certs, orgs** — each is a plain list in its section.
- Anything still marked with `class="placeholder"` shows a yellow *placeholder* badge; remove the class once real content is in.
- Add your headshot as `assets/photo.jpg` (square, ≥400px). If it's missing the site shows initials instead.

## Running locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Deploy

Push to `main`. Vercel is connected to this repo and deploys automatically; no framework preset or build command needed (static).

## Shortcuts

- `Ctrl/Cmd + K` — jump to a section
- `Ctrl/Cmd + J` — typing test
