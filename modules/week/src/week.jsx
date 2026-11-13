/* StayInTrackApp · Week module (habits by week)
 * Adds: WeekPicker, DayCell, WeekGrid, WeekView + helpers startOfWeek, addDaysISO, buildWeek
 * Load after design-system/components/bundle.js (needs window.React and window.StayInTrack).
 */
const { useState, useRef, useMemo } = React;
const S = window.StayInTrack;
if (!S) throw new Error("StayInTrack: load design-system/components/bundle.js before week.js");
const { Button, StatTile, StickyNote } = S;
const cx = (...a) => a.filter(Boolean).join(" ");

const COLORS = ["butter", "rose", "sky", "sage"];
const LEVEL = ["missed", "min", "ok", "ideal"];

/* ---------- date helpers (all dates are "YYYY-MM-DD", local, no time zone shifts) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
export const addDaysISO = (iso, n) => { const d = parse(iso); d.setDate(d.getDate() + n); return toISO(d); };
export const todayISO = () => toISO(new Date());
/** First day of the week that contains `iso`. weekStartsOn: 1 = Monday (default), 0 = Sunday. */
export function startOfWeek(iso, weekStartsOn = 1) {
  const d = parse(iso);
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return toISO(d);
}
export const weekDays = (start) => Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
const fmt = (iso, o) => parse(iso).toLocaleDateString("en-US", o);
export function formatWeek(start) {
  const end = addDaysISO(start, 6), A = parse(start), Z = parse(end);
  if (A.getFullYear() !== Z.getFullYear()) return `${fmt(start, { month: "short", day: "numeric", year: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
  if (A.getMonth() === Z.getMonth()) return `${fmt(start, { month: "short", day: "numeric" })} – ${Z.getDate()}, ${Z.getFullYear()}`;
  return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric" })}, ${Z.getFullYear()}`;
}
const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const colorOf = (h) => h.color || COLORS[hash(h.id) % COLORS.length];

/**
 * Builds the week payload from full habit data (the same shape GET /api/habits/week returns).
 * habits: HabitSummary[]; sheetsByHabit: { [habitId]: Sheet[] } with days [{date, level}].
 * Only habits with at least one day inside a sheet that week are returned.
 */
export function buildWeek(habits, sheetsByHabit, weekStart) {
  const dates = weekDays(weekStart), end = dates[6];
  const out = [];
  habits.forEach((h) => {
    const sheets = (sheetsByHabit[h.id] || []).filter((s) => s.startDate <= end && s.endDate >= weekStart);
    if (!sheets.length) return;
    const byDate = {};
    sheets.slice().sort((a, b) => a.startDate.localeCompare(b.startDate)).forEach((s) => s.days.forEach((d) => { byDate[d.date] = { level: d.level, sheet: s }; }));
    const days = dates.map((date) => (byDate[date] ? { date, level: byDate[date].level, inSheet: true } : { date, level: null, inSheet: false }));
    if (!days.some((d) => d.inSheet)) return;
    const latest = sheets.reduce((a, b) => (a.startDate > b.startDate ? a : b));
    const targetSet = new Set(sheets.map((s) => JSON.stringify(s.targets || h.targets)));
    out.push({
      id: h.id, name: h.name, unit: h.unit, color: h.color,
      targets: latest.targets || h.targets,
      targetsChanged: targetSet.size > 1,
      days,
      notes: sheets.filter((s) => s.note).map((s) => ({ sheetId: s.id, text: s.note })),
    });
  });
  return { weekStart, weekEnd: end, habits: out };
}

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="sit-ico">
    <path d={dir === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
  </svg>
);

/* ---------- WeekPicker ---------- */
export function WeekPicker({ weekStart, onChange, today, weekStartsOn = 1 }) {
  const td = today || todayISO();
  const thisWeek = startOfWeek(td, weekStartsOn);
  const go = (iso) => onChange && onChange(startOfWeek(iso, weekStartsOn));
  return (
    <div className="sit-wpick" role="group" aria-label="Choose a week">
      <button type="button" className="sit-wpick-arrow" aria-label="Previous week" onClick={() => go(addDaysISO(weekStart, -7))}><Chevron dir="left" /></button>
      <div className="sit-wpick-label" aria-live="polite">
        <span className="sit-label">Week of</span>
        <span className="sit-wpick-range">{formatWeek(weekStart)}</span>
      </div>
      <button type="button" className="sit-wpick-arrow" aria-label="Next week" onClick={() => go(addDaysISO(weekStart, 7))}><Chevron dir="right" /></button>
      <button type="button" className={cx("sit-chip", weekStart === thisWeek && "is-on")} aria-pressed={weekStart === thisWeek} onClick={() => go(td)}>This week</button>
      <label className="sit-wpick-date">
        <span className="sit-label">Go to a date</span>
        <input type="date" className="sit-input" value={weekStart} onChange={(e) => e.target.value && go(e.target.value)} />
      </label>
    </div>
  );
}

/* ---------- DayCell ---------- */
export function DayCell({ day, future }) {
  const d = parse(day.date);
  const name = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  let state, word;
  if (!day.inSheet) { state = "off"; word = "not tracked"; }
  else if (day.level === null || day.level === undefined) { state = "todo"; word = future ? "not logged yet" : "not logged"; }
  else { state = "lvl-" + day.level; word = LEVEL[day.level]; }
  return (
    <span className={cx("sit-dcell", "is-" + state.replace("lvl-", "l"))} role="img" aria-label={`${name}: ${word}`} title={`${name}: ${word}`}>
      {day.inSheet && day.level > 0 ? <span className={"sit-dcell-fill lvl-" + day.level} /> : null}
      {day.inSheet && day.level === 0 ? <span className="sit-dcell-mark" aria-hidden="true">–</span> : null}
      {!day.inSheet ? <span className="sit-dcell-mark" aria-hidden="true">·</span> : null}
    </span>
  );
}

/* ---------- WeekGrid ---------- */
export function WeekGrid({ weekStart, habits = [], today, onOpenHabit }) {
  const td = today || todayISO();
  const dates = weekDays(weekStart);
  return (
    <div className="sit-wgrid" role="table" aria-label={`Habits for the week of ${formatWeek(weekStart)}`}>
      <div className="sit-wgrid-row sit-wgrid-head" role="row">
        <span className="sit-wgrid-name" role="columnheader"><span className="sit-label">Habit</span></span>
        {dates.map((iso) => {
          const d = parse(iso);
          return (
            <span key={iso} role="columnheader" className={cx("sit-wgrid-day", iso === td && "is-today")}>
              <span className="sit-wgrid-wd">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="sit-wgrid-num">{d.getDate()}</span>
              {iso === td ? <span className="sit-sr">today</span> : null}
            </span>
          );
        })}
        <span className="sit-wgrid-total" role="columnheader"><span className="sit-label">Week</span></span>
      </div>
      {habits.map((h) => {
        const tracked = h.days.filter((d) => d.inSheet);
        const hit = tracked.filter((d) => d.level >= 1).length;
        const t = h.targets || {};
        return (
          <div className="sit-wgrid-row" role="row" key={h.id}>
            <span className="sit-wgrid-name" role="rowheader">
              <span className={cx("sit-wtab", "sit-sticky-" + colorOf(h))}>{h.name}</span>
              <span className="sit-wgrid-targets">{t.min} · {t.ok} · {t.ideal} {h.unit}{h.targetsChanged ? " · changed this week" : ""}</span>
            </span>
            {h.days.map((d) => (
              <span key={d.date} role="cell" className={cx("sit-wgrid-cell", d.date === td && "is-today")}><DayCell day={d} future={d.date > td} /></span>
            ))}
            <span className="sit-wgrid-total" role="cell">
              <span className="sit-wgrid-score"><b>{hit}/{tracked.length}</b> ≥ min</span>
              {onOpenHabit ? <button type="button" className="sit-btn sit-btn-ghost sit-btn-sm" onClick={() => onOpenHabit(h)} aria-label={`Open ${h.name}`}>Open</button> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function WeekLegend() {
  const items = [
    [{ inSheet: true, level: 1 }, "min"], [{ inSheet: true, level: 2 }, "ok"], [{ inSheet: true, level: 3 }, "ideal"],
    [{ inSheet: true, level: 0 }, "missed"], [{ inSheet: true, level: null }, "not logged yet"], [{ inSheet: false }, "not tracked"],
  ];
  return (
    <ul className="sit-wlegend" aria-label="Legend">
      {items.map(([d, l]) => (
        <li key={l}><span className={cx("sit-dcell", "sit-dcell-sm", !d.inSheet ? "is-off" : d.level == null ? "is-todo" : "is-l" + d.level)} aria-hidden="true">
          {d.inSheet && d.level > 0 ? <span className={"sit-dcell-fill lvl-" + d.level} /> : null}
          {d.inSheet && d.level === 0 ? <span className="sit-dcell-mark">–</span> : null}
          {!d.inSheet ? <span className="sit-dcell-mark">·</span> : null}
        </span>{l}</li>
      ))}
    </ul>
  );
}

/* ---------- WeekView (the screen body) ---------- */
export function WeekView({ week, onWeekChange, onOpenHabit, onCreate, today, loading = false, weekStartsOn = 1 }) {
  const td = today || todayISO();
  const habits = (week && week.habits) || [];
  const weekStart = week ? week.weekStart : startOfWeek(td, weekStartsOn);
  const stats = useMemo(() => {
    let logged = 0, hit = 0;
    const perDay = Array(7).fill(0);
    habits.forEach((h) => h.days.forEach((d, i) => {
      if (d.inSheet && d.level !== null && d.level !== undefined) { logged++; if (d.level >= 1) { hit++; perDay[i]++; } }
    }));
    const max = Math.max(...perDay);
    const best = max > 0 ? weekDays(weekStart)[perDay.indexOf(max)] : null;
    return { logged, hit, best };
  }, [habits, weekStart]);
  const notes = habits.flatMap((h) => (h.notes || []).map((n) => ({ ...n, habit: h.name, color: colorOf(h) })));
  const thisWeek = startOfWeek(td, weekStartsOn);

  return (
    <div className={cx("sit-week", loading && "is-loading")} aria-busy={loading}>
      <WeekPicker weekStart={weekStart} onChange={onWeekChange} today={td} weekStartsOn={weekStartsOn} />
      {loading ? <p className="sit-week-loading" role="status">Loading the week…</p> : null}

      {!loading && habits.length === 0 ? (
        <div className="sit-week-empty">
          <StickyNote color="butter" rotate={-2}>Nothing tracked the week of {formatWeek(weekStart)}.</StickyNote>
          <div className="sit-week-empty-actions">
            {weekStart !== thisWeek ? <Button type="button" variant="secondary" onClick={() => onWeekChange && onWeekChange(thisWeek)}>Go to this week</Button> : null}
            {onCreate ? <Button type="button" variant="primary" onClick={onCreate}>Create a habit</Button> : null}
          </div>
        </div>
      ) : null}

      {habits.length > 0 ? (
        <>
          <div className="sit-week-stats">
            <StatTile label="Habits this week" value={String(habits.length)} />
            <StatTile label="Logged days at least min" value={`${stats.hit}/${stats.logged}`} note={stats.logged ? `${Math.round((stats.hit / stats.logged) * 100)}% of logged days` : "nothing logged yet"} />
            <StatTile label="Best day" value={stats.best ? fmt(stats.best, { weekday: "short" }) : "—"} note={stats.best ? fmt(stats.best, { month: "short", day: "numeric" }) : "no logs yet"} />
          </div>
          <S.JournalPage pattern="dash" className="sit-week-page">
            <WeekGrid weekStart={weekStart} habits={habits} today={td} onOpenHabit={onOpenHabit} />
            <WeekLegend />
          </S.JournalPage>
          {notes.length ? (
            <section className="sit-week-notes" aria-label="Notes this week">
              <span className="sit-label">Notes this week</span>
              <div className="sit-week-notes-row">
                {notes.map((n) => (
                  <p key={n.sheetId} className="sit-notita sit-notita-solo"><b className="sit-week-note-habit">{n.habit}</b>{n.text}</p>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
