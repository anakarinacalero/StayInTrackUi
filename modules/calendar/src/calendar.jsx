/* StayInTrackApp · Calendar module (calendar button + week-picking popup)
 * Adds: CalendarButton, WeekCalendar + helpers calStartOfWeek, weekMarks
 * Load after design-system/components/bundle.js (needs window.React and window.StayInTrack).
 */
const { useState, useRef, useEffect } = React;
if (!window.StayInTrack) throw new Error("StayInTrack: load design-system/components/bundle.js before calendar.js");
const cx = (...a) => a.filter(Boolean).join(" ");

/* ---------- dates ("YYYY-MM-DD", local) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parse(iso); d.setDate(d.getDate() + n); return toISO(d); };
const addMonths = (iso, n) => {
  const d = parse(iso), day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
};
const today = () => toISO(new Date());
const monthOf = (iso) => iso.slice(0, 7);
export function calStartOfWeek(iso, weekStartsOn = 1) {
  const d = parse(iso);
  d.setDate(d.getDate() - ((d.getDay() - weekStartsOn + 7) % 7));
  return toISO(d);
}
const fmt = (iso, o) => parse(iso).toLocaleDateString("en-US", o);
const weekLabel = (ws) => {
  const we = addDays(ws, 6);
  return monthOf(ws) === monthOf(we)
    ? `${fmt(ws, { month: "short", day: "numeric" })} – ${parse(we).getDate()}`
    : `${fmt(ws, { month: "short", day: "numeric" })} – ${fmt(we, { month: "short", day: "numeric" })}`;
};

/**
 * Counts how many habits were tracked each week.
 * ranges: [{ habitId, startDate, endDate }] (one per sheet). Returns { [weekStart]: count }.
 */
export function weekMarks(ranges = [], weekStartsOn = 1) {
  const sets = {};
  ranges.forEach((r) => {
    for (let w = calStartOfWeek(r.startDate, weekStartsOn); w <= r.endDate; w = addDays(w, 7)) {
      (sets[w] = sets[w] || new Set()).add(r.habitId);
    }
  });
  const out = {};
  Object.keys(sets).forEach((k) => { out[k] = sets[k].size; });
  return out;
}

const CalIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="sit-cal-ico">
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 9.5h17M8 3v4M16 3v4" />
    <path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2" />
  </svg>
);
const Chevron = ({ dir }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="sit-cal-ico"><path d={dir < 0 ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} /></svg>
);

/* ---------- WeekCalendar: a month where every row is a week ---------- */
export function WeekCalendar({ value, onSelectWeek, onMonthChange, today: td0, weekStartsOn = 1, marks = {}, autoFocus = false }) {
  const td = td0 || today();
  const [focus, setFocus] = useState(value || td);
  const [month, setMonth] = useState(monthOf(value || td));
  const [hover, setHover] = useState(null);
  const btns = useRef({});
  const moved = useRef(autoFocus);

  useEffect(() => { onMonthChange && onMonthChange(month); }, [month]);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const b = btns.current[focus];
    b && b.focus();
  }, [focus, month]);

  const goMonth = (n) => { const f = addMonths(focus, n); setFocus(f); setMonth(monthOf(f)); };
  const moveTo = (iso) => { moved.current = true; setFocus(iso); if (monthOf(iso) !== month) setMonth(monthOf(iso)); };
  const select = (iso) => onSelectWeek && onSelectWeek(calStartOfWeek(iso, weekStartsOn));
  const onKey = (e) => {
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (map[e.key] !== undefined) { e.preventDefault(); moveTo(addDays(focus, map[e.key])); }
    else if (e.key === "PageUp" || e.key === "PageDown") { e.preventDefault(); moveTo(addMonths(focus, e.key === "PageUp" ? -1 : 1)); }
    else if (e.key === "Home") { e.preventDefault(); moveTo(calStartOfWeek(focus, weekStartsOn)); }
    else if (e.key === "End") { e.preventDefault(); moveTo(addDays(calStartOfWeek(focus, weekStartsOn), 6)); }
  };

  const gridStart = calStartOfWeek(month + "-01", weekStartsOn);
  const weeks = Array.from({ length: 6 }, (_, r) => addDays(gridStart, r * 7));
  const wdNames = Array.from({ length: 7 }, (_, i) => fmt(addDays(gridStart, i), { weekday: "short" }));
  const thisWeek = calStartOfWeek(td, weekStartsOn);
  const title = fmt(month + "-01", { month: "long", year: "numeric" });
  // keep the focused day inside the month on screen
  const focusInView = focus >= gridStart && focus <= addDays(gridStart, 41) ? focus : month + "-01";

  return (
    <div className="sit-cal">
      <div className="sit-cal-head">
        <button type="button" className="sit-cal-nav" aria-label="Previous month" onClick={() => goMonth(-1)}><Chevron dir={-1} /></button>
        <h3 className="sit-cal-month" aria-live="polite">{title}</h3>
        <button type="button" className="sit-cal-nav" aria-label="Next month" onClick={() => goMonth(1)}><Chevron dir={1} /></button>
      </div>
      <div role="grid" aria-label={title} className="sit-cal-grid" onKeyDown={onKey}>
        <div role="row" className="sit-cal-row sit-cal-wd">
          {wdNames.map((n) => <span role="columnheader" key={n} className="sit-cal-wdn">{n}</span>)}
          <span role="columnheader" className="sit-cal-wdn" title="Habits tracked that week"><span className="sit-sr">Habits tracked</span><span aria-hidden="true">#</span></span>
        </div>
        {weeks.map((ws) => {
          const count = marks[ws] || 0;
          return (
            <div role="row" key={ws}
              className={cx("sit-cal-row", "sit-cal-week", ws === value && "is-selected", ws === thisWeek && "is-current", hover === ws && "is-hover")}
              onMouseEnter={() => setHover(ws)} onMouseLeave={() => setHover(null)}>
              {Array.from({ length: 7 }, (_, i) => {
                const iso = addDays(ws, i);
                const out = monthOf(iso) !== month;
                return (
                  <span role="gridcell" key={iso} aria-selected={ws === value}>
                    <button type="button" ref={(el) => { btns.current[iso] = el; }}
                      tabIndex={iso === focusInView ? 0 : -1}
                      className={cx("sit-cal-day", out && "is-out", iso === td && "is-today")}
                      aria-label={`${fmt(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Open the week of ${weekLabel(ws)}${count ? `, ${count} ${count === 1 ? "habit" : "habits"} tracked` : ""}`}
                      aria-current={iso === td ? "date" : undefined}
                      onFocus={() => setFocus(iso)}
                      onClick={() => select(iso)}>
                      {parse(iso).getDate()}
                    </button>
                  </span>
                );
              })}
              <span role="gridcell" className="sit-cal-count">
                {count ? <span className="sit-cal-badge" title={`${count} ${count === 1 ? "habit" : "habits"} tracked`} aria-hidden="true">{count}</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- CalendarButton: button + popup ---------- */
export function CalendarButton({ onSelectWeek, value, marks, onMonthChange, today: td0, weekStartsOn = 1, label = "Calendar", variant = "secondary", title = "Pick a week" }) {
  const td = td0 || today();
  const [open, setOpen] = useState(false);
  const dlg = useRef(null);
  const btn = useRef(null);
  const titleId = useRef("sit-cal-t" + Math.random().toString(36).slice(2, 8)).current;

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal ? d.showModal() : d.setAttribute("open", "");
      // start on the focused day (today or the selected week), not on the close button
      const day = d.querySelector('.sit-cal-day[tabindex="0"]');
      day && day.focus();
    }
    if (!open && d.open) d.close ? d.close() : d.removeAttribute("open");
  }, [open]);

  const close = () => { setOpen(false); setTimeout(() => btn.current && btn.current.focus(), 0); };
  const pick = (ws) => { close(); onSelectWeek && onSelectWeek(ws); };

  return (
    <>
      <button type="button" ref={btn} className={cx("sit-btn", "sit-btn-" + variant, "sit-btn-md", "sit-calbtn")} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <CalIcon />{label}
      </button>
      <dialog ref={dlg} className="sit-caldlg" aria-labelledby={titleId}
        onCancel={(e) => { e.preventDefault(); close(); }}
        onClick={(e) => { if (e.target === dlg.current) close(); }}>
        {open ? (
          <div className="sit-caldlg-card">
            <span className="sit-tape" aria-hidden="true" />
            <div className="sit-caldlg-head">
              <h2 id={titleId} className="sit-caldlg-title">{title}</h2>
              <button type="button" className="sit-cal-nav sit-caldlg-x" aria-label="Close" onClick={close}>
                <svg viewBox="0 0 20 20" aria-hidden="true" className="sit-cal-ico"><path d="M5 5l10 10M15 5 5 15" /></svg>
              </button>
            </div>
            <p className="sit-caldlg-hint">Tap any day to open its week.</p>
            <WeekCalendar value={value} onSelectWeek={pick} onMonthChange={onMonthChange} today={td} weekStartsOn={weekStartsOn} marks={marks || {}} />
            <div className="sit-caldlg-foot">
              <button type="button" className="sit-btn sit-btn-soft sit-btn-sm" onClick={() => pick(calStartOfWeek(td, weekStartsOn))}>This week</button>
              {marks ? <span className="sit-caldlg-legend"><span className="sit-cal-badge" aria-hidden="true">4</span> habits tracked that week</span> : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
