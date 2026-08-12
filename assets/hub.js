/* ==========================================================================
   +Learning hub — renders the course grid from window.COURSES (data/courses.js).
   Nothing here needs editing when you add a course; add the file and the
   registry, and the card appears.
   ========================================================================== */

// Set this to your repo URL to light up the footer link. Leave "" to hide it.
const REPO_URL = "https://github.com/sheikhmunim/Ulearn";

// Convention: a course's FIRST tag is its category — that's what the filter
// tabs are built from. The rest are shown as chips on the card.
const LABELS = {
  "ci-cd": "CI/CD",
  "sql": "SQL",
  "devops": "DevOps",
  "api": "APIs"
};

const label = (t) =>
  LABELS[t] || t.replace(/(^|[-\s])([a-z])/g, (_, sep, c) => sep + c.toUpperCase());

const courses = (window.COURSES || [])
  .filter((c) => c.status !== "draft")
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title));

const grid    = document.getElementById("grid");
const filters = document.getElementById("filters");
const empty   = document.getElementById("empty");

/* ---------- cards ---------- */

function card(c) {
  const a = document.createElement("a");
  a.className = "card";
  a.href = c.href;
  a.style.setProperty("--accent", c.accent || "#6FD4E0");
  a.dataset.category = (c.tags && c.tags[0]) || "misc";
  a.setAttribute("aria-label", `${c.title} — ${c.description}`);

  const rest = (c.tags || []).slice(1);

  a.innerHTML = `
    <div class="card-top">
      <div class="card-icon" aria-hidden="true">${c.icon || "📘"}</div>
      ${c.type && c.type !== "course" ? `<span class="badge">${esc(c.type)}</span>` : ""}
    </div>
    <h2>${esc(c.title)}</h2>
    <p>${esc(c.description || "")}</p>
    ${rest.length ? `<div class="chips">${rest.map((t) => `<span class="chip">${esc(label(t))}</span>`).join("")}</div>` : ""}
    <div class="card-meta">
      ${c.level ? `<span>${esc(c.level)}</span><span class="dot">·</span>` : ""}
      ${c.duration ? `<span>${esc(c.duration)}</span>` : ""}
      <span class="go">open →</span>
    </div>
  `;
  return a;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

/* ---------- filters ---------- */

function categories() {
  const counts = new Map();
  for (const c of courses) {
    const cat = (c.tags && c.tags[0]) || "misc";
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function buildFilters() {
  const cats = [["all", courses.length], ...categories()];
  filters.innerHTML = "";

  for (const [cat, n] of cats) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.cat = cat;
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = `${cat === "all" ? "All" : esc(label(cat))}<span class="count">${n}</span>`;
    b.addEventListener("click", () => apply(cat, true));
    filters.appendChild(b);
  }
}

function apply(cat, pushHash) {
  let shown = 0;

  for (const el of grid.children) {
    const match = cat === "all" || el.dataset.category === cat;
    el.hidden = !match;
    if (match) shown++;
  }

  for (const b of filters.children) {
    b.setAttribute("aria-pressed", String(b.dataset.cat === cat));
  }

  empty.hidden = shown > 0;

  if (pushHash) {
    history.replaceState(null, "", cat === "all" ? location.pathname : `#${cat}`);
  }
}

/* ---------- boot ---------- */

function init() {
  if (!courses.length) {
    empty.hidden = false;
    empty.textContent = "No courses registered yet — check data/courses.js.";
    filters.hidden = true;
    return;
  }

  grid.append(...courses.map(card));
  buildFilters();

  const known = new Set([...filters.children].map((b) => b.dataset.cat));
  const fromHash = location.hash.slice(1);
  apply(known.has(fromHash) ? fromHash : "all", false);

  const hands = courses.filter((c) => (c.tags || []).includes("hands-on")).length;
  document.getElementById("stats").innerHTML = [
    `${courses.length} course${courses.length === 1 ? "" : "s"}`,
    hands ? `${hands} hands-on` : null,
    "runs offline",
    "no signup"
  ]
    .filter(Boolean)
    .map((s) => `<span>${esc(s)}</span>`)
    .join("");

  const link = document.getElementById("repoLink");
  if (REPO_URL) link.href = REPO_URL;
  else link.remove();
}

init();
