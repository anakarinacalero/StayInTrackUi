/* StayInTrackApp · preview data shared by Home, the AI helper and the tracker.
 * Load after modules/habits/sample-data.js (habit numbers) and before the screen script.
 *   SITAI.tasks   today's tasks, shared by Home and the helper (sessionStorage "sit-tasks")
 *   SITAI.scope   what the helper can see (sessionStorage "sit-ai-scope")
 *   SITAI.*       habit numbers computed from window.SIT_SAMPLE, so every screen tells the same story
 * In the app these come from the API (see design-system/README.md · AI helper).
 */
(function () {
  var DATA = window.SIT_SAMPLE || { today: new Date().toISOString().slice(0, 10), habits: [], sheets: {} };
  var TODAY = DATA.today;

  function load(k, d) { try { var v = sessionStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function listeners() { var l = []; return { on: function (f) { l.push(f); return function () { l = l.filter(function (x) { return x !== f; }); }; }, fire: function (v) { l.forEach(function (f) { f(v); }); } }; }

  /* ---------- dates (ISO, Monday weeks like My week) ---------- */
  function parse(iso) { var p = iso.split("-").map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
  function addDays(iso, n) { var d = parse(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function weekStart(iso) { var d = parse(iso || TODAY); return addDays(iso || TODAY, -((d.getUTCDay() + 6) % 7)); }
  function fmt(iso, o) { return parse(iso).toLocaleDateString("en-US", Object.assign({ timeZone: "UTC" }, o)); }
  function dayName(iso) { return fmt(iso, { weekday: "short" }); }
  function range(a, b) { return fmt(a, { month: "short", day: "numeric" }) + " – " + fmt(b, { month: "short", day: "numeric" }); }

  /* ---------- tasks (D2) ---------- */
  var TASKS = [
    { id: "t1", txt: "Pay the electricity bill", p: "high", c: true, min: 5 },
    { id: "t2", txt: "Send the report to Leo", p: "high", c: true, min: 15 },
    { id: "t3", txt: "Water the plants (before they die)", p: "mid", c: true, min: 5 },
    { id: "t4", txt: "Put the laundry out to dry", p: "mid", c: false, min: 10 },
    { id: "t5", txt: "Unpack the last moving box", p: "low", c: false, min: 40,
      breakdown: [{ txt: "Empty the box onto the bed", min: 5 }, { txt: "Put each thing where it lives", min: 25 }, { txt: "Fold the box for recycling", min: 2 }] }
  ];
  var tl = listeners();
  var tasks = {
    all: function () { return load("sit-tasks", TASKS); },
    set: function (list) { save("sit-tasks", list); tl.fire(list); },
    update: function (id, patch) { tasks.set(tasks.all().map(function (t) { return t.id === id ? Object.assign({}, t, patch) : t; })); },
    pending: function () { return tasks.all().filter(function (t) { return !t.c; }); },
    on: tl.on
  };

  /* ---------- what the helper can see (A4) ---------- */
  var SOURCES = [
    { key: "tasks", label: "Tasks", note: "Today, by priority on Home" },
    { key: "habits", label: "Habits and tracker days", note: "Minimal tracker, My habits" },
    { key: "distractors", label: "Distractors and focus sessions", note: "Distractors" },
    { key: "wishes", label: "Caught wishes", note: "Catch a wish" }
  ];
  var sl = listeners();
  var scope = {
    sources: SOURCES,
    get: function () { return Object.assign({ tasks: true, habits: true, distractors: true, wishes: true }, load("sit-ai-scope", {})); },
    set: function (k, v) { var s = scope.get(); s[k] = v; save("sit-ai-scope", s); sl.fire(s); },
    on: sl.on
  };

  /* ---------- habits (D1): every number comes from the sample sheets ---------- */
  var byDay = {}; // habitId -> date -> level
  Object.keys(DATA.sheets).forEach(function (id) {
    byDay[id] = {};
    DATA.sheets[id].forEach(function (s) { s.days.forEach(function (d) { byDay[id][d.date] = d.level; }); });
  });
  function habit(id) { return DATA.habits.filter(function (h) { return h.id === id; })[0]; }
  function levelOn(id, date) { var v = byDay[id] && byDay[id][date]; return v === undefined ? undefined : v; }
  function isRunning(s) { return s.startDate <= TODAY && TODAY <= s.endDate; }
  function currentSheet(id) {
    var list = (DATA.sheets[id] || []).slice().sort(function (a, b) { return b.startDate.localeCompare(a.startDate); });
    return list.filter(isRunning)[0] || list.filter(function (s) { return s.startDate <= TODAY; })[0] || null;
  }

  /* Per day of the week: how many habits reached at least the minimum. Future days are null. */
  function week(ws) {
    ws = weekStart(ws);
    var days = [], tracked = {};
    for (var i = 0; i < 7; i++) {
      var d = addDays(ws, i), n = 0;
      DATA.habits.forEach(function (h) { var v = levelOn(h.id, d); if (v !== undefined) tracked[h.id] = 1; if (v >= 1) n++; });
      days.push({ date: d, label: dayName(d), value: d > TODAY ? null : n });
    }
    var past = days.filter(function (x) { return x.value !== null; });
    var ids = Object.keys(tracked);
    // A habit is "kept" this week when it reached the minimum on more than half of the days so far.
    var kept = ids.filter(function (id) {
      var hit = past.filter(function (x) { return levelOn(id, x.date) >= 1; }).length;
      return past.length && hit / past.length > 0.5;
    });
    var sorted = past.slice().sort(function (a, b) { return b.value - a.value; });
    return { start: ws, end: addDays(ws, 6), days: days, past: past, tracked: ids.length, kept: kept.length,
      checkins: past.reduce(function (a, x) { return a + x.value; }, 0),
      best: sorted.filter(function (x) { return sorted.length && x.value === sorted[0].value; }),
      lightest: sorted.length > 1 ? sorted[sorted.length - 1] : null };
  }

  /* Last 30 days per habit being tracked now: days at least at the minimum, of the days it was tracked. */
  function month() {
    var from = addDays(TODAY, -29);
    return DATA.habits.filter(function (h) { return (DATA.sheets[h.id] || []).some(isRunning); }).map(function (h) {
      var total = 0, hit = 0;
      for (var d = from; d <= TODAY; d = addDays(d, 1)) { var v = levelOn(h.id, d); if (v !== undefined) { total++; if (v >= 1) hit++; } }
      return { id: h.id, name: h.name, hit: hit, total: total, rate: total ? hit / total : 0 };
    }).filter(function (x) { return x.total >= 5; }).sort(function (a, b) { return a.rate - b.rate; });
  }
  /* One habit, per week, for the last 4 weeks: days at least at the minimum. */
  function byWeek(id) {
    var out = [], ws = weekStart(TODAY);
    for (var w = 3; w >= 0; w--) {
      var s = addDays(ws, -7 * w), n = 0;
      for (var i = 0; i < 7; i++) { var d = addDays(s, i); if (d <= TODAY && levelOn(id, d) >= 1) n++; }
      out.push({ label: w ? "Wk of " + fmt(s, { month: "short", day: "numeric" }) : "This week", value: n });
    }
    return out;
  }

  /* Habit suggestion (Weekly summary · Habits, and the tracker when a sheet ends).
   * Reads the days logged so far in the current or last sheet. The helper proposes; the user decides. */
  function qty(n, unit) { return n + " " + (n === 1 && /s$/.test(unit) ? unit.slice(0, -1) : unit); }
  function pastDays(s) { return s.days.filter(function (d) { return d.date < TODAY || (d.date === TODAY && d.level !== null); }); }
  function suggestion(id) {
    var h = habit(id);
    // The current sheet if it has 4+ days logged, otherwise the one before it.
    var s = (DATA.sheets[id] || []).slice().sort(function (a, b) { return b.startDate.localeCompare(a.startDate); })
      .filter(function (x) { return pastDays(x).length >= 4; })[0];
    if (!h || !s) return null;
    var past = pastDays(s);
    var n = past.length, t = s.targets || h.targets;
    var minPlus = past.filter(function (d) { return d.level >= 1; }).length;
    var ideal = past.filter(function (d) { return d.level === 3; }).length;
    var missed = n - minPlus;
    var base = { habitId: id, name: h.name, unit: h.unit, targets: t, days: n, minPlus: minPlus, ideal: ideal, missed: missed, sheet: s,
      when: isRunning(s) ? "this sheet" : "last sheet" };
    if (ideal / n >= 0.6) return Object.assign(base, { kind: "raise", tone: "sage", icon: "sprout",
      title: "You reached ideal on " + ideal + " of " + n + " days",
      text: "Raise the targets for the next sheet?", ask: "Raise the targets for the next sheet?", proposal: { min: t.ok, ok: t.ideal, ideal: Math.round(t.ideal * 1.5) } });
    if (missed >= 3) {
      var p = t.min > 1 ? { min: Math.max(1, Math.round(t.min / 2)), ok: t.ok, ideal: t.ideal }
        : { min: t.min, ok: Math.max(t.min + 1, Math.round(t.ok / 2)), ideal: t.ideal };
      return Object.assign(base, { kind: "lower", tone: "rose", icon: "target",
        title: missed + " of " + n + " days below the minimum",
        text: (p.min < t.min ? "Try a " + qty(p.min, h.unit) + " minimum" : "Try an easier ok day, " + qty(p.ok, h.unit)) + ". It still counts.", ask: "Make the next sheet easier?", proposal: p });
    }
    if (minPlus / n >= 0.6 && ideal <= 2) return Object.assign(base, { kind: "keep", tone: "sky", icon: "calendar",
      title: "Your minimum was easier to keep",
      text: "At least the minimum on " + minPlus + " of " + n + " days, ideal on " + ideal + ". Keep the targets for the next sheet?", ask: "Keep the targets for the next sheet?", proposal: null });
    return null;
  }
  // Habits being tracked now. A paused habit gets its suggestion in the tracker, when its sheet has ended.
  function suggestions() {
    return DATA.habits.filter(function (h) { return (DATA.sheets[h.id] || []).some(isRunning); }).map(function (h) { return suggestion(h.id); }).filter(Boolean);
  }
  /* Deep link to the tracker's own targets editor, prefilled, applied from the next sheet. */
  function adjustUrl(sg, targets) {
    var t = targets || sg.proposal || sg.targets;
    return "minimal-tracker.html?habit=" + encodeURIComponent(sg.habitId) + "&edit=targets&from=next&min=" + t.min + "&ok=" + t.ok + "&ideal=" + t.ideal;
  }

  window.SITAI = {
    today: TODAY, qty: qty, addDays: addDays, weekStart: weekStart, fmt: fmt, range: range, dayName: dayName,
    tasks: tasks, scope: scope,
    habit: habit, currentSheet: currentSheet, levelOn: levelOn,
    week: week, month: month, byWeek: byWeek, suggestion: suggestion, suggestions: suggestions, adjustUrl: adjustUrl,
    // React hook: re-render when a store changes (tasks or scope).
    useStore: function (store) {
      var s = React.useState(store.all ? store.all() : store.get());
      React.useEffect(function () { return store.on(function (v) { s[1](v); }); }, []);
      return s[0];
    }
  };
})();
