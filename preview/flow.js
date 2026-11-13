/* StayInTrackApp · preview navigation
 * Load after design-system/components/bundle.js. Gives every screen a working NavBar and in-page links:
 *   <${S.NavBar} active="home" user="Ana" ...${SITFlow.nav}/>
 *   SITFlow.go('tracker')      go to a NavBar id or to a file name (with or without ?query)
 * The "App flow" pill on every screen goes back to preview/index.html. In the app, replace go() with your router.
 */
(function () {
  var ROUTES = {
    login: "login.html", home: "home.html", suggestions: "suggestions.html",
    distractors: "distractors.html", tracker: "minimal-tracker.html", wish: "catch-a-wish.html",
    habits: "my-habits-calendar.html", create: "create-habit.html", week: "week.html",
    // AI helper: one chat and one weekly report (with Distractions and Habits tabs).
    helper: "helper.html", summary: "weekly-summary.html",
    "summary-distractions": "weekly-summary.html?tab=distractions",
    "summary-habits": "weekly-summary.html?tab=habits",
    // Old AI ids, kept so older links still land in the right place.
    plan: "helper.html", ask: "helper.html",
    patterns: "weekly-summary.html?tab=distractions", "ai-habits": "weekly-summary.html?tab=habits"
  };

  function go(id) {
    location.href = ROUTES[id] || id;
  }

  window.SITFlow = {
    go: go,
    nav: { onNavigate: go, hideMenus: [] },
    index: "../index.html"
  };

  // "App flow" pill: back to the index, added on screens that don't have one.
  document.addEventListener("DOMContentLoaded", function () {
    var a = document.querySelector('a[href="../index.html"]');
    if (!a) {
      a = document.createElement("a");
      a.setAttribute("style", "position:fixed;left:16px;bottom:16px;z-index:99;font:600 13px/18px Hind,system-ui,sans-serif;padding:8px 14px;border-radius:999px;border:2px solid var(--ink);background:var(--paper-raised);color:var(--ink);text-decoration:none");
      document.body.appendChild(a);
    }
    a.href = window.SITFlow.index;
    a.innerHTML = "&larr; App flow";
  });
})();
