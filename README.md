# Ulearn

A small library of interactive courses that run entirely in the browser. Every
course is a single self-contained HTML page — no build step, no framework, no
signup. Open the file and it works.

Built by [Sheikh Munim](https://github.com/sheikhmunim).

**Live site:** https://sheikhmunim.github.io/Ulearn/

---

## Courses

| Course | Topic | Level | Length |
|---|---|---|---|
| [SQL Lab](courses/sql-lab/) | Databases | Intermediate | 7 days |
| [Blueprint](courses/architecture-academy/) | Architecture | Advanced | 7 days |
| [Rust in 7 Days](courses/rust-in-7-days/) | Languages | Beginner | 7 days |
| [CI/CD Sandbox](courses/cicd-simulator/) | DevOps | Beginner | ~1 hour |

---

## Adding a new course

Three steps, and the card shows up on the landing page.

**1. Drop the file in.**

```
courses/<your-slug>/index.html
```

The slug becomes the URL (`/courses/your-slug/`), so keep it kebab-case and
descriptive. Any images or data files the course needs live in that same folder.

**2. Paste the metadata block into its `<head>`,** just after the `<title>`:

```html
<meta name="course:title"       content="Your Course">
<meta name="course:description" content="One sentence on what someone will be able to do afterwards.">
<meta name="course:tags"        content="devops,docker,hands-on">
<meta name="course:level"       content="beginner">
<meta name="course:duration"    content="7 days">
<meta name="course:type"        content="course">
<meta name="course:accent"      content="#4EA1D3">
<meta name="course:icon"        content="🐳">
<meta name="course:status"      content="live">
```

| Field | Notes |
|---|---|
| `tags` | Comma-separated. **The first tag is the category** — it's what the filter tabs are built from. The rest render as chips on the card. |
| `level` | `beginner` · `intermediate` · `advanced` |
| `type` | `course` (linear, day-based) or `simulator` / `lab` — anything other than `course` gets a badge. |
| `accent` | The course's own signature colour. Tints its card and its back-to-hub pill. |
| `status` | `live` shows it; `draft` hides it from the hub while keeping the file in the repo. |
| `order` | Optional. Lower sorts first, default `100`. Only add it if you want to override alphabetical order. |

**3. Add the back-to-hub link** as the last line before `</body>`:

```html
<script src="../../assets/course-nav.js"></script>
```

Then commit and push. CI regenerates `data/courses.js` from your metadata,
commits it back, and Pages redeploys — the card appears on its own.

To see it locally before pushing, regenerate the registry yourself:

```bash
npm run build:registry
```

That's the same script CI runs. It needs Node 18+ and installs nothing.

---

## Layout

```
index.html              the hub / landing page
404.html
.nojekyll               required — stops GitHub Pages running Jekyll
courses/<slug>/         one folder per course, entry point is index.html
assets/
  hub.css               landing page styles
  hub.js                renders the grid from the registry
  course-nav.js         injects the back-to-hub pill into any course
data/courses.js         GENERATED registry the hub reads — don't hand-edit
scripts/
  build-registry.mjs    course files -> data/courses.js
.github/workflows/
  registry.yml          rebuilds the registry on push, verifies it on PRs
```

### Scripts

| Command | What it does |
|---|---|
| `npm run build:registry` | Rewrites `data/courses.js` from the course metadata. |
| `npm run check:registry` | Exits non-zero if the registry is stale. This is what PR CI runs. |

### A note on styling

Each course carries its own complete design system inline, and that is
deliberate — the blueprint navy, the VS Code chrome, the rust forge, the
GitHub dark. They are not meant to be unified. `assets/` only holds the hub and
the one small piece of shared chrome, and `course-nav.js` renders inside a
shadow root specifically so it can never leak styles into a course page.

---

## Running locally

Open `index.html` in a browser. That's it — the registry is a plain `.js` file
rather than JSON precisely so this works over `file://` without a server.

If you'd rather serve it:

```bash
python -m http.server 8000
```

---

## Deploying

GitHub Pages, deploying from `main` at the repository root:

1. Push to `main`.
2. **Settings → Pages → Source:** _Deploy from a branch_ → `main` / `/ (root)`.
3. Wait a minute; the site is at https://sheikhmunim.github.io/Ulearn/.

All internal paths are relative, so it works at a project path, at a user-site
root, or on a custom domain without changes.

---

## Contributing

Corrections, new courses, and fixes are welcome — open an issue or a PR. A new
course only needs to follow the three steps above.

## License

Code is MIT (see [LICENSE](LICENSE)). Course **content** — the writing, the
exercises, the explanations — is [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/):
use it, remix it, teach with it, just credit it and keep it open.
