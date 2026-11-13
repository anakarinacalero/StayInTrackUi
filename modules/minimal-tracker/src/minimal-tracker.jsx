/* StayInTrackApp · Minimal tracker module
 * Adds: ChipGroup, TargetFields, ReasonList, MotivationNote, MotivationBoard, CreateHabitForm
 * Load after design-system/components/bundle.js (needs window.React and window.StayInTrack).
 */
const { useState, useRef, useEffect } = React;
const S = window.StayInTrack;
if (!S) throw new Error("StayInTrack: load design-system/components/bundle.js before minimal-tracker.js");
const { Doodle, Button, TextField, JournalPage } = S;
const cx = (...a) => a.filter(Boolean).join(" ");

export const NOTE_COLORS = ["butter", "rose", "sky", "sage"];
export const MOTIVATION_PHRASES = [
  "There's no perfect moment to act.",
  "The minimum counts. One minute is still a yes.",
  "Start small. You don't have to do it all at once.",
  "Progress, not perfection.",
  "Future me says thank you.",
  "One day at a time.",
  "I show up, even a little.",
  "Missing a day is fine. Missing two is a choice.",
];
export const HABIT_UNITS = ["min", "pages", "glasses", "times", "steps", "km"];
const QUICK = [
  { name: "Meditate", unit: "min", min: 1, ok: 15, ideal: 30 },
  { name: "Read", unit: "pages", min: 2, ok: 10, ideal: 20 },
  { name: "Drink water", unit: "glasses", min: 3, ok: 6, ideal: 8 },
  { name: "Stretch", unit: "min", min: 2, ok: 10, ideal: 20 },
  { name: "Walk", unit: "steps", min: 2000, ok: 5000, ideal: 8000 },
];

let seq = 0;
const newId = () => "n" + Date.now().toString(36) + (++seq).toString(36);
const tilt = () => [-3, 2, -1, 3, -2, 1][seq % 6];
const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/* ---------- ChipGroup ---------- */
export function ChipGroup({ label, options = [], value, onChange, id }) {
  const opts = options.map((o) => (typeof o === "object" ? o : { value: o, label: String(o) }));
  return (
    <div className="sit-chipgroup">
      {label ? <span className="sit-label" id={id}>{label}</span> : null}
      <div className="sit-chiprow" role="radiogroup" aria-labelledby={label ? id : undefined}>
        {opts.map((o) => (
          <button
            type="button"
            key={String(o.value)}
            role="radio"
            aria-checked={value === o.value}
            className={cx("sit-chip", value === o.value && "is-on")}
            onClick={() => onChange && onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- TargetFields ---------- */
export function targetsError(t) {
  const a = Number(t.min), b = Number(t.ok), c = Number(t.ideal);
  if (!(a > 0) || !(b > 0) || !(c > 0)) return "Fill in all three targets with numbers above 0.";
  if (!(a < b && b < c)) return "Each target should be bigger than the one before: min < ok < ideal.";
  return null;
}

export function TargetFields({ value, onChange, units = HABIT_UNITS, showError = true }) {
  const set = (k, v) => onChange && onChange({ ...value, [k]: v });
  const err = targetsError(value);
  return (
    <div className="sit-targets">
      <div className="sit-target-grid">
        <label className="sit-field-wrap">
          <span className="sit-label">Measured in</span>
          <select className="sit-input sit-select" value={value.unit} onChange={(e) => set("unit", e.target.value)}>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        {[
          ["min", "min", "The least that still counts"],
          ["ok", "ok :3", "A normal day"],
          ["ideal", "ideal", "A great day"],
        ].map(([k, lab, hint]) => (
          <label className="sit-field-wrap" key={k}>
            <span className="sit-label">{lab}</span>
            <input
              className="sit-input sit-input-script"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={value[k]}
              aria-invalid={showError && !!err}
              onChange={(e) => set(k, e.target.value)}
            />
            <span className="sit-hint">{hint}</span>
          </label>
        ))}
      </div>
      {showError && err ? <p className="sit-error" role="alert"><b>Check:</b> {err}</p> : null}
    </div>
  );
}

/* ---------- ReasonList ---------- */
export function ReasonList({ value = [""], onChange, max = 3, placeholder = "Improve my mood" }) {
  const list = value.length ? value : [""];
  const set = (i, v) => { const a = list.slice(); a[i] = v; onChange && onChange(a); };
  const remove = (i) => { const a = list.slice(); a.splice(i, 1); onChange && onChange(a.length ? a : [""]); };
  return (
    <div className="sit-reasons">
      {list.map((r, i) => (
        <div className="sit-reason-row" key={i}>
          <span className="sit-reason-dot" aria-hidden="true">·</span>
          <input
            className="sit-input sit-input-script"
            value={r}
            maxLength={80}
            placeholder={i === 0 ? placeholder : "Another reason"}
            aria-label={"Reason " + (i + 1)}
            onChange={(e) => set(i, e.target.value)}
          />
          <button type="button" className="sit-iconbtn" aria-label={"Remove reason " + (i + 1)} onClick={() => remove(i)} disabled={list.length === 1 && !r}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" fill="none" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
        </div>
      ))}
      {list.length < max && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange && onChange(list.concat([""]))}>+ Add a reason</Button>
      )}
    </div>
  );
}

/* ---------- MotivationNote ---------- */
export function MotivationNote({ note, onChange, onDelete, autoFocus, maxLength = 120 }) {
  const ref = useRef(null);
  useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  const set = (k, v) => onChange && onChange({ ...note, [k]: v });
  return (
    <div className={cx("sit-sticky", "sit-sticky-" + note.color, "sit-mnote")} style={{ transform: `rotate(${note.rotate || 0}deg)` }}>
      <span className="sit-tape" aria-hidden="true" />
      <textarea
        ref={ref}
        className="sit-mnote-text"
        value={note.text}
        maxLength={maxLength}
        placeholder="Write something kind to future you…"
        aria-label="Motivational phrase"
        onChange={(e) => set("text", e.target.value)}
      />
      <div className="sit-mnote-foot">
        <div className="sit-mnote-colors" role="radiogroup" aria-label="Note color">
          {NOTE_COLORS.map((c) => (
            <button type="button" key={c} role="radio" aria-checked={note.color === c} aria-label={c}
              className={cx("sit-swatch", "sit-swatch-" + c, note.color === c && "is-on")} onClick={() => set("color", c)} />
          ))}
        </div>
        <span className="sit-mnote-count">{note.text.length}/{maxLength}</span>
        <button type="button" className="sit-iconbtn sit-mnote-del" aria-label="Delete note" onClick={onDelete}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" fill="none" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------- MotivationBoard ---------- */
export function MotivationBoard({ notes = [], onChange, max = 8, phrases = MOTIVATION_PHRASES, title = "Motivation board", subtitle = "One note shows on your tracker each day, taking turns." }) {
  const [fresh, setFresh] = useState(null);
  const push = (text) => {
    const n = { id: newId(), text, color: NOTE_COLORS[notes.length % NOTE_COLORS.length], rotate: tilt() };
    setFresh(text ? null : n.id);
    onChange && onChange(notes.concat([n]));
  };
  const inspire = () => {
    const used = new Set(notes.map((n) => n.text.trim()));
    const left = phrases.filter((p) => !used.has(p));
    push((left.length ? left : phrases)[Math.floor(Math.random() * (left.length || phrases.length))]);
  };
  const update = (i, n) => { const a = notes.slice(); a[i] = n; onChange && onChange(a); };
  const remove = (i) => { const a = notes.slice(); a.splice(i, 1); onChange && onChange(a); };
  const full = notes.length >= max;
  return (
    <section className="sit-board-wrap" aria-label={title}>
      <div className="sit-board-head">
        <div>
          <div className="sit-board-title">{title}</div>
          <div className="sit-board-sub">{subtitle}</div>
        </div>
        <button type="button" className="sit-prompt" onClick={inspire}>
          <Doodle kind="sparkle" tone="mustard" size={16} />
          Inspire me
        </button>
      </div>
      <div className="sit-board">
        {notes.map((n, i) => (
          <MotivationNote key={n.id} note={n} autoFocus={fresh === n.id} onChange={(v) => update(i, v)} onDelete={() => remove(i)} />
        ))}
        {!full && (
          <button type="button" className="sit-board-add" onClick={() => push("")}>
            <span><Doodle kind="plus" tone="ink" size={22} /><br />Add a note</span>
          </button>
        )}
      </div>
      <p className="sit-board-count">{notes.length} of {max} notes{full ? " · board is full" : ""}</p>
    </section>
  );
}

/* ---------- TargetPreview ---------- */
const LEVELS = ["", "min", "ok", "ideal"];
export function TargetPreview({ day = 1, targets }) {
  const [v, setV] = useState(0);
  const u = targets.unit;
  return (
    <div className="sit-preview">
      <span className="sit-label">Your first day will look like this · tap the bar</span>
      <div className="sit-preview-legend" aria-hidden="true">
        <span />
        <span>{targets.min || "?"} {u}</span><span>{targets.ok || "?"} {u}</span><span>{targets.ideal || "?"} {u}</span>
        <span />
      </div>
      <div className="sit-habit">
        <span className={cx("sit-day", v > 0 && "is-on")}>{day}</span>
        <span className="sit-leader" aria-hidden="true" />
        <div className="sit-bar" role="radiogroup" aria-label="Preview of a tracker day">
          <div className={cx("sit-bar-fill", "lvl-" + v)} />
          {[1, 2, 3].map((n) => (
            <button type="button" key={n} role="radio" aria-checked={v === n} aria-label={`${LEVELS[n]}: ${targets[LEVELS[n]] || "?"} ${u}`}
              className="sit-bar-seg" onClick={() => setV(n === v ? n - 1 : n)} />
          ))}
        </div>
        <span className="sit-habit-lvl">{LEVELS[v] || "—"}</span>
      </div>
    </div>
  );
}

/* ---------- CreateHabitForm ---------- */
function Step({ n, title, children }) {
  return (
    <div className="sit-step">
      <div className="sit-step-head"><span className="sit-step-num">{n}</span><span className="sit-step-title">{title}</span></div>
      {children}
    </div>
  );
}

export function buildHabitPayload(h) {
  return {
    name: h.name.trim(),
    startDate: h.startDate,
    lengthDays: h.lengthDays,
    unit: h.targets.unit,
    targets: { min: Number(h.targets.min), ok: Number(h.targets.ok), ideal: Number(h.targets.ideal) },
    reasons: h.reasons.map((r) => r.trim()).filter(Boolean),
    reminderTime: h.reminderTime || null,
    notes: h.notes.filter((n) => n.text.trim()).map((n) => ({ text: n.text.trim(), color: n.color })),
  };
}

export function CreateHabitForm({ initial = {}, onSubmit, onCancel, submitLabel = "Create habit" }) {
  const [h, setH] = useState({
    name: "",
    startDate: todayISO(),
    lengthDays: 7,
    targets: { unit: "min", min: 1, ok: 15, ideal: 30 },
    reasons: [""],
    reminderTime: "",
    notes: [
      { id: newId(), text: "There's no perfect moment to act.", color: "butter", rotate: -2 },
      { id: newId(), text: "The minimum counts. One minute is still a yes.", color: "rose", rotate: 2 },
    ],
    ...initial,
  });
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setH((x) => ({ ...x, [k]: v }));
  const nameErr = h.name.trim() ? null : "Give your habit a name.";
  const tErr = targetsError(h.targets);
  // A habit starts today or later: past days can't be logged from the start (business logic G3).
  const startErr = !h.startDate ? "Pick a start date." : h.startDate < todayISO() ? "Start today or on a later day." : null;
  const valid = !nameErr && !tErr && !startErr;
  const day = Number((h.startDate || todayISO()).slice(8, 10));

  const submit = async (e) => {
    e.preventDefault();
    // Only the "Create habit" button submits; other buttons and Enter in a field do not.
    const by = e.nativeEvent && e.nativeEvent.submitter;
    if (!by || !by.hasAttribute("data-sit-submit")) return;
    setTried(true);
    if (!valid || busy) return;
    const payload = buildHabitPayload(h);
    try {
      setBusy(true);
      onSubmit && (await onSubmit(payload));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="sit-create" onSubmit={submit} noValidate>
      <div className="sit-create-grid">
        <JournalPage pattern="dash" title="New habit">
          <Step n="1" title="Name it">
            <TextField label="Habit" script placeholder="Meditate" value={h.name} maxLength={40} onChange={(e) => set("name", e.target.value)} aria-invalid={tried && !!nameErr} />
            {tried && nameErr ? <p className="sit-error" role="alert"><b>Check:</b> {nameErr}</p> : null}
            <div className="sit-quick">
              <span className="sit-hint">Need an idea?</span>
              {QUICK.map((q) => (
                <button type="button" key={q.name} className={cx("sit-chip", h.name === q.name && "is-on")}
                  onClick={() => setH((x) => ({ ...x, name: q.name, targets: { unit: q.unit, min: q.min, ok: q.ok, ideal: q.ideal } }))}>
                  {q.name}
                </button>
              ))}
            </div>
          </Step>

          <Step n="2" title="Set three targets">
            <TargetFields value={h.targets} onChange={(v) => set("targets", v)} showError={tried || !!(h.targets.min && h.targets.ok && h.targets.ideal)} />
            <TargetPreview day={day || 1} targets={h.targets} />
          </Step>

          <Step n="3" title="Why does it matter to me?">
            <ReasonList value={h.reasons} onChange={(v) => set("reasons", v)} />
          </Step>

          <Step n="4" title="When">
            <div className="sit-when-grid">
              <div>
                <TextField label="Start on" type="date" min={todayISO()} value={h.startDate} onChange={(e) => set("startDate", e.target.value)} aria-invalid={!!startErr} />
                {startErr ? <p className="sit-error" role="alert"><b>Check:</b> {startErr}</p> : null}
              </div>
              <TextField label="Remind me at (optional)" type="time" value={h.reminderTime} onChange={(e) => set("reminderTime", e.target.value)} />
            </div>
            <div style={{ marginTop: 16 }}>
              <ChipGroup label="Track it for" id="sit-length" value={h.lengthDays} onChange={(v) => set("lengthDays", v)}
                options={[{ value: 7, label: "7 days" }, { value: 14, label: "14 days" }, { value: 30, label: "30 days" }]} />
            </div>
          </Step>
        </JournalPage>

        <div className="sit-create-side">
          <JournalPage pattern="dot" binding="none">
            <MotivationBoard notes={h.notes} onChange={(v) => set("notes", v)} />
          </JournalPage>
        </div>
      </div>

      <div className="sit-form-actions">
        {tried && !valid ? <span className="sit-error" role="status">Fix the marked fields to continue.</span> : <span />}
        {onCancel ? <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button> : null}
        <Button type="submit" data-sit-submit="" variant="primary" size="lg" disabled={busy}>{busy ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}
