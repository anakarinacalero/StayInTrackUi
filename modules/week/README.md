# Week module · v1

**My week** (`preview/screens/week.html?date=YYYY-MM-DD`) shows your habits one week at a time. Pick a week with the arrows, "This week", or any date (April 11 opens the week of Apr 6 – 12). The screen shows **only the habits that were tracked that week**: one row per habit, one column per day, with that week's totals and the notes of its sheets.

## Install

Unzip at the project root. It adds only these files:

```
modules/week/
  week.js         the components (adds them to window.StayInTrack)
  week.css        their styles
  week.d.ts       props and the API shape
  src/week.jsx    source
  build.mjs       rebuilds week.js from src
preview/screens/week.html
```

```html
<link rel="stylesheet" href="design-system/components/bundle.css">
<link rel="stylesheet" href="modules/week/week.css">
<script src="design-system/components/bundle.js"></script>
<script src="modules/week/week.js"></script>
```

It doesn't need the other modules. The preview page borrows the habits module's `sample-data.js` as demo data.

## Use it

```js
const { WeekView, todayISO } = window.StayInTrack;
const root = ReactDOM.createRoot(document.getElementById("week"));
let week = null;

function render(loading) {
  root.render(React.createElement(WeekView, {
    week,
    loading,
    onWeekChange: load,                                   // receives the new week's Monday
    onOpenHabit: (h) => (location.href = `habit.html?id=${h.id}`),
    onCreate: () => (location.href = "create-habit.html"),
  }));
}

async function load(date) {
  render(true);
  week = await (await fetch(`/api/habits/week?date=${date}`)).json();
  history.replaceState(null, "", `?date=${week.weekStart}`);   // shareable link to the week
  render(false);
}

load(new URLSearchParams(location.search).get("date") || todayISO());
```

Weeks start on **Monday** (`weekStartsOn={0}` makes them start on Sunday). `startOfWeek("2026-04-11")` returns `"2026-04-06"`.

## What `GET /api/habits/week?date=2026-04-11` returns

The server finds the week that contains the date and returns **only habits that have at least one sheet day in that week**, each with exactly 7 days:

```json
{
  "weekStart": "2026-04-06",
  "weekEnd": "2026-04-12",
  "habits": [{
    "id": "h-read", "name": "Read", "unit": "pages", "color": "sky",
    "targets": { "min": 2, "ok": 10, "ideal": 20 },
    "targetsChanged": false,
    "days": [
      { "date": "2026-04-06", "level": 0, "inSheet": true },
      { "date": "2026-04-07", "level": 2, "inSheet": true },
      { "date": "2026-04-08", "level": null, "inSheet": true },
      { "date": "2026-04-09", "level": null, "inSheet": false }
    ],
    "notes": [{ "sheetId": "s-2", "text": "Finished the novel!" }]
  }]
}
```

- `level`: 0 missed · 1 min · 2 ok · 3 ideal · `null` not logged yet.
- `inSheet: false`: the habit wasn't being tracked that day (its sheet started later or ended earlier). It shows as a dot, not as a miss.
- A week can mix two sheets (Read's 14-day sheets in the demo). The days come from whichever sheet covers them, and `targets` are the latest sheet's, with `targetsChanged` if they differ.
- No habits that week: `"habits": []`, and the screen shows "Nothing tracked the week of …" with buttons to go to this week or create a habit.

### .NET

```csharp
public record WeekDayDto(DateOnly Date, int? Level, bool InSheet);
public record WeekHabitDto(Guid Id, string Name, string Unit, string? Color, TargetsDto Targets,
                           bool TargetsChanged, List<WeekDayDto> Days, List<WeekNoteDto> Notes);
public record WeekNoteDto(Guid SheetId, string Text);
public record WeekDto(DateOnly WeekStart, DateOnly WeekEnd, List<WeekHabitDto> Habits);

// GET /api/habits/week?date=2026-04-11
var start = date.AddDays(-(((int)date.DayOfWeek + 6) % 7));   // Monday
var end = start.AddDays(6);

var habits = await db.Habits
    .Where(h => h.UserId == userId &&
                h.Sheets.Any(s => s.StartDate <= end && s.EndDate >= start))   // only that week's habits
    .Select(h => new {
        h,
        Sheets = h.Sheets.Where(s => s.StartDate <= end && s.EndDate >= start)
                         .OrderBy(s => s.StartDate).ToList(),
        Days = h.Sheets.SelectMany(s => s.Days)
                       .Where(d => d.Date >= start && d.Date <= end).ToList()
    })
    .ToListAsync();
// Then build 7 WeekDayDto per habit: InSheet = the date falls inside one of its Sheets;
// Level = the logged level for that date, or null.
```

## Components

| Component | What it does |
| --- | --- |
| `WeekView` | The whole screen body: picker, three totals (habits this week, logged days at least min, best day), the grid, legend and the week's notes, plus empty and loading states. |
| `WeekPicker` | Previous / next week, "This week", and "Go to a date". |
| `WeekGrid` | Accessible table: a habit post-it tab and targets, 7 day cells, and "x/7 ≥ min" with Open. On phones each habit becomes its own block with the name on top. |
| `DayCell` | One day: filled one, two or three thirds for min / ok / ideal, "–" missed, dashed for not logged yet, "·" not tracked. Each cell has a text label for screen readers. |
| `WeekLegend` | The six cell states with their words. |

Helpers: `startOfWeek`, `addDaysISO`, `weekDays`, `formatWeek`, and `buildWeek(habits, sheetsByHabit, weekStart)`, which builds the same payload in the browser from the habits module's data (the demo uses it).

## Change it

Edit `src/week.jsx`, then from the project root run `node modules/week/build.mjs`.
