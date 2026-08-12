# Ulearn — project context

Static learning platform hosted on GitHub Pages. Every course is a **single
self-contained HTML page** — all CSS and JS inline, no build step, no framework,
no bundler. The only shared code is the hub and three small `assets/` scripts.

- **Live:** https://sheikhmunim.github.io/Ulearn/
- **Repo:** https://github.com/sheikhmunim/Ulearn (Pages: deploy from `main` / root)
- **Author:** Sheikh Munim

## Layout

```
index.html              hub / landing page
404.html                derives its home link (project site lives at /Ulearn/, not /)
.nojekyll               REQUIRED — without it Pages runs Jekyll and drops files
courses/<slug>/index.html
assets/hub.{css,js}     landing page only
assets/course-nav.js    back-to-hub pill, injected into every course
assets/progress.js      window.storage shim + Progress summary
data/courses.js         GENERATED — never hand-edit
scripts/build-registry.mjs
.github/workflows/registry.yml
```

## The metadata contract

`data/courses.js` is generated from `<meta name="course:*">` tags in each
course's `<head>`. **The course files are the single source of truth.** Adding a
course means dropping a file and pushing — see the `add-course` skill.

Fields: `title` `description` `tags` `level` `duration` `type` `accent` `icon`
`status` `order`. Only `title` is required; everything else has a default.

- **The first tag is the category** — that's what the hub's filter tabs are built
  from. Remaining tags become chips.
- `status: draft` keeps a course in the registry but hides it from the hub.
- `type` other than `course` renders a badge (`lab`, `simulator`).

## Commands

```bash
npm run build:registry    # regenerate data/courses.js
npm run check:registry    # exit 1 if stale (what PR CI runs)
python -m http.server 8000
```

No dependencies. Node 18+ only for the generator.

## Design rules — deliberate, do not "fix"

**Never unify the course themes.** Each course carries its own complete design
system inline: blueprint navy, VS Code chrome, rust forge, GitHub dark, Actions
run log. That variety is the best thing about this repo. `assets/` holds only
the hub and shared chrome, and `course-nav.js` renders in a **shadow root**
specifically so it can never leak styles into a course.

**CI/CD Sandbox has no progress bar on purpose.** It's a one-sitting simulator
with no discrete steps; a bar would invent a number.

**The registry is `.js`, not `.json`, on purpose.** `window.COURSES = [...]`
loads over `file://`; `fetch()` on a JSON file does not. This keeps
double-clicking `index.html` working with no server.

## Gotchas discovered the hard way

Each of these cost real debugging time. They are not obvious from the code.

- **`window.storage` is a phantom API.** Rust and Blueprint were written against
  `window.storage.get/set`, which **no browser implements**, wrapped in silent
  `try/catch` — so every save vanished and progress died on refresh.
  `assets/progress.js` supplies it via localStorage. **Do not remove that shim**;
  two courses depend on it and will fail silently again.
- **`.card[hidden]` needs an explicit rule.** `.card { display:flex }` outranks
  the UA sheet's `[hidden] { display:none }`, so filtering silently did nothing.
  See the comment in `hub.css`.
- **Bare `on:` in YAML parses as boolean `true`.** GitHub's parser is fine, but
  third-party YAML tools return the key `True`. Validating `registry.yml` with
  Python's `yaml` requires `d.get('on', d.get(True))`.
- **Never chain `.replace()` to highlight code.** In `github-actions-lab`, the
  quoted-string pattern matched into the `class="…"` of a span an earlier
  replace had inserted. Highlighters there tokenize in one pass and escape
  per-token.
- **JetBrains Mono ligatures render `!=` as `≠`.** Disabled via
  `font-feature-settings` in code blocks — courses teach characters people must
  actually type.
- **Chrome caches aggressively over `http.server`.** After editing CSS/JS,
  hard-reload (`ctrl+shift+r`) or you will debug a stale file. This wasted time
  more than once.

## CI

`.github/workflows/registry.yml` has two jobs:

- **`rebuild`** (push to `main`) — regenerates the registry and commits it back
  with `[skip ci]`. Needs `permissions: contents: write`.
- **`verify`** (pull requests) — runs `--check` only. It cannot commit, because
  **fork PRs get no secrets and a read-only token**. That constraint is the
  reason for the split, not a stylistic choice.

Path filters mean it only fires on changes under `courses/`, the generator, or
the workflow itself.

## Not done yet

- **No tests.** The user was asked and deferred. `--check` is a consistency
  check, not a test — it would pass even if the generator parsed tags wrongly,
  as long as it did so consistently. A plan exists: `node --test` with `node:vm`
  to run the real browser scripts against a stub `window`/`localStorage`, no
  dependencies.
- The Level 7 capstone in `github-actions-lab` describes a real link checker
  (`scripts/check-links.mjs` + a scheduled workflow) that has **not** been built.
  The courses depend on CDNs — sql.js, Google Fonts — so it would be genuinely
  useful.
- Phase 5 polish, untouched: search, OG/social images, vendoring the sql.js and
  Google Fonts CDNs for true offline use.
