# NavBar

The app's top bar: logo, planner-style pill tabs (Home, Suggestions, Tools ▾, AI helper ▾) and the user.

- **Tools** holds Distractors, Minimal tracker and Catch a wish. **AI helper** (with the mustard sparkle) holds Ask the helper (plan your day, ask about your journal) and Weekly summary (Overview, Distractions and Habits tabs). The rest of the helper lives inside the tools. Each item has a one-line note. Menus close on outside click and Escape; only one is open at a time.
- Props: `active` ('home' | 'suggestions' | 'distractors' | 'tracker' | 'wish' | 'helper' | 'summary'), `onNavigate(id)`, `user` (display name), `defaultOpen` (true or 'tools' | 'ai'), `hideMenus` (menu keys to leave out, e.g. `['ai']`).
- The active tab is filled `ink` with `on-ink` text; when a tool or AI module is open, its menu tab is the filled one.
