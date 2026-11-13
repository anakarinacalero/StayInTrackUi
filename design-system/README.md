StayInTrackApp is a web journal for people who struggle to keep home, work and to-dos in order. It should feel like opening a paper planner: cream pages, a pale dash grid, a black polka-dot cover, blush and mustard doodles, sticky notes and handwriting. The content comes from the talk *¿Cómo organizo mi vida?*: its suggestions, its distractor exercise, the minimal tracker and *catch a wish*.

## Product map

- **Login**: the black notebook cover on the left, the hero question and a dot-grid sign-in page on the right.
- **Home**: today's tasks by priority, the habit of the week, caught wishes, the tip of the day and shortcuts to the tools.
- **Suggestions**: the eight tips as numbered blobs the user can add to their routine.
- **Tools** (a dropdown in the nav bar):
  - **Distractors**: list external and internal distractors, answer *Can I control it?* and *Is it a priority?* for each.
  - **Minimal tracker**: one habit, min / ok / ideal targets, seven days of bars, and *why it matters to me*.
  - **Catch a wish**: write the urge down, choose when to check it, keep caught wishes on a sticky-note board.
- **AI helper** (a second dropdown, marked with the sparkle):
  - **Plan with AI**: chat about today's tasks and energy; the helper suggests the next step and splits big tasks into small ones.
  - **Weekly summary**: stat tiles, habits completed per day, and two insights.
  - **Distraction patterns**: how often a distractor shows up across focus sessions, and a focus strategy to try.
  - **Habit suggestions**: which tracker target the user really keeps, and a proposal to keep or adjust it.
  - **Ask your data**: free questions about the journal, answered in a sentence plus a table or chart.

Build every screen like the ones in `preview/screens/`: `NavBar` on top (except Login), one `DoodleField` behind the content, content centered at 1180px max with `space-6` side padding.

## Voice and content

- Warm, short and on the reader's side. Second person ("you"), with "we/us" for encouragement: *We're on this road together.*
- Sentence case everywhere. Titles may be questions: *How do I organize my life?*
- Name the struggle without judgment, with a bit of humor: *Remembering to water your plants after they already died.*
- Buttons are verb first, two or three words: *Log in*, *Catch it*, *Add to list*.
- Small wins get praise: *Pat on the back. Good work today!* Never shame a missed day; the minimum counts.
- No emoji. Use the doodles for decoration and `✓` only in state text ("✓ In my routine").
- The UI is written in English; the tool names keep the source's spirit (Catch a wish = *Atrapa un deseo*, Minimal tracker = *Tracker mínimo*).

## Color

- The ground is `paper` (cream). Content sits on `paper-raised` journal pages and cards; wells and empty bars use `paper-sunk`.
- Text is `ink`; secondary text is `ink-muted`. Both pass 4.5:1 on all three paper tokens in both themes.
- `blush` and `mustard` are the signature pair. Use them as fills (doodles, underlines, tracker bars, soft buttons), never as small text. Put `ink`/`on-sticky` text on them.
- For pink or mustard words use `rose` / `ochre` at 24px and up (titles, numerals) and `rose-text` / `ochre-text` below 24px.
- `teal` is for links and the focus ring only.
- `cover`, `ivory` and `gold` belong to the black notebook cover (login panel, cover-tone cards). Do not use gold elsewhere.
- Sticky notes use `sticky-butter`, `sticky-rose`, `sticky-sky`, `sticky-sage` with `on-sticky` text. Vary them across a board.
- Status is never color alone: Yes/No chips, outcome badges and check marks always carry a word or a ✓; `done` text is green-dark on light and light green on dark, paired with its word.
- Two themes: **Paper** (light, default) and **Night cover** (dark, the black notebook). Every token has a value in both.

## Type

- **Sniglet** (display, regular 400) for titles, numerals and big quotes. Styles: `display-xl` (one per screen), `display-lg` (page titles), `title` (cards), `numeral` (tip numbers).
- **Caveat** (script) for anything the user *writes*: habit names, wishes, sticky notes, distractor items, page headings like *Welcome back* (`script-lg`, `script`).
- **Hind** (body) for interface text: `body-lg` intros, `body`, `body-sm` hints, `label` uppercase eyebrows.
- Load from Google Fonts: `Sniglet:wght@400;800`, `Caveat:wght@400..700`, `Hind:wght@400;500;600` (bundle.css imports them). The logo wordmark is the only place Sniglet 800 appears.
- Put the mustard brush underline (`HandTitle`) under page titles, the blush one under section titles.

## Surfaces, spacing and shape

- `JournalPage` is the main container: `paper-raised`, `radius-lg`, `shadow-page`, with `dash` grid for tools, `dot` for forms, `lined` for writing. Disc binding on the left of the primary page.
- `ScallopCard` (scallop radius `scallop`) for summary tiles and shortcuts. `Blob` for a quote or a single message.
- Pitch: align handwritten rows to `grid-pitch` (20px). Spacing steps `space-1`…`space-8`; card padding `space-5`, page padding `space-6`, sections `space-7`.
- Radii: `radius-md` for inputs and buttons' boxes, `radius-pill` for buttons, tabs, bars and chips, `radius-lg` for pages.
- Shadows are soft and warm: `shadow-page`, `shadow-sticky` for notes, `shadow-pop` for the Tools dropdown. No hard drop shadows.

## Doodles and imagery

- Decoration comes only from `Doodle`: outline clouds, six-petal flowers with a dark center, plus marks, dots, rings and squiggles in `ink`, `blush`, `mustard`, `tan`.
- Use one `DoodleField` per screen; it keeps doodles to the side margins so they never sit under text. 8–18 doodles.
- No stock photos, no third-party logos. Illustrations, if added later, should be flat line drawings in `ink` with `blush`/`mustard` fills, like the source deck.

## Navigation

- `NavBar`: logo, then pill tabs **Home**, **Suggestions**, **Tools ▾**, **AI helper ▾**, then the user's initial and name. The active tab is filled `ink`.
- **Tools** opens a panel with Distractors, Minimal tracker and Catch a wish; **AI helper** opens Plan with AI, Weekly summary, Distraction patterns, Habit suggestions and Ask your data. Each item has a one-line note; when any of them is open, its menu tab is the active one. Only one menu is open at a time.

## AI helper

**Voice.** The helper talks like a kind friend who has read your journal: one or two short sentences, then at most one list or one table/chart. It quotes the user's own numbers ("6 of 20 planned days"), suggests exactly one next step, and never shames ("the minimum counts"). It says "may" when it infers ("It may be interrupting your focus"). No emoji.

**Look.**
- The **sparkle** doodle marks everything AI: the nav tab, the helper's avatar, suggested steps, prompt chips. Do not use it for anything else.
- Helper messages sit on `sticky-sky` notes at the left (`ChatMessage`), the user's on `blush-soft` bubbles at the right. While waiting, show `Thinking` inside the helper bubble.
- Lead insight screens with one `InsightCard`: `rose` = a problem pattern, `sage` = something working, `butter` = a neutral observation, `sky` = a question back to the user.
- Numbers go in `StatTile` (Hind semibold, never the display face). Completion lists use `ProgressRow`. Charts are `BarChart` / `LineChart`: one series, `rose`/`blush` only, 1px gridlines, hover tooltips, a "Show table" switch. Put charts on `pattern="blank"` pages so the dash grid doesn't fight the gridlines.
- End every conversation column with two or three `PromptChip`s and a `ChatComposer`.
- Show users what the helper can see (the "What the helper can see" card) on any screen where they type free questions.

**What each module reads and returns.** Use this as the contract when you wire the screens to a model.

The menu has two entries: **Ask the helper** (one chat for planning and questions) and **Weekly summary** (tabs Overview, Distractions, Habits). Habit suggestions also show up in the Minimal tracker when a sheet ends. Each answer reads only the sources the user left on in "What the helper can see" (tasks, habits, distractors, wishes); if a source is off, the helper says so instead of guessing.

| Module | Where | Reads | Returns |
| --- | --- | --- | --- |
| Helper · plan | Ask the helper | today's tasks (title, priority, done, minutes), energy (Low/Ok/High), the message | a short reply, one next step `{taskId, step?, minutes}`, optional breakdown `[{step, minutes}]`, 2 follow-up prompts |
| Helper · ask | Ask the helper | the question plus the sources the user allows | answer sentence, optional `{table rows}` or `{chart series}`, optional link to the screen that already answers it, 2 follow-up prompts |
| Weekly summary | Weekly summary · Overview | habit logs, tasks done/planned, focus sessions, caught wishes for the range (week or 30 days) | stat values, per-day (or per-week) counts, 2 insights `{icon, tone, title, text}` |
| Distraction patterns | Weekly summary · Distractions | distractor tags per focus session, session lengths | top distractor, counts per session, 1–3 insights, 3 strategies |
| Habit suggestions | Weekly summary · Habits, Minimal tracker (sheet ended) | the current sheet's days with level (0–3) and targets, or the last sheet if the current one has fewer than 4 days | per habit: min/ideal day counts and one proposal `{keep}` or `{targets, from: "next-sheet"}` |

Every helper answer that changes data (keep a goal, apply a suggestion, start a strategy, cross out a task) waits for the user's button press: the helper proposes, the user decides. Proposed targets are confirmed in the tracker's own editor and apply from the next sheet by default, so a running sheet is never cut by a suggestion.

## Interaction and accessibility

- Focus ring: 3px solid `teal`, 2px offset, on every control (7:1 on paper).
- Tracker bars are radio groups; sticky-note actions and chips are real buttons; labels are always visible above fields, never placeholder-only.
- Motion is small: 120–200ms for tab and bar fills. No bouncing, no confetti.
- Under 720px: stack columns, keep the nav as logo + Tools menu + avatar, and keep 16px side gutters.

## Iconography

- No icon font. Glyphs are the doodles plus `✓`, `+` and the nav caret, drawn inline as SVG with `stroke` in the current text color.
- A small icon set lives in `Doodle`, drawn in the same rounded 2.8px hand: sparkle (AI only), bulb, phone, target, chart, calendar, send, sprout. Use one only when it names the thing (a phone for social media); otherwise leave the icon out.
- The logo is an original draft mark (flower doodle + Sniglet wordmark) designed for this system; replace it if a final logo is made.
