/* Sample data for the habits screens. Replace with your API:
 *   GET /api/habits        -> window.SIT_SAMPLE.habits      (list, one item per habit)
 *   GET /api/habits/{id}   -> { ...habit, sheets: window.SIT_SAMPLE.sheets[id] }
 * Levels: 0 missed · 1 min · 2 ok · 3 ideal · null not logged yet.
 */
(function () {
  function addDays(iso, n) {
    var p = iso.split("-").map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10);
  }
  // The demo was written around BASE. Every date is shifted so BASE lands on the real "today",
  // so the demo always has a running sheet and matches Create a habit (which starts today).
  var BASE = "2026-11-11";
  var now = new Date(), TODAY = new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  var SHIFT = Math.round((Date.parse(TODAY) - Date.parse(BASE)) / 864e5);
  function at(iso) { return addDays(iso, SHIFT); }
  function rng(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function level(r) { var x = r(); return x < 0.13 ? 0 : x < 0.45 ? 1 : x < 0.83 ? 2 : 3; }

  var defs = [
    { id: "h-meditate", name: "Meditate", unit: "min", color: "rose", len: 7, seed: 11, createdAt: "2026-10-05",
      targets: { min: 1, ok: 15, ideal: 30 },
      reasons: ["Improve my attention span", "Improve my mood", "Connect with my spirituality"],
      notes: [{ text: "There's no perfect moment to act.", color: "butter" }, { text: "The minimum counts. One minute is still a yes.", color: "rose" }, { text: "One breath is still a start.", color: "sky" }, { text: "Future me says thank you.", color: "sage" }, { text: "Missing a day is fine. Missing two is a choice.", color: "butter" }],
      sheets: [
        ["2026-10-05", { min: 5, ok: 15, ideal: 30 }, "Five minutes felt long. Trying one minute next week."],
        ["2026-10-12", { min: 5, ok: 15, ideal: 30 }],
        ["2026-10-19", { min: 5, ok: 15, ideal: 30 }],
        ["2026-10-26", null, "Lowered the minimum to 1 minute. Much easier!"],
        ["2026-11-02", null],
        ["2026-11-09", null]
      ] },
    { id: "h-read", name: "Read", unit: "pages", color: "sky", len: 14, seed: 23, createdAt: "2026-10-14",
      targets: { min: 2, ok: 10, ideal: 20 },
      reasons: ["Learn something every day", "Sleep better"],
      notes: [{ text: "Progress, not perfection.", color: "sky" }],
      sheets: [["2026-10-14"], ["2026-10-28", null, "Finished the novel!"], ["2026-11-11"]] },
    { id: "h-water", name: "Drink water", unit: "glasses", color: "butter", len: 7, seed: 37, createdAt: "2026-10-26",
      targets: { min: 3, ok: 6, ideal: 8 },
      reasons: ["Fewer headaches"],
      notes: [{ text: "Future me says thank you.", color: "sage" }],
      sheets: [["2026-10-26"], ["2026-11-02"], ["2026-11-09"]] },
    { id: "h-stretch", name: "Stretch", unit: "min", color: "sage", len: 30, seed: 41, createdAt: "2026-09-15",
      targets: { min: 2, ok: 10, ideal: 20 },
      reasons: ["Less back pain after work"],
      notes: [],
      sheets: [["2026-09-15"], ["2026-10-15"]] },
    { id: "h-journal", name: "Morning journaling", unit: "min", color: "butter", len: 7, seed: 53, createdAt: "2026-09-28",
      targets: { min: 2, ok: 10, ideal: 20 },
      reasons: ["Start the day with a clear head"],
      notes: [{ text: "One day at a time.", color: "rose" }],
      sheets: [["2026-09-28"], ["2026-10-05"], ["2026-10-12", null, "Paused this one for now."]] }
  ];

  var habits = [], sheets = {};
  defs.forEach(function (h) {
    var r = rng(h.seed), list = [];
    h.sheets.forEach(function (s, i) {
      var start = at(s[0]), days = [];
      for (var k = 0; k < h.len; k++) {
        var d = addDays(start, k);
        days.push({ date: d, level: d <= TODAY ? level(r) : null });
      }
      list.push({ id: h.id + "-" + (i + 1), startDate: start, endDate: addDays(start, h.len - 1),
        targets: s[1] || h.targets, days: days, note: s[2] || null });
    });
    sheets[h.id] = list.slice().reverse(); // API returns newest first; the UI sorts anyway
    var last = list[list.length - 1];
    habits.push({
      id: h.id, name: h.name, unit: h.unit, color: h.color, targets: h.targets, lengthDays: h.len,
      reasons: h.reasons, notes: h.notes, createdAt: at(h.createdAt), sheetsCount: list.length,
      lastSheet: { id: last.id, startDate: last.startDate, endDate: last.endDate, days: last.days.map(function (d) { return d.level; }) }
    });
  });
  /* Preview only: what the user made during this session (Create a habit, Start a new sheet).
   * In the app all of this comes from the API. */
  function read(k) { try { return JSON.parse(sessionStorage.getItem(k) || "[]"); } catch (e) { return []; } }
  function newSheet(h, id, start, targets) {
    var days = [];
    for (var k = 0; k < h.lengthDays; k++) days.push({ date: addDays(start, k), level: null });
    return { id: id, startDate: start, endDate: addDays(start, h.lengthDays - 1), targets: targets, days: days, note: null };
  }
  function summary(h) {
    var list = sheets[h.id], last = list.slice().sort(function (a, b) { return b.startDate.localeCompare(a.startDate); })[0];
    h.sheetsCount = list.length;
    h.lastSheet = { id: last.id, startDate: last.startDate, endDate: last.endDate, days: last.days.map(function (d) { return d.level; }) };
  }
  read("sit-created-habits").forEach(function (p) {
    var h = { id: p.id, name: p.name, unit: p.unit, color: null, targets: p.targets, lengthDays: p.lengthDays,
      reasons: p.reasons, notes: p.notes, createdAt: p.startDate };
    sheets[h.id] = [newSheet(h, h.id + "-1", p.startDate, p.targets)];
    summary(h);
    habits.unshift(h);
  });
  read("sit-new-sheets").forEach(function (n) {
    var h = habits.filter(function (x) { return x.id === n.habitId; })[0];
    if (!h) return;
    if (n.targets) h.targets = n.targets; // the sheet started with targets saved "from the next sheet"
    sheets[h.id] = [newSheet(h, h.id + "-s" + n.startDate, n.startDate, h.targets)].concat(sheets[h.id]);
    summary(h);
  });
  // Targets saved "from the next sheet" that no sheet has used yet. In the app: habit.nextTargets.
  function readMap(k) { try { return JSON.parse(sessionStorage.getItem(k) || "{}"); } catch (e) { return {}; } }
  var pending = readMap("sit-next-targets");
  habits.forEach(function (h) { h.nextTargets = pending[h.id] || null; });

  window.SIT_SAMPLE = {
    today: TODAY, habits: habits, sheets: sheets,
    // Preview helpers used by the screens to remember what the user made.
    saveCreatedHabit: function (payload) {
      var list = read("sit-created-habits"), id = "h-new-" + (list.length + 1);
      list.push(Object.assign({ id: id }, payload));
      try { sessionStorage.setItem("sit-created-habits", JSON.stringify(list)); } catch (e) {}
      return id;
    },
    // A new sheet uses the targets saved "from the next sheet", if any, and clears them.
    saveNewSheet: function (habitId, startDate) {
      var list = read("sit-new-sheets"), next = readMap("sit-next-targets");
      list.push({ habitId: habitId, startDate: startDate, targets: next[habitId] || null });
      delete next[habitId];
      try { sessionStorage.setItem("sit-new-sheets", JSON.stringify(list)); sessionStorage.setItem("sit-next-targets", JSON.stringify(next)); } catch (e) {}
    },
    // Replace with PUT /api/habits/{id}/targets  { targets, from: "next-sheet" }. null clears it.
    saveNextTargets: function (habitId, targets) {
      var next = readMap("sit-next-targets");
      if (targets) next[habitId] = targets; else delete next[habitId];
      try { sessionStorage.setItem("sit-next-targets", JSON.stringify(next)); } catch (e) {}
      habits.forEach(function (h) { if (h.id === habitId) h.nextTargets = targets || null; });
    }
  };
})();
