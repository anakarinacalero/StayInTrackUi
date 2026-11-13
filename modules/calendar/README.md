# Calendar module · v1

A **Calendar** button for My habits. It opens a popup with a month calendar where every row is a week; tapping any day sends you to *My week* for that week. A green counter at the end of each row shows how many habits were tracked that week.

## Install

Unzip at the project root. It adds only these files:

```
modules/calendar/
  calendar.js       CalendarButton + WeekCalendar (adds them to window.StayInTrack)
  calendar.css      their styles
  calendar.d.ts     props
  src/calendar.jsx  source
  build.mjs         rebuilds calendar.js from src
preview/screens/my-habits-calendar.html   My habits with the button already in place (demo)
```

```html
<link rel="stylesheet" href="modules/calendar/calendar.css">
<script src="modules/calendar/calendar.js"></script>   <!-- after design-system/components/bundle.js -->
```

## Where it goes on My habits

**On the page header, on the right of the "My habits" title**, aligned with the bottom of the subtitle. Search and sort stay on the row below with "+ New habit".

```
┌───────────────────────────────────────────────────────────────┐
│  My habits                                                    │
│  ‾‾‾‾‾‾‾‾‾‾                                                    │
│  Everything you're tracking, one post-it each…   [ Calendar ] │  ← here
│                                                               │
│  [ Search habits           ] (Recent)(A–Z)      [+ New habit] │
│  5 habits                                                     │
│  ▢ ▢ ▢ ▢   post-its                                           │
└───────────────────────────────────────────────────────────────┘
```

Wrap the title and the button in one flex row (no change to the habits module is needed):

```js
const { HandTitle, CalendarButton, HabitBoard } = window.StayInTrack;

html`
  <div style=${{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
    <div>
      <${HandTitle} as="h1" size="lg" accent="habits">My<//>
      <p style=${{ margin: "10px 0 0", fontSize: "18px", lineHeight: "28px", color: "var(--ink-muted)" }}>
        Everything you're tracking, one post-it each. Open a habit to see all its sheets.
      </p>
    </div>
    <${CalendarButton}
      marks=${marks}
      onSelectWeek=${(weekStart) => (location.href = `week.html?date=${weekStart}`)} />
  </div>
  <${HabitBoard} … />
`
```

On phones the row wraps: the button drops under the subtitle, on the left, just above the search bar.

## How it behaves

- The popup is a native `<dialog>`: the page behind is blocked and dimmed, and focus starts on today. **Escape**, the ✕ or a click outside closes it and returns focus to the button.
- Hovering or focusing a day highlights its whole week with the yellow marker. Today is circled in blush.
- Arrows move by day or week, **PageUp / PageDown** change month, **Home / End** jump to the start or end of the week, and **Enter** opens the week.
- **This week** opens the current week directly. Days of the previous and next months are greyed but still work, because weeks cross months.
- Weeks start on Monday; `weekStartsOn={0}` starts them on Sunday.

## The counters (optional)

`marks` is `{ "2026-11-09": 4, "2026-11-16": 1 }`: weekStart → number of habits tracked. Without `marks` the calendar works the same, just without the counters.

From the server, for the months on screen:

```
GET /api/habits/week-marks?from=2026-10-26&to=2026-12-06
→ { "2026-10-26": 4, "2026-11-02": 4, "2026-11-09": 4, "2026-11-16": 1, "2026-11-23": 1 }
```

Use `onMonthChange(month)` ("YYYY-MM") to load them when the person changes month. If you already have the sheets' date ranges in the browser, `weekMarks(ranges)` counts them for you:

```js
const marks = StayInTrack.weekMarks([
  { habitId: "h-read", startDate: "2026-10-28", endDate: "2026-11-10" },
  { habitId: "h-read", startDate: "2026-11-11", endDate: "2026-11-24" },
]);
```

### .NET

```csharp
// GET /api/habits/week-marks?from=2026-10-26&to=2026-12-06
var sheets = await db.Sheets
    .Where(s => s.Habit.UserId == userId && s.StartDate <= to && s.EndDate >= from)
    .Select(s => new { s.HabitId, s.StartDate, s.EndDate })
    .ToListAsync();

var marks = new Dictionary<DateOnly, HashSet<Guid>>();
foreach (var s in sheets)
{
    var monday = s.StartDate.AddDays(-(((int)s.StartDate.DayOfWeek + 6) % 7));
    for (var w = monday; w <= s.EndDate; w = w.AddDays(7))
    {
        if (!marks.TryGetValue(w, out var set)) marks[w] = set = new HashSet<Guid>();
        set.Add(s.HabitId);
    }
}

return marks.Where(m => m.Key >= from.AddDays(-6) && m.Key <= to)
            .ToDictionary(m => m.Key.ToString("yyyy-MM-dd"), m => m.Value.Count);
```

## Components

| Component | What it does |
| --- | --- |
| `CalendarButton` | The pill button (calendar icon + "Calendar") and its popup. Props: `onSelectWeek`, `marks`, `onMonthChange`, `value`, `today`, `weekStartsOn`, `label`, `variant`, `title`. |
| `WeekCalendar` | Just the month grid, if you want it inside a page instead of a popup. |

## Change it

Edit `src/calendar.jsx`, then from the project root run `node modules/calendar/build.mjs`.
