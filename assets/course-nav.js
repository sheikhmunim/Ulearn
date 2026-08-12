/* ==========================================================================
   course-nav.js — injects a "back to hub" pill into any course page.

   Add this one line near the end of a course's <body>:
     <script src="../../assets/course-nav.js"></script>

   Everything lives inside a shadow root, so none of it can collide with the
   host page's CSS — which matters here, because every course ships its own
   full design system.
   ========================================================================== */

(function () {
  "use strict";

  if (document.getElementById("hub-nav-root")) return; // already injected

  var meta = function (name) {
    var el = document.querySelector('meta[name="course:' + name + '"]');
    return el ? el.getAttribute("content") : null;
  };

  var accent = meta("accent") || "#9AA6B8";

  // The hub sits two levels up from courses/<slug>/index.html. Using a
  // relative path keeps this working on file://, on a project Pages site,
  // and on a custom domain alike.
  var HUB = "../../";

  var host = document.createElement("div");
  host.id = "hub-nav-root";
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML = [
    "<style>",
    ":host{ all:initial; }",
    ".pill{",
    "  position:fixed; right:16px; bottom:16px; z-index:2147483000;",
    "  display:inline-flex; align-items:center; gap:8px;",
    "  height:34px; padding:0 14px 0 12px;",
    "  border-radius:999px;",
    "  background:rgba(14,16,20,0.82);",
    "  border:1px solid " + accent + "59;",
    "  color:#E4E8EE;",
    "  font:500 12.5px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;",
    "  text-decoration:none; white-space:nowrap; cursor:pointer;",
    "  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);",
    "  box-shadow:0 4px 20px rgba(0,0,0,0.45);",
    "  opacity:.72;",
    "  transition:opacity .16s ease, border-color .16s ease, transform .16s ease;",
    "}",
    ".pill:hover, .pill:focus-visible{",
    "  opacity:1; transform:translateY(-1px);",
    "  border-color:" + accent + ";",
    "}",
    ".pill:focus-visible{ outline:2px solid " + accent + "; outline-offset:2px; }",
    ".arrow{ color:" + accent + "; font-size:14px; line-height:1; }",
    "@media (max-width:520px){",
    "  .pill{ right:12px; bottom:12px; height:32px; padding:0 12px 0 10px; font-size:12px; }",
    "}",
    "@media (prefers-reduced-motion:reduce){ .pill{ transition:none; } .pill:hover{ transform:none; } }",
    "@media print{ .pill{ display:none; } }",
    "</style>",
    '<a class="pill" href="' + HUB + '">',
    '  <span class="arrow" aria-hidden="true">←</span>',
    "  <span>All courses</span>",
    "</a>"
  ].join("\n");

  (document.body || document.documentElement).appendChild(host);
})();
