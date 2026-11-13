/* StayInTrackApp · Habits module (My habits board + habit detail with all its sheets)
 * Adds: SearchField, MiniWeek, HabitNote, HabitBoard, SheetRow, HabitSheet, HabitDetail
 * Load after design-system/components/bundle.js (needs window.React and window.StayInTrack).
 */
const { useState, useRef, useEffect, useMemo } = React;
const S = window.StayInTrack;
if (!S) throw new Error("StayInTrack: load design-system/components/bundle.js before habits.js");
const { Button, Badge, HandTitle, JournalPage, StickyNote } = S;
const cx = (...a) => a.filter(Boolean).join(" ");

export const HABIT_COLORS = ["butter", "rose", "sky", "sage"];
const LEVEL = ["missed", "min", "ok", "ideal"];
const TILT = [-2, 1.5, -1, 2.5, -1.5, 1];

/* ---------- helpers ---------- */
export function parseDate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}
const fmt = (iso, o) => parseDate(iso).toLocaleDateString("en-US", o);
export function formatRange(a, b) {
  const A = parseDate(a), Z = parseDate(b);
  if (A.getFullYear() !== Z.getFullYear())
    return `${fmt(a, { month: "short", day: "numeric", year: "numeric" })} – ${fmt(b, { month: "short", day: "numeric", year: "numeric" })}`;
  if (A.getMonth() === Z.getMonth()) return `${fmt(a, { month: "short", day: "numeric" })} – ${Z.getDate()}, ${Z.getFullYear()}`;
  return `${fmt(a, { month: "short", day: "numeric" })} – ${fmt(b, { month: "short", day: "numeric" })}, ${Z.getFullYear()}`;
}
export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
export const habitColor = (h) => h.color || HABIT_COLORS[hash(h.id) % HABIT_COLORS.length];
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const lv = (d) => (d !== null && typeof d === "object" ? d.level : d);

/** Counts for one sheet. days: levels (0-3, null = not logged yet) or {date, level}. */
export function sheetSummary(days = []) {
  const L = days.map(lv);
  const logged = L.filter((x) => x !== null && x !== undefined);
  return {
    total: L.length,
    logged: logged.length,
    atLeastMin: logged.filter((x) => x >= 1).length,
    atLeastOk: logged.filter((x) => x >= 2).length,
    ideal: logged.filter((x) => x === 3).length,
    missed: logged.filter((x) => x === 0).length,
  };
}
/** Newest first, by startDate (ties: endDate). */
export function sortSheetsDesc(sheets = []) {
  return sheets.slice().sort((a, b) => b.startDate.localeCompare(a.startDate) || b.endDate.localeCompare(a.endDate));
}

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="sit-ico">
    <path d="M4 7h16M10 4h4M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5L17.5 7M10 11v6M14 11v6" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="sit-ico"><path d="M5 5l10 10M15 5 5 15" /></svg>
);

/* ---------- SearchField ---------- */
export function SearchField({ value = "", onChange, placeholder = "Search habits", label = "Search habits" }) {
  const set = (v) => onChange && onChange(v);
  return (
    <div className="sit-search">
      <svg className="sit-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
      <input
        type="search"
        className="sit-search-input"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape" && value) { e.preventDefault(); set(""); } }}
      />
      {value ? (
        <button type="button" className="sit-iconbtn sit-search-clear" aria-label="Clear search" onClick={() => set("")}><CloseIcon /></button>
      ) : null}
    </div>
  );
}

/* ---------- MiniWeek ---------- */
export function MiniWeek({ days = [], label }) {
  return (
    <span className="sit-miniweek" role="img" aria-label={label}>
      {days.map(lv).map((x, i) => (
        <span key={i} className={cx("sit-mw", x === null || x === undefined ? "is-future" : "lvl-" + x)} />
      ))}
    </span>
  );
}

/* ---------- confirm panel (shared) ---------- */
function ConfirmDelete({ title, text, onKeep, onDelete, busy, className }) {
  const keep = useRef(null);
  useEffect(() => { keep.current && keep.current.focus(); }, []);
  return (
    <div className={cx("sit-confirm", className)} role="alertdialog" aria-label={title} onKeyDown={(e) => e.key === "Escape" && onKeep()}>
      <p><b>{title}</b><br />{text}</p>
      <div className="sit-confirm-actions">
        <button ref={keep} type="button" className="sit-btn sit-btn-secondary sit-btn-sm" onClick={onKeep}>Keep it</button>
        <button type="button" className="sit-btn sit-btn-primary sit-btn-sm" disabled={busy} onClick={onDelete}>{busy ? "Deleting…" : "Delete"}</button>
      </div>
    </div>
  );
}

function useDelete(habit, onDelete, trashRef) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const keep = () => { setConfirm(false); setTimeout(() => trashRef.current && trashRef.current.focus(), 0); };
  const run = async () => {
    setBusy(true);
    try { onDelete && (await onDelete(habit)); }
    catch (e) { setBusy(false); setConfirm(false); }
  };
  return { confirm, open: () => setConfirm(true), keep, run, busy };
}

/* ---------- HabitNote (one post-it on the board) ---------- */
export function HabitNote({ habit, onOpen, onDelete }) {
  const trash = useRef(null);
  const del = useDelete(habit, onDelete, trash);
  const t = habit.targets || {};
  const last = habit.lastSheet;
  const sum = last ? sheetSummary(last.days) : null;
  const n = habit.sheetsCount != null ? habit.sheetsCount : last ? 1 : 0;
  const phrase = habit.notes && habit.notes.length ? habit.notes[0].text : null;
  return (
    <article className="sit-hnote-wrap" style={{ "--tilt": TILT[hash(habit.id) % TILT.length] + "deg" }}>
      <div className={cx("sit-sticky", "sit-sticky-" + habitColor(habit), "sit-hnote")}>
        <span className="sit-tape" aria-hidden="true" />
        <h3 className="sit-hnote-name">
          <button type="button" className="sit-hnote-open" onClick={() => onOpen && onOpen(habit)}>{habit.name}</button>
        </h3>
        <p className="sit-hnote-targets">{t.min} · {t.ok} · {t.ideal} {habit.unit}</p>
        {last ? (
          <>
            <MiniWeek days={last.days} label={`Latest sheet: ${sum.atLeastMin} of ${sum.total} days at least min`} />
            <p className="sit-hnote-meta"><b>{sum.atLeastMin}/{sum.total}</b> days ≥ min · {formatRange(last.startDate, last.endDate)}</p>
          </>
        ) : (
          <p className="sit-hnote-meta">No sheets yet</p>
        )}
        <div className="sit-hnote-foot">
          <span className="sit-hnote-count">{n} {n === 1 ? "sheet" : "sheets"}</span>
          <button type="button" ref={trash} className="sit-iconbtn sit-hnote-del" aria-label={`Delete ${habit.name}`} onClick={del.open}><TrashIcon /></button>
        </div>
        {del.confirm && (
          <ConfirmDelete className="sit-hnote-confirm" title={`Delete ${habit.name}?`} busy={del.busy}
            text={`Its ${n} ${n === 1 ? "sheet" : "sheets"} and notes go too. This can't be undone.`} onKeep={del.keep} onDelete={del.run} />
        )}
      </div>
      {phrase ? <p className="sit-notita">{phrase}</p> : null}
    </article>
  );
}

/* ---------- HabitBoard (screen 1) ---------- */
const lastDate = (h) => (h.lastSheet ? h.lastSheet.startDate : h.createdAt || "");
export function HabitBoard({ habits = [], onOpen, onDelete, onCreate, query, onQueryChange }) {
  const [qi, setQi] = useState("");
  const q = query !== undefined ? query : qi;
  const setQ = onQueryChange || setQi;
  const [sort, setSort] = useState("recent");
  const list = useMemo(() => {
    const n = norm(q.trim());
    const a = habits.filter((h) => !n || norm(h.name).includes(n) || (h.reasons || []).some((r) => norm(r).includes(n)));
    return a.sort(sort === "az" ? (x, y) => x.name.localeCompare(y.name) : (x, y) => lastDate(y).localeCompare(lastDate(x)));
  }, [habits, q, sort]);
  const count = q.trim()
    ? `${list.length} of ${habits.length} habits match “${q.trim()}”`
    : `${habits.length} ${habits.length === 1 ? "habit" : "habits"}`;
  return (
    <section className="sit-hboard" aria-label="My habits">
      <div className="sit-hboard-tools">
        <SearchField value={q} onChange={setQ} />
        <div className="sit-chiprow" role="radiogroup" aria-label="Sort habits">
          {[["recent", "Recent"], ["az", "A–Z"]].map(([k, l]) => (
            <button type="button" key={k} role="radio" aria-checked={sort === k} className={cx("sit-chip", sort === k && "is-on")} onClick={() => setSort(k)}>{l}</button>
          ))}
        </div>
        {onCreate ? <Button type="button" variant="primary" onClick={onCreate}>+ New habit</Button> : null}
      </div>
      <p className="sit-hboard-count" aria-live="polite">{count}</p>

      {habits.length === 0 ? (
        <div className="sit-hboard-empty">
          <StickyNote color="butter" rotate={-2}>Your first habit goes here.</StickyNote>
          <div>
            <p className="sit-hboard-empty-text">Pick one small thing you want to do every day.</p>
            {onCreate ? <Button type="button" variant="primary" onClick={onCreate}>Create a habit</Button> : null}
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="sit-hboard-empty">
          <p className="sit-notita sit-notita-solo">No habit matches “{q.trim()}”.</p>
          <Button type="button" variant="ghost" onClick={() => setQ("")}>Clear search</Button>
        </div>
      ) : (
        <div className="sit-hboard-grid">
          {list.map((h) => <HabitNote key={h.id} habit={h} onOpen={onOpen} onDelete={onDelete} />)}
          {onCreate && !q.trim() ? (
            <button type="button" className="sit-hboard-add" onClick={onCreate}><span className="sit-hboard-plus" aria-hidden="true">+</span>New habit</button>
          ) : null}
        </div>
      )}
    </section>
  );
}

/* ---------- SheetRow (read-only day) ---------- */
export function SheetRow({ day }) {
  const level = day.level;
  const future = level === null || level === undefined;
  const d = parseDate(day.date);
  const wd = d.toLocaleDateString("en-US", { weekday: "short" });
  return (
    <div className={cx("sit-sheetrow", future && "is-future")}>
      <span className="sit-sheetrow-wd" aria-hidden="true">{wd}</span>
      <span className={cx("sit-day", level > 0 && "is-on")} aria-hidden="true">{d.getDate()}</span>
      <span className="sit-leader" aria-hidden="true" />
      <span className="sit-bar" aria-hidden="true">
        <span className={cx("sit-bar-fill", "lvl-" + (future ? 0 : level))} />
        <span className="sit-bar-seg" /><span className="sit-bar-seg" /><span className="sit-bar-seg" />
      </span>
      <span className="sit-habit-lvl" aria-hidden="true">{future ? "" : LEVEL[level]}</span>
      <span className="sit-sr">{`${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}: ${future ? "not logged yet" : LEVEL[level]}`}</span>
    </div>
  );
}

/* ---------- HabitSheet (one tracker page) ---------- */
export function HabitSheet({ sheet, unit, expanded = false, onToggle, current = false }) {
  const sum = sheetSummary(sheet.days);
  const t = sheet.targets || {};
  const bodyId = "sit-sheet-" + sheet.id;
  const single = sheet.days.length <= 7;
  return (
    <JournalPage pattern="dash" binding={expanded ? "disc" : "none"} className={cx("sit-sheet", expanded && "is-open", current && "is-current")}>
      <div className="sit-sheet-head">
        <div className="sit-sheet-title">
          <h4 className="sit-sheet-range">{formatRange(sheet.startDate, sheet.endDate)}</h4>
          <p className="sit-sheet-meta">{sheet.days.length} days · targets {t.min} · {t.ok} · {t.ideal} {unit}</p>
        </div>
        <div className="sit-sheet-badges">
          {current ? <Badge tone="butter">Current</Badge> : null}
          <Badge tone="sage">{sum.atLeastMin}/{sum.total} ≥ min</Badge>
        </div>
        <button type="button" className="sit-btn sit-btn-ghost sit-btn-sm sit-sheet-toggle" aria-expanded={expanded} aria-controls={bodyId} onClick={onToggle}>
          {expanded ? "Close sheet" : "Open sheet"}
        </button>
      </div>
      {expanded ? (
        <div id={bodyId} className="sit-sheet-body">
          {single ? (
            <div className="sit-sheet-legend" aria-hidden="true">
              <span /><span>{t.min} {unit}</span><span>{t.ok} {unit}</span><span>{t.ideal} {unit}</span><span />
            </div>
          ) : null}
          <div className={cx("sit-sheet-rows", !single && "is-multi")}>
            {sheet.days.map((d) => <SheetRow key={d.date} day={d} />)}
          </div>
          <p className="sit-sheet-stats">
            <b>{sum.atLeastMin}</b> at least min · <b>{sum.atLeastOk}</b> ok or more · <b>{sum.ideal}</b> ideal · <b>{sum.missed}</b> missed
            {sum.logged < sum.total ? <> · {sum.total - sum.logged} to go</> : null}
          </p>
          {sheet.note ? <p className="sit-notita sit-sheet-note">{sheet.note}</p> : null}
        </div>
      ) : (
        <div className="sit-sheet-peek">
          <MiniWeek days={sheet.days} label={`${sum.atLeastMin} of ${sum.total} days at least min`} />
          {sheet.note ? <span className="sit-sheet-peeknote">“{sheet.note}”</span> : null}
        </div>
      )}
    </JournalPage>
  );
}

/* ---------- HabitDetail (screen 2) ---------- */
export function HabitDetail({ habit, sheets = [], onBack, onDelete, onNewSheet, today }) {
  const sorted = useMemo(() => sortSheetsDesc(sheets), [sheets]);
  const td = today || todayISO();
  const [open, setOpen] = useState(() => new Set(sorted.length ? [sorted[0].id] : []));
  const toggle = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOpen = sorted.length > 0 && sorted.every((s) => open.has(s.id));
  const trash = useRef(null);
  const del = useDelete(habit, onDelete, trash);
  const t = habit.targets || {};
  const total = sorted.reduce((a, s) => { const x = sheetSummary(s.days); a.logged += x.logged; a.min += x.atLeastMin; return a; }, { logged: 0, min: 0 });
  const since = sorted.length ? sorted[sorted.length - 1].startDate : habit.createdAt;
  const groups = [];
  sorted.forEach((s) => {
    const label = parseDate(s.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const g = groups[groups.length - 1];
    g && g.label === label ? g.sheets.push(s) : groups.push({ label, sheets: [s] });
  });

  return (
    <div className="sit-hdetail">
      {onBack ? <Button type="button" variant="ghost" size="sm" onClick={onBack}>← My habits</Button> : null}
      <header className="sit-hdetail-head">
        <div>
          <HandTitle as="h1" size="lg">{habit.name}</HandTitle>
          <p className="sit-hdetail-meta">
            {t.min} · {t.ok} · {t.ideal} {habit.unit}
            {since ? <> · since {fmt(since, { month: "short", day: "numeric", year: "numeric" })}</> : null}
            {" "}· {sorted.length} {sorted.length === 1 ? "sheet" : "sheets"}
            {total.logged ? <> · <b>{total.min} of {total.logged}</b> logged days at least min</> : null}
          </p>
        </div>
        <div className="sit-hdetail-actions">
          {onNewSheet ? <Button type="button" variant="primary" onClick={onNewSheet}>+ Start a new sheet</Button> : null}
          {onDelete ? (
            <button type="button" ref={trash} className="sit-btn sit-btn-secondary sit-hdetail-del" onClick={del.open}><TrashIcon /> Delete habit</button>
          ) : null}
        </div>
      </header>
      {del.confirm && (
        <ConfirmDelete className="sit-hdetail-confirm" title={`Delete ${habit.name}?`} busy={del.busy}
          text={`All ${sorted.length} sheets and its notes go too. This can't be undone.`} onKeep={del.keep} onDelete={del.run} />
      )}

      {(habit.reasons && habit.reasons.length) || (habit.notes && habit.notes.length) ? (
        <div className="sit-hdetail-top">
          {habit.reasons && habit.reasons.length ? (
            <div className="sit-hdetail-why">
              <span className="sit-label">Why it matters to me</span>
              <ul>{habit.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          ) : <div />}
          {habit.notes && habit.notes.length ? (
            <div className="sit-hdetail-notes" aria-label="Motivation notes">
              {habit.notes.map((n, i) => (
                <StickyNote key={i} color={n.color} rotate={TILT[i % TILT.length]} pin={i % 2 ? "pin" : "tape"} className="sit-hdetail-sticky">{n.text}</StickyNote>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="sit-hdetail-sheets-head">
        <HandTitle size="md" underline="blush">All sheets</HandTitle>
        <span className="sit-hdetail-order">Newest first</span>
        {sorted.length > 1 ? (
          <button type="button" className="sit-btn sit-btn-ghost sit-btn-sm" onClick={() => setOpen(allOpen ? new Set() : new Set(sorted.map((s) => s.id)))}>
            {allOpen ? "Close all" : "Open all"}
          </button>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <p className="sit-notita sit-notita-solo">No sheets yet. Start one to begin tracking.</p>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="sit-month">
            <h3 className="sit-month-label">{g.label}</h3>
            <div className="sit-sheets">
              {g.sheets.map((s) => (
                <HabitSheet key={s.id} sheet={s} unit={habit.unit} expanded={open.has(s.id)} onToggle={() => toggle(s.id)}
                  current={s.startDate <= td && td <= s.endDate} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
