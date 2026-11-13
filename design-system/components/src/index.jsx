const { useState, useEffect, useRef } = React;
const cx = (...a) => a.filter(Boolean).join(" ");

/* ---------- Doodles ---------- */
const DOODLES = {
  cloud: (
    <path d="M8 26h30a7 7 0 0 0 0-14 9 9 0 0 0-17-3 7 7 0 0 0-11 5 6 6 0 0 0-2 12z" fill="none" strokeWidth="2.2" strokeLinejoin="round" />
  ),
  plus: (
    <path d="M24 10v28M10 24h28" fill="none" strokeWidth="5" strokeLinecap="round" />
  ),
  dot: <circle cx="24" cy="24" r="7" stroke="none" />,
  flower: (
    <g>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="24" cy="13" rx="6" ry="9" transform={`rotate(${a} 24 24)`} stroke="none" />
      ))}
      <circle cx="24" cy="24" r="7" className="sit-doodle-center" stroke="none" />
      <circle cx="22" cy="22" r="1.1" className="sit-doodle-seed" stroke="none" />
      <circle cx="26" cy="23" r="1.1" className="sit-doodle-seed" stroke="none" />
      <circle cx="24" cy="26.5" r="1.1" className="sit-doodle-seed" stroke="none" />
    </g>
  ),
  rings: (
    <g fill="none" strokeWidth="2" strokeLinecap="round">
      <path d="M4 44C4 20 18 6 44 6" />
      <path d="M12 44C12 26 22 14 44 14" />
      <path d="M20 44c0-12 8-22 24-22" />
      <path d="M28 44c0-7 5-14 16-14" />
    </g>
  ),
  squiggle: (
    <path d="M4 30c6-12 10 8 16-4s10 8 16-4 8 6 8 6" fill="none" strokeWidth="2.5" strokeLinecap="round" />
  ),
  sparkle: (
    <g stroke="none">
      <path d="M22 8c2 10 6 14 16 16-10 2-14 6-16 16-2-10-6-14-16-16 10-2 14-6 16-16z" />
      <path d="M38 4c.8 4 2.2 5.2 6 6-3.8.8-5.2 2.2-6 6-.8-3.8-2.2-5.2-6-6 3.8-.8 5.2-2.2 6-6z" />
    </g>
  ),
  bulb: (
    <g fill="none" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 31c-3-3-5-6-5-11a12 12 0 0 1 24 0c0 5-2 8-5 11v4H17z" />
      <path d="M19 40h10M21 45h6" />
    </g>
  ),
  phone: (
    <g fill="none" strokeWidth="2.8" strokeLinecap="round">
      <rect x="14" y="5" width="20" height="38" rx="4" />
      <path d="M21 37h6" />
    </g>
  ),
  target: (
    <g>
      <g fill="none" strokeWidth="2.8">
        <circle cx="24" cy="24" r="17" />
        <circle cx="24" cy="24" r="9.5" />
      </g>
      <circle cx="24" cy="24" r="3.5" stroke="none" />
    </g>
  ),
  chart: (
    <path d="M10 40V28M20 40V16M30 40V22M40 40V10" fill="none" strokeWidth="3.4" strokeLinecap="round" />
  ),
  calendar: (
    <g fill="none" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="10" width="34" height="31" rx="5" />
      <path d="M7 19h34M16 6v8M32 6v8" />
    </g>
  ),
  send: (
    <g fill="none" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 22 42 7 29 42l-6-15z" />
      <path d="M23 27 42 7" />
    </g>
  ),
  sprout: (
    <g fill="none" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 43V22" />
      <path d="M24 27c0-9-6-14-15-14 0 9 6 14 15 14z" />
      <path d="M24 22c0-8 5-13 14-13 0 8-5 13-14 13z" />
    </g>
  ),
};

export function Doodle({ kind = "cloud", tone = "ink", size = 32, style, className }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className={cx("sit-doodle", "sit-tone-" + tone, "sit-doodle-" + kind, className)}
      style={style}
    >
      {DOODLES[kind] || DOODLES.cloud}
    </svg>
  );
}

function rand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function DoodleField({ seed = 7, count = 14, kinds, children, className, style }) {
  const r = rand(seed);
  const list = kinds || ["cloud", "dot", "plus", "flower", "dot", "dot", "plus", "cloud"];
  const tones = { cloud: ["ink"], dot: ["blush", "mustard", "ink"], plus: ["ink", "tan", "blush"], flower: ["mustard", "blush"], rings: ["blush", "mustard"], squiggle: ["mustard"] };
  const items = [];
  for (let i = 0; i < count; i++) {
    const kind = list[i % list.length];
    const tl = tones[kind] || ["ink"];
    const size = kind === "dot" ? 8 + r() * 8 : kind === "cloud" ? 34 + r() * 14 : kind === "rings" ? 120 + r() * 60 : 18 + r() * 14;
    items.push(
      <Doodle
        key={i}
        kind={kind}
        tone={tl[Math.floor(r() * tl.length)]}
        size={Math.round(size)}
        style={{ position: "absolute", left: (i % 2 ? 93 + r() * 5 : r() * 5).toFixed(1) + "%", top: (r() * 94).toFixed(1) + "%" }}
      />
    );
  }
  return (
    <div className={cx("sit-field", className)} style={style}>
      <div className="sit-field-doodles" aria-hidden="true">{items}</div>
      <div className="sit-field-content">{children}</div>
    </div>
  );
}

/* ---------- Brand ---------- */
export function Logo({ size = "md", onCover = false }) {
  const px = { sm: 22, md: 30, lg: 48 }[size] || 30;
  return (
    <span className={cx("sit-logo", "sit-logo-" + size, onCover && "sit-logo-cover")}>
      <Doodle kind="flower" tone={onCover ? "gold" : "mustard"} size={px} />
      <span className="sit-logo-word">
        Stay<span className="sit-logo-in">in</span>Track
      </span>
    </span>
  );
}

/* ---------- Type helpers ---------- */
export function HandTitle({ as = "h2", size = "lg", underline = "mustard", accent, children, className }) {
  const T = as;
  return (
    <T className={cx("sit-handtitle", "sit-handtitle-" + size, className)}>
      <span className="sit-handtitle-text">
        {children}
        {accent ? <span className="sit-accent"> {accent}</span> : null}
      </span>
      {underline !== "none" && (
        <svg className={cx("sit-underline", "sit-tone-" + underline)} viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
          <path d="M3 8c40-4 90-5 140-4s100 3 154-1" fill="none" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )}
    </T>
  );
}

export function Highlight({ children }) {
  return <mark className="sit-highlight">{children}</mark>;
}

/* ---------- Surfaces ---------- */
export function JournalPage({ pattern = "dash", binding = "disc", scallop = false, title, children, className, style }) {
  return (
    <section className={cx("sit-page", "sit-pattern-" + pattern, binding === "disc" && "sit-bound", scallop && "sit-page-scallop", className)} style={style}>
      {binding === "disc" && <div className="sit-discs" aria-hidden="true" />}
      <div className="sit-page-inner">
        {title ? <div className="sit-page-title">{title}</div> : null}
        {children}
      </div>
    </section>
  );
}

export function ScallopCard({ tone = "paper", children, className, style }) {
  return (
    <div className={cx("sit-scallop", "sit-scallop-" + tone, className)} style={style}>
      <div className="sit-scallop-inner">{children}</div>
    </div>
  );
}

export function Blob({ children, className, style }) {
  return (
    <div className={cx("sit-blob", className)} style={style}>
      {children}
    </div>
  );
}

/* ---------- Controls ---------- */
export function Button({ variant = "secondary", size = "md", className, children, ...rest }) {
  return (
    <button {...rest} className={cx("sit-btn", "sit-btn-" + variant, "sit-btn-" + size, className)}>
      {children}
    </button>
  );
}

let fid = 0;
export function TextField({ label, hint, script = false, multiline = false, id, className, ...rest }) {
  const ref = useRef(null);
  if (!ref.current) ref.current = id || "sit-f" + ++fid;
  const fieldId = ref.current;
  const C = multiline ? "textarea" : "input";
  return (
    <label className={cx("sit-field-wrap", className)} htmlFor={fieldId}>
      {label ? <span className="sit-label">{label}</span> : null}
      <C id={fieldId} className={cx("sit-input", script && "sit-input-script", multiline && "sit-input-multi")} {...rest} />
      {hint ? <span className="sit-hint">{hint}</span> : null}
    </label>
  );
}

export function Badge({ tone = "neutral", children }) {
  return <span className={cx("sit-badge", "sit-badge-" + tone)}>{children}</span>;
}

/* ---------- Navigation ---------- */
const TOOLS = [
  { id: "distractors", label: "Distractors", note: "List them, decide, move on", k: "plus", tone: "ink" },
  { id: "tracker", label: "Minimal tracker", note: "Min · ok · ideal, 7 days", k: "flower", tone: "blush" },
  { id: "wish", label: "Catch a wish", note: "Park the urge, check it later", k: "cloud", tone: "ink" },
];
// AI helper: one chat (plan your day + ask about your journal) and one weekly report.
// Distraction patterns and habit suggestions live inside the summary and inside the tools they read.
const AI_MODULES = [
  { id: "helper", label: "Ask the helper", note: "Plan your day, ask about your journal", k: "sparkle", tone: "mustard" },
  { id: "summary", label: "Weekly summary", note: "Your week, distractions and habits", k: "chart", tone: "ink" },
];
const MENUS = [
  { key: "tools", label: "Tools", items: TOOLS },
  { key: "ai", label: "AI helper", icon: "sparkle", items: AI_MODULES },
];

export function NavBar({ active = "home", onNavigate, user = "Ana", defaultOpen = false, hideMenus = [] }) {
  const [open, setOpen] = useState(defaultOpen === true ? "tools" : defaultOpen || null);
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(null);
    };
    const esc = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const go = (id) => {
    setOpen(null);
    onNavigate && onNavigate(id);
  };
  return (
    <header className="sit-nav">
      <a className="sit-nav-brand" href="#home" onClick={(e) => { e.preventDefault(); go("home"); }}>
        <Logo size="sm" />
      </a>
      <nav className="sit-tabs" aria-label="Main" ref={wrap}>
        <button className={cx("sit-tab", active === "home" && "is-active")} onClick={() => go("home")}>Home</button>
        <button className={cx("sit-tab", active === "suggestions" && "is-active")} onClick={() => go("suggestions")}>Suggestions</button>
        {MENUS.filter((m) => hideMenus.indexOf(m.key) < 0).map((m) => {
          const isOpen = open === m.key;
          const isActive = m.items.some((t) => t.id === active);
          return (
            <div className="sit-dd" key={m.key}>
              <button className={cx("sit-tab", isActive && "is-active", isOpen && "is-open")} aria-haspopup="true" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : m.key)}>
                {m.icon ? <Doodle kind={m.icon} tone="mustard" size={15} /> : null}
                {m.label}
                <svg className="sit-caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {isOpen && (
                <div className="sit-dd-panel" role="menu">
                  {m.items.map((t) => (
                    <button key={t.id} role="menuitem" className={cx("sit-dd-item", active === t.id && "is-active")} onClick={() => go(t.id)}>
                      <Doodle kind={t.k} tone={t.tone} size={18} />
                      <span>
                        <span className="sit-dd-label">{t.label}</span>
                        <span className="sit-dd-note">{t.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="sit-nav-user">
        <span className="sit-avatar" aria-hidden="true">{user.slice(0, 1)}</span>
        <span className="sit-nav-name">{user}</span>
      </div>
    </header>
  );
}

/* ---------- Content pieces ---------- */
export function NumberedTip({ n, children, done, onToggle }) {
  return (
    <div className={cx("sit-tip", done && "is-done")}>
      <span className="sit-tip-n">{String(n).padStart(2, "0")}</span>
      <div className="sit-tip-body">
        <p>{children}</p>
        {onToggle && (
          <button className="sit-tip-toggle" onClick={onToggle} aria-pressed={!!done}>
            {done ? "✓ In my routine" : "+ Add to my routine"}
          </button>
        )}
      </div>
    </div>
  );
}

export function StickyNote({ color = "butter", rotate = -2, pin = "tape", children, className, style }) {
  return (
    <div className={cx("sit-sticky", "sit-sticky-" + color, className)} style={{ transform: `rotate(${rotate}deg)`, ...style }}>
      {pin === "tape" && <span className="sit-tape" aria-hidden="true" />}
      {pin === "pin" && <span className="sit-pin" aria-hidden="true" />}
      <div className="sit-sticky-body">{children}</div>
    </div>
  );
}

export function CheckItem({ checked: c0 = false, onChange, priority, plain = false, children }) {
  const [inner, setInner] = useState(c0);
  const checked = onChange ? c0 : inner;
  const toggle = () => (onChange ? onChange(!checked) : setInner(!checked));
  return (
    <label className={cx("sit-check", checked && "is-checked", plain && "sit-check-plain")}>
      <input type="checkbox" checked={checked} onChange={toggle} />
      <span className="sit-check-box" aria-hidden="true">
        <svg viewBox="0 0 20 20"><path d="M4 10.5 8.5 15 16 5" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="sit-check-text">{children}</span>
      {priority ? <Badge tone={priority === "high" ? "rose" : priority === "mid" ? "butter" : "neutral"}>{priority === "high" ? "Priority" : priority === "mid" ? "Today" : "Can wait"}</Badge> : null}
    </label>
  );
}

const LEVELS = ["", "min", "ok", "ideal"];
export function HabitRow({ day, value: v0 = 0, onChange, labels = ["min", "ok", "ideal"] }) {
  const [inner, setInner] = useState(v0);
  const value = onChange ? v0 : inner;
  const set = (n) => {
    const next = n === value ? n - 1 : n;
    onChange ? onChange(next) : setInner(next);
  };
  return (
    <div className="sit-habit">
      <span className={cx("sit-day", value > 0 && "is-on")}>{day}</span>
      <span className="sit-leader" aria-hidden="true" />
      <div className="sit-bar" role="radiogroup" aria-label={"Day " + day}>
        <div className={cx("sit-bar-fill", "lvl-" + value)} />
        {[1, 2, 3].map((n) => (
          <button key={n} role="radio" aria-checked={value === n} aria-label={labels[n - 1]} className="sit-bar-seg" onClick={() => set(n)} />
        ))}
      </div>
      <span className="sit-habit-lvl">{LEVELS[value] || "—"}</span>
    </div>
  );
}

export function RuledList({ title, items = [], align = "left" }) {
  return (
    <div className={cx("sit-ruled", "sit-ruled-" + align)}>
      <div className="sit-ruled-title">{title}</div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function DecisionTable({ columns = [] }) {
  return (
    <div className="sit-decide" role="table">
      {columns.map((c, i) => (
        <div className="sit-decide-col" role="rowgroup" key={i}>
          <div className="sit-decide-q" role="columnheader">{c.question}</div>
          <div className="sit-decide-a" role="cell"><b className="sit-yes">Yes:</b> {c.yes}</div>
          <div className="sit-decide-a" role="cell"><b className="sit-no">No:</b> {c.no}</div>
        </div>
      ))}
    </div>
  );
}

export function Choice({ question, value, onChange, yes = "Yes", no = "No" }) {
  return (
    <div className="sit-choice">
      <span className="sit-choice-q">{question}</span>
      <div className="sit-choice-opts">
        <button className={cx("sit-chip", value === true && "is-yes")} aria-pressed={value === true} onClick={() => onChange && onChange(true)}>{yes}</button>
        <button className={cx("sit-chip", value === false && "is-no")} aria-pressed={value === false} onClick={() => onChange && onChange(false)}>{no}</button>
      </div>
    </div>
  );
}

export function StepList({ steps = [], active = 0 }) {
  return (
    <ol className="sit-steps">
      {steps.map((s, i) => (
        <li key={i} className={cx(i < active && "is-past", i === active && "is-now")}>
          <span className="sit-step-n">{i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function NotebookCover({ edge = false, children, className, style }) {
  return (
    <div className={cx("sit-cover", edge && "sit-cover-edge", className)} style={style}>
      {children}
    </div>
  );
}

/* ---------- AI helper ---------- */
export function ChatMessage({ from = "ai", name = "Ana", children }) {
  const ai = from === "ai";
  return (
    <div className={cx("sit-msg", ai ? "sit-msg-ai" : "sit-msg-user")}>
      <span className={cx("sit-msg-avatar", ai && "is-ai")} aria-hidden="true">
        {ai ? <Doodle kind="sparkle" tone="onsticky" size={18} /> : name.slice(0, 1)}
      </span>
      <div className="sit-msg-bubble">
        <span className="sit-sr">{ai ? "StayInTrack helper: " : "You: "}</span>
        {children}
      </div>
    </div>
  );
}

export function ChatComposer({ placeholder = "Message StayInTrack…", onSend }) {
  const [v, setV] = useState("");
  const send = (e) => {
    e.preventDefault();
    if (!v.trim()) return;
    onSend && onSend(v.trim());
    setV("");
  };
  return (
    <form className="sit-composer" onSubmit={send}>
      <input className="sit-composer-input" aria-label="Message" placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value)} />
      <button type="submit" className="sit-composer-send" aria-label="Send">
        <Doodle kind="send" tone="onink" size={20} />
      </button>
    </form>
  );
}

export function PromptChip({ icon = "sparkle", children, onClick }) {
  return (
    <button className="sit-prompt" onClick={onClick}>
      <Doodle kind={icon} tone={icon === "sparkle" ? "mustard" : "ink"} size={16} />
      {children}
    </button>
  );
}

export function Thinking() {
  return (
    <span className="sit-thinking" role="status" aria-label="Thinking">
      <i /><i /><i />
    </span>
  );
}

export function InsightCard({ icon = "bulb", tone = "butter", title, children, action }) {
  return (
    <div className={cx("sit-insight", "sit-insight-" + tone)}>
      <span className="sit-insight-icon"><Doodle kind={icon} tone="onsticky" size={22} /></span>
      <div className="sit-insight-body">
        <div className="sit-insight-title">{title}</div>
        {children ? <div className="sit-insight-text">{children}</div> : null}
        {action ? <div className="sit-insight-action">{action}</div> : null}
      </div>
    </div>
  );
}

export function StatTile({ label, value, unit, note, icon, tone = "paper" }) {
  return (
    <div className={cx("sit-stat", "sit-stat-" + tone)}>
      {icon ? <Doodle kind={icon} tone={tone === "paper" ? "rose" : "onsticky"} size={22} /> : null}
      <div className="sit-stat-label">{label}</div>
      <div className="sit-stat-value">
        {value}
        {unit ? <span className="sit-stat-unit"> {unit}</span> : null}
      </div>
      {note ? <div className="sit-stat-note">{note}</div> : null}
    </div>
  );
}

export function ProgressRow({ icon, label, value, total, unit = "days" }) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="sit-prow">
      <span className="sit-prow-label">
        {icon ? <Doodle kind={icon} tone="rose" size={18} /> : null}
        {label}
      </span>
      <span className="sit-prow-val">
        <b>{value}</b> of {total} {unit}
      </span>
      <span className="sit-meter" role="img" aria-label={`${label}: ${value} of ${total} ${unit}`}>
        <span style={{ width: pct + "%" }} />
      </span>
    </div>
  );
}

function ChartFrame({ title, table, children }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <figure className="sit-chart">
      <figcaption className="sit-chart-head">
        <span className="sit-chart-title">{title}</span>
        <button className="sit-chart-toggle" onClick={() => setAsTable(!asTable)} aria-pressed={asTable}>
          {asTable ? "Show chart" : "Show table"}
        </button>
      </figcaption>
      {asTable ? table : children}
    </figure>
  );
}

function DataTable({ data, unit, labelHead }) {
  return (
    <table className="sit-table">
      <thead><tr><th>{labelHead}</th><th>{unit}</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{d.value}</td></tr>)}</tbody>
    </table>
  );
}

export function BarChart({ title, data = [], highlight = [], max, unit = "Habits", labelHead = "Day" }) {
  const [hover, setHover] = useState(-1);
  const W = 560, H = 230, L = 32, R = 8, T = 18, B = 30;
  const top = max || Math.max(1, ...data.map((d) => d.value));
  const pw = W - L - R, ph = H - T - B;
  const slot = pw / Math.max(1, data.length);
  const bw = Math.min(24, slot * 0.6);
  const y = (v) => T + ph - (v / top) * ph;
  const ticks = [];
  const step = top <= 6 ? 1 : Math.ceil(top / 5);
  for (let t = 0; t <= top; t += step) ticks.push(t);
  return (
    <ChartFrame title={title} table={<DataTable data={data} unit={unit} labelHead={labelHead} />}>
      <div className="sit-chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} className="sit-chart-svg" role="img" aria-label={title + ": " + data.map((d) => d.label + " " + d.value).join(", ")}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="sit-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
              <text className="sit-axis" x={L - 10} y={y(t) + 4} textAnchor="end">{t}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx0 = L + slot * i + slot / 2, x = cx0 - bw / 2, yy = y(d.value), h = T + ph - yy;
            const r = Math.min(4, h);
            const hi = highlight.includes(d.label);
            return (
              <g key={d.label}>
                {h > 0 && (
                  <path className={cx("sit-bar-mark", hi && "is-hi", hover === i && "is-hover")}
                    d={`M${x} ${T + ph}V${yy + r}q0 ${-r} ${r} ${-r}h${bw - 2 * r}q${r} 0 ${r} ${r}V${T + ph}z`} />
                )}
                {hi && <text className="sit-value" x={cx0} y={yy - 6} textAnchor="middle">{d.value}</text>}
                <text className="sit-axis" x={cx0} y={H - 10} textAnchor="middle">{d.label}</text>
                <rect className="sit-hit" x={L + slot * i} y={T} width={slot} height={ph} tabIndex={0}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)} onFocus={() => setHover(i)} onBlur={() => setHover(-1)} />
              </g>
            );
          })}
        </svg>
        {hover >= 0 && (
          <div className="sit-tip-pop" style={{ left: ((L + slot * hover + slot / 2) / W) * 100 + "%", top: (y(data[hover].value) / H) * 100 + "%" }}>
            <b>{data[hover].value}</b> {unit.toLowerCase()} · {data[hover].label}
          </div>
        )}
      </div>
    </ChartFrame>
  );
}

export function LineChart({ title, data = [], max, unit = "Times", labelHead = "Session" }) {
  const [hover, setHover] = useState(-1);
  const W = 560, H = 230, L = 32, R = 24, T = 18, B = 30;
  const top = max || Math.max(1, ...data.map((d) => d.value));
  const pw = W - L - R, ph = H - T - B;
  const n = Math.max(1, data.length - 1);
  const x = (i) => L + 14 + ((pw - 28) * i) / n;
  const y = (v) => T + ph - (v / top) * ph;
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join("");
  const area = line + `L${x(data.length - 1)} ${T + ph}L${x(0)} ${T + ph}z`;
  const ticks = [];
  for (let t = 0; t <= top; t += top <= 6 ? 1 : Math.ceil(top / 5)) ticks.push(t);
  const last = data.length - 1;
  return (
    <ChartFrame title={title} table={<DataTable data={data} unit={unit} labelHead={labelHead} />}>
      <div className="sit-chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} className="sit-chart-svg" role="img" aria-label={title + ": " + data.map((d) => d.label + " " + d.value).join(", ")}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="sit-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
              <text className="sit-axis" x={L - 10} y={y(t) + 4} textAnchor="end">{t}</text>
            </g>
          ))}
          <path className="sit-area-mark" d={area} />
          {hover >= 0 && <line className="sit-crosshair" x1={x(hover)} x2={x(hover)} y1={T} y2={T + ph} />}
          <path className="sit-line-mark" d={line} />
          {pts.map((p, i) => <circle key={i} className={cx("sit-dot-mark", hover === i && "is-hover")} cx={p[0]} cy={p[1]} r={hover === i ? 6 : 5} />)}
          {last >= 0 && <text className="sit-value" x={pts[last][0]} y={pts[last][1] - 12} textAnchor="middle">{data[last].value}</text>}
          {data.map((d, i) => (
            <text key={d.label} className="sit-axis" x={x(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}>{d.label}</text>
          ))}
          {data.map((d, i) => (
            <rect key={"h" + i} className="sit-hit" x={x(i) - (pw - 28) / n / 2} y={T} width={(pw - 28) / n} height={ph} tabIndex={0}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)} onFocus={() => setHover(i)} onBlur={() => setHover(-1)} />
          ))}
        </svg>
        {hover >= 0 && (
          <div className="sit-tip-pop" style={{ left: (x(hover) / W) * 100 + "%", top: (y(data[hover].value) / H) * 100 + "%" }}>
            <b>{data[hover].value}</b> {unit.toLowerCase()} · {data[hover].label}
          </div>
        )}
      </div>
    </ChartFrame>
  );
}
