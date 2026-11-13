# Habits module · v1

Two screens to retrieve every habit:

1. **My habits** (`preview/screens/my-habits.html`): each habit is a post-it with its targets, a mini strip of the latest sheet, and a paper note with its first motivation phrase. It has search (by name and reasons), sorting (Recent / A–Z), a delete icon with a confirmation inside the post-it, and a "New habit" tile.
2. **Habit** (`preview/screens/habit.html?id=…`): name, targets, totals, reasons and motivation notes, then **all its sheets, newest first**, grouped by month. The newest sheet is open; older ones show a mini strip and their note until you open them.

## Install

Unzip at the project root. It adds only these files and changes nothing you already have:

```
modules/habits/
  habits.js          the components (adds them to window.StayInTrack)
  habits.css         their styles
  habits.d.ts        props and the API shapes
  sample-data.js     demo data used by the two preview pages (replace with your API)
  src/habits.jsx     source
  build.mjs          rebuilds habits.js from src
preview/screens/my-habits.html
preview/screens/habit.html
```

Load it after the design system (it doesn't need the minimal-tracker module):

```html
<link rel="stylesheet" href="design-system/components/bundle.css">
<link rel="stylesheet" href="modules/habits/habits.css">
<script src="design-system/components/bundle.js"></script>
<script src="modules/habits/habits.js"></script>
```

## Use it

```js
const { HabitBoard, HabitDetail } = window.StayInTrack;
const h = React.createElement;

// Screen 1
const habits = await (await fetch("/api/habits")).json();
root.render(h(HabitBoard, {
  habits,
  onOpen: (habit) => (location.href = `habit.html?id=${habit.id}`),
  onCreate: () => (location.href = "create-habit.html"),
  onDelete: async (habit) => {
    const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");   // throwing keeps the post-it
    // then remove it from your state and render again
  },
}));

// Screen 2
const detail = await (await fetch(`/api/habits/${id}`)).json();
root.render(h(HabitDetail, {
  habit: detail,
  sheets: detail.sheets,          // any order: the component sorts newest first
  onBack: () => (location.href = "my-habits.html"),
  onNewSheet: () => { /* POST /api/habits/{id}/sheets */ },
  onDelete: async (habit) => { await fetch(`/api/habits/${habit.id}`, { method: "DELETE" }); location.href = "my-habits.html"; },
}));
```

Delete always asks first ("Delete Meditate? Its 6 sheets and notes go too.") with focus on **Keep it**; Escape cancels. `onDelete` runs only after the user confirms, and if it throws, the habit stays.

## API shapes

**GET /api/habits** returns a list. Keep it light: only the latest sheet, with plain levels.

```json
[{
  "id": "h-meditate", "name": "Meditate", "unit": "min", "color": "rose",
  "targets": { "min": 1, "ok": 15, "ideal": 30 }, "lengthDays": 7,
  "reasons": ["Improve my mood"],
  "notes": [{ "text": "There's no perfect moment to act.", "color": "butter" }],
  "createdAt": "2026-10-05", "sheetsCount": 6,
  "nextTargets": null,
  "lastSheet": { "id": "s-6", "startDate": "2026-11-09", "endDate": "2026-11-15", "days": [2, 3, 1, null, null, null, null] }
}]
```

**GET /api/habits/{id}** returns the habit plus every sheet, each with the targets it had at that time.

```json
{
  "...habit fields": "as above",
  "sheets": [{
    "id": "s-6", "startDate": "2026-11-09", "endDate": "2026-11-15",
    "targets": { "min": 1, "ok": 15, "ideal": 30 },
    "days": [{ "date": "2026-11-09", "level": 2 }, { "date": "2026-11-10", "level": 3 }],
    "note": null
  }]
}
```

**Targets changed mid-sheet ("from today").** A sheet can carry `targetsHistory`: each entry rules from its `from` date on. `targets` stays as the targets the sheet started with. Past days are never recalculated, so a past `2` (ok) keeps the numbers it had that day.

```json
"targets": { "min": 1, "ok": 15, "ideal": 30 },
"targetsHistory": [{ "from": "2026-11-11", "targets": { "min": 5, "ok": 20, "ideal": 40 } }]
```

**PUT /api/habits/{id}/targets** `{ "targets": {...}, "from": "2026-11-11" }` sets the habit's targets for its next sheets and adds (or replaces, if one exists for that date) the `targetsHistory` entry on the running sheet. If `from` is the sheet's first day, replace `targets` instead. The unit can't change mid-sheet.

**Targets from the next sheet.** `{ "targets": {...}, "from": "next-sheet" }` leaves the running sheet alone and stores the targets as the habit's `nextTargets`. **POST /api/habits/{id}/sheets** starts the new sheet with `nextTargets` (and they become the habit's `targets`), then clears `nextTargets`. `{ "targets": null, "from": "next-sheet" }` clears it (Undo). This is also what the AI helper's habit suggestions use: the user confirms the proposed numbers in the tracker, and they apply from the next sheet by default.

Levels: `0` missed · `1` min · `2` ok · `3` ideal · `null` not logged yet (future days of the current sheet).

`color` is optional. Without it each habit gets a fixed color from its id. You could save the color in Create a habit later.

### Matching .NET records

```csharp
public record TargetsDto(decimal Min, decimal Ok, decimal Ideal);
public record NoteDto(string Text, string Color);
public record LastSheetDto(Guid Id, DateOnly StartDate, DateOnly EndDate, List<int?> Days);

public record HabitSummaryDto(
    Guid Id, string Name, string Unit, string? Color, TargetsDto Targets, int LengthDays,
    List<string> Reasons, List<NoteDto> Notes, DateOnly CreatedAt, int SheetsCount, LastSheetDto? LastSheet,
    TargetsDto? NextTargets); // targets saved "from the next sheet"; null when none

public record SheetDayDto(DateOnly Date, int? Level);
public record TargetsChangeDto(DateOnly From, TargetsDto Targets);
public record SheetDto(Guid Id, DateOnly StartDate, DateOnly EndDate, TargetsDto Targets, List<TargetsChangeDto> TargetsHistory, List<SheetDayDto> Days, string? Note);

public record HabitDetailDto(
    Guid Id, string Name, string Unit, string? Color, TargetsDto Targets, int LengthDays,
    List<string> Reasons, List<NoteDto> Notes, DateOnly CreatedAt, int SheetsCount, List<SheetDto> Sheets,
    TargetsDto? NextTargets);

// PUT /api/habits/{id}/targets. From is a date ("from today") or the string "next-sheet".
public record TargetsUpdateDto(TargetsDto? Targets, string From);

// sheets newest first:
// Sheets = habit.Sheets.OrderByDescending(s => s.StartDate).Select(...).ToList()
```

Search and sorting happen in the browser, which is fine for a personal list. If the list grows, pass the text as `GET /api/habits?q=med` and filter on the server instead.

## Components

| Component | What it does |
| --- | --- |
| `HabitBoard` | Screen 1: search, sort chips, count, the post-it grid, empty and no-match states. |
| `HabitNote` | One post-it: name, targets, mini strip, "x/7 days ≥ min", sheet count, delete with confirmation, paper note. |
| `SearchField` | Pill search box with a clear button (Escape clears too). |
| `MiniWeek` | Tiny bars for one sheet (one per day). |
| `HabitDetail` | Screen 2: header, reasons, notes, "All sheets", grouped by month and newest first, with Open all / Close all. |
| `HabitSheet` | One sheet: date range, targets, Current badge, days ≥ min, open/close. |
| `SheetRow` | One read-only day (weekday, date, bar, level). |

Helpers: `sortSheetsDesc`, `sheetSummary`, `formatRange`, `habitColor`.

## Change it

Edit `src/habits.jsx`, then from the project root run `node modules/habits/build.mjs`.
