/* ==========================================================================
   progress.js — shared, persistent progress for Ulearn courses.

   Load it in a course's <head>, BEFORE that course's own script:
     <script src="../../assets/progress.js"></script>

   It does two things:

   1. Provides `window.storage`, a promise-based key/value store backed by
      localStorage. Several courses were already written against this API but
      no browser implements it, so their saves were failing silently into a
      catch block and progress died on refresh. Defining it here makes those
      courses persist with no changes to their own code.

   2. Provides `window.Progress`, a tiny summary the hub reads to show
      "3 of 7" on a course card. A course calls Progress.report(done, total)
      whenever its completion count changes.

   Everything is local to the browser. Nothing is uploaded anywhere.
   ========================================================================== */

(function () {
  "use strict";

  var STORE_PREFIX = "ulearn:storage:";
  var SUMMARY_KEY = "ulearn:progress:v1";

  /* Private browsing and blocked-cookie modes make localStorage throw on
     access rather than just return null, so every use is guarded. */
  function ls() {
    try {
      var s = window.localStorage;
      s.getItem(STORE_PREFIX + "__probe");
      return s;
    } catch (e) {
      return null;
    }
  }

  /* ---------- 1. window.storage shim ---------- */

  if (!window.storage) {
    window.storage = {
      get: function (key) {
        var s = ls();
        var raw = s ? s.getItem(STORE_PREFIX + key) : null;
        // Courses read `res.value`, and treat a missing key as "no saved data".
        return Promise.resolve(raw === null ? null : { value: raw });
      },
      set: function (key, value) {
        var s = ls();
        if (s) {
          try {
            s.setItem(STORE_PREFIX + key, String(value));
          } catch (e) {
            // Quota exceeded — not worth breaking the lesson over.
          }
        }
        return Promise.resolve();
      },
      remove: function (key) {
        var s = ls();
        if (s) s.removeItem(STORE_PREFIX + key);
        return Promise.resolve();
      }
    };
  }

  /* ---------- 2. Progress summary ---------- */

  function readAll() {
    var s = ls();
    if (!s) return {};
    try {
      return JSON.parse(s.getItem(SUMMARY_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function writeAll(obj) {
    var s = ls();
    if (!s) return;
    try {
      s.setItem(SUMMARY_KEY, JSON.stringify(obj));
    } catch (e) {
      /* ignore */
    }
  }

  /** Course pages live at .../courses/<slug>/, so the slug is in the path. */
  function currentSlug() {
    var parts = location.pathname.split("/").filter(Boolean);
    var i = parts.lastIndexOf("courses");
    if (i !== -1 && parts[i + 1]) return parts[i + 1];
    return null;
  }

  window.Progress = {
    slug: currentSlug,

    /** Record how far through a course the learner is. */
    report: function (done, total, slug) {
      var id = slug || currentSlug();
      if (!id || !isFinite(done) || !isFinite(total) || total <= 0) return;

      var all = readAll();
      var prev = all[id];
      done = Math.max(0, Math.min(Math.round(done), total));

      // Don't churn storage (or the `updated` timestamp) on identical reports.
      if (prev && prev.done === done && prev.total === total) return;

      all[id] = { done: done, total: total, updated: Date.now() };
      writeAll(all);
    },

    get: function (slug) {
      return readAll()[slug || currentSlug()] || null;
    },

    all: readAll,

    reset: function (slug) {
      var all = readAll();
      delete all[slug || currentSlug()];
      writeAll(all);
    },

    /** Clears the summary and every course's own saved state. */
    resetAll: function () {
      var s = ls();
      if (!s) return;
      var kill = [];
      for (var i = 0; i < s.length; i++) {
        var k = s.key(i);
        if (k === SUMMARY_KEY || k.indexOf(STORE_PREFIX) === 0) kill.push(k);
      }
      kill.forEach(function (k) {
        s.removeItem(k);
      });
    }
  };
})();
