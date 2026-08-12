---
name: add-course
description: Add a new course to Ulearn, or fix one that isn't showing up on the landing page. Use when adding/registering/wiring a course, when a dropped HTML file doesn't appear on the hub, or when the registry (data/courses.js) is stale or out of sync with courses/.
---

# Adding a course to Ulearn

Courses are self-contained HTML pages discovered through their own metadata.
There is no manual registration step — `data/courses.js` is **generated**.

## Steps

### 1. Place the file

```
courses/<slug>/index.html
```

The slug becomes the public URL (`/courses/<slug>/`), so use kebab-case. Any
images or data the course needs go in that same folder.

### 2. Add the metadata block

Immediately after `<title>` in the `<head>`:

```html
<!-- course registry metadata — read by scripts/build-registry.mjs -->
<meta name="course:title"       content="Course Name">
<meta name="course:description" content="One sentence on what someone can do afterwards.">
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
| `tags` | **First tag is the category** — it builds the hub's filter tabs. Rest become chips. Check existing categories first (`devops`, `systems`, `languages`, `databases`) rather than inventing a near-duplicate. |
| `level` | `beginner` / `intermediate` / `advanced` |
| `type` | `course` (linear) or `lab` / `simulator` — anything but `course` gets a badge |
| `accent` | The course's signature colour. Tints its card and its back-to-hub pill. Pick one distinct from the existing five. |
| `status` | `live`, or `draft` to keep it in the repo but off the hub |
| `order` | Optional, default 100. Lower sorts first. Otherwise alphabetical by **title**. |

If the tag isn't a plain word, add a display label to `LABELS` in
`assets/hub.js` — otherwise `github-actions` renders as "Github-Actions".

### 3. Wire the shared chrome

In `<head>`, **before** the course's own script (it must exist when that script
runs):

```html
<script src="../../assets/progress.js"></script>
```

Last line before `</body>`:

```html
<script src="../../assets/course-nav.js"></script>
```

### 4. Report progress (skip for non-step-based courses)

Wherever the course already recomputes how many steps are finished, add:

```js
Progress.report(doneCount, totalCount);
```

That one call is what draws the bar on the card. Persist the course's own state
through `window.storage.get/set` — the localStorage-backed shim in
`progress.js`, which several courses already use.

### 5. Regenerate and verify

```bash
npm run build:registry
```

It prints each course found and warns about missing fields. Then serve and look
at it — do not skip this:

```bash
python -m http.server 8000
```

Check: the card appears with the right accent/badge/tags, the filter tab counts
are right, the back-to-hub pill is present and correctly tinted, and the course
itself still works from its new path.

### 6. Commit

Commit the course **and** the regenerated `data/courses.js` together. CI would
rebuild it anyway on push, but committing it keeps `file://` and PR CI happy.

## House style

Match the repo, which matters more here than usual:

- **Give the course its own complete visual identity**, inline. Do not reuse
  another course's palette and do not factor styles into `assets/` — that
  directory is for the hub and shared chrome only. The existing five are
  blueprint navy, VS Code chrome, rust forge, GitHub dark, and Actions run log.
- **Make it interactive.** Every course does something: runs SQL, assembles a
  pipeline, builds YAML and plays it back. Prose alone doesn't fit here.
- **Let things fail on purpose.** The best moments in these courses are the
  deliberate failure paths that show *why* a construct exists.

## If a course isn't showing up

Work down this list:

1. Is the file at `courses/<slug>/index.html` exactly? A stray subfolder or a
   differently named entry point is skipped with a warning.
2. Does it have `<meta name="course:title">`? Without it the generator skips the
   course entirely — check the command's warning output.
3. Is `status` set to `draft`? Drafts stay in the registry but the hub filters
   them out.
4. Did you rerun `npm run build:registry`?
5. **Hard-reload the browser** (`ctrl+shift+r`). Chrome caches `data/courses.js`
   aggressively over `http.server`, and a stale registry looks exactly like a
   broken one.
