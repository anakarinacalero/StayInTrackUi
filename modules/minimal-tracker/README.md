# Minimal tracker module · v1

**Create a habit** and the **motivation board**: sticky notes with phrases the user writes to read on hard days.

## Install

Unzip at the project root. It adds only these files and changes nothing you already have:

```
modules/minimal-tracker/
  minimal-tracker.js       the components (adds them to window.StayInTrack)
  minimal-tracker.css      their styles
  minimal-tracker.d.ts     props and the payload type
  src/minimal-tracker.jsx  source
  build.mjs                rebuilds minimal-tracker.js from src
preview/screens/create-habit.html   the screen, ready to open
```

Load the module **after** the design system:

```html
<link rel="stylesheet" href="design-system/tokens.css">
<link rel="stylesheet" href="design-system/components/bundle.css">
<link rel="stylesheet" href="modules/minimal-tracker/minimal-tracker.css">

<script src="react.production.min.js"></script>
<script src="react-dom.production.min.js"></script>
<script src="design-system/components/bundle.js"></script>
<script src="modules/minimal-tracker/minimal-tracker.js"></script>
```

## Use it

```js
const { CreateHabitForm } = window.StayInTrack;

ReactDOM.createRoot(document.getElementById("habit")).render(
  React.createElement(CreateHabitForm, {
    onSubmit: async (habit) => {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });
      if (!res.ok) throw new Error("Could not save the habit");
    },
    onCancel: () => history.back(),
  })
);
```

`onSubmit` can return a promise: the button shows "Saving…" until it settles. Only the **Create habit** button submits. Enter in a field and the other buttons inside the form never do.

## What `onSubmit` receives

```json
{
  "name": "Read",
  "startDate": "2026-11-11",
  "lengthDays": 14,
  "unit": "pages",
  "targets": { "min": 2, "ok": 10, "ideal": 20 },
  "reasons": ["Learn something every day", "Sleep better"],
  "reminderTime": null,
  "notes": [
    { "text": "Progress, not perfection.", "color": "sky" },
    { "text": "Read one page, that is enough.", "color": "sage" }
  ]
}
```

The form already checks that there is a name, that the start date is today or later, that all three targets are numbers above 0 and that min < ok < ideal. Validate again on the server.

### Matching .NET request

```csharp
public record HabitTargets(decimal Min, decimal Ok, decimal Ideal);
public record MotivationNoteDto(string Text, string Color); // butter | rose | sky | sage

public record CreateHabitRequest(
    string Name,              // 1–40 chars
    DateOnly StartDate,
    int LengthDays,           // 7, 14 or 30
    string Unit,              // min | pages | glasses | times | steps | km
    HabitTargets Targets,     // Min < Ok < Ideal, all > 0
    List<string> Reasons,     // up to 3, each up to 80 chars
    TimeOnly? ReminderTime,
    List<MotivationNoteDto> Notes); // up to 8, each up to 120 chars
```

## Components

| Component | What it does |
| --- | --- |
| `CreateHabitForm` | The whole module: four steps (name, targets, why, when) beside the motivation board, plus Cancel / Create habit. Props: `onSubmit`, `onCancel`, `initial`, `submitLabel`. |
| `MotivationBoard` | Grid of editable sticky notes with "Add a note" and "Inspire me" (adds an unused phrase). Props: `notes`, `onChange`, `max` (8), `phrases`, `title`, `subtitle`. Use it on its own on the tracker page too. |
| `MotivationNote` | One editable note: text (up to 120 characters), 4 colors, delete. |
| `TargetFields` | Unit + min / ok / ideal fields with the min < ok < ideal check. |
| `TargetPreview` | A sample tracker row with the targets written above the bar. |
| `ReasonList` | Up to 3 "why it matters" lines, add and remove. |
| `ChipGroup` | Single-choice chip row (used for 7 / 14 / 30 days). |

Helpers on `window.StayInTrack`: `buildHabitPayload`, `targetsError`, `MOTIVATION_PHRASES`, `NOTE_COLORS`, `HABIT_UNITS`.

## Change it

Edit `src/minimal-tracker.jsx`, then from the project root:

```
node modules/minimal-tracker/build.mjs
```

It uses the same esbuild already in `package.json`.

## Note

Inside a `<form>`, the core `HabitRow` and `PromptChip` buttons act as submit buttons, so this module doesn't use them there (it has `TargetPreview` and its own "Inspire me"). Outside forms they work as before.
