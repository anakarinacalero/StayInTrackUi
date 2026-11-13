# StayInTrackApp — design system

A web journal for organizing your life, in the style of a paper planner: cream pages, dash grid, a black polka-dot cover, blush and mustard doodles, sticky notes and handwriting.

## Open it

Open `preview/index.html` in a browser: the app flow. It links the 12 screens the way the app works (Login, Home, Suggestions, the Tools with the tracker's habit screens, and the two AI helper screens: Ask the helper and Weekly summary), and every screen has an **App flow** pill to come back. Each page has a **Dark mode** switch in the bottom-right corner.

Everything runs offline (React is in `preview/vendor/`) except the fonts, which load from Google Fonts; without internet the pages fall back to system fonts.

## What's inside

```
design-system/
  README.md            brand book: voice, color, type, layout, doodles, AI helper rules and data contract
  tokens.json          all tokens (colors for light + dark, type, spacing, radius, shadows)
  tokens.css           the same tokens as CSS custom properties, plus a class per type style
  components/
    bundle.js          every component as one script: window.StayInTrack.<Component> (needs React 18 globals)
    bundle.css         component styles (uses only the CSS variables from tokens.css)
    index.d.ts         props for every component
    src/index.jsx      component source
    <Component>/       README.md (usage rules) and preview.html (live example card)
preview/
  index.html           the app flow (the only index)
  screens/             the 12 screens, the single source of the UI
  flow.js, ai-demo.js  navigation and the demo data shared by Home, the tracker and the AI helper
  vendor/              React 18.3.1
scripts/build.mjs      rebuilds bundle.js from src/index.jsx
```

## Use the components in a page

```html
<link rel="stylesheet" href="design-system/tokens.css">
<link rel="stylesheet" href="design-system/components/bundle.css">
<script src="react.production.min.js"></script>
<script src="react-dom.production.min.js"></script>
<script src="design-system/components/bundle.js"></script>
<script>
  const { NavBar, JournalPage, CheckItem } = window.StayInTrack;
  const h = React.createElement;
  ReactDOM.createRoot(document.getElementById("root")).render(
    h("div", { className: "sit-root" },
      h(NavBar, { active: "home", user: "Ana" }),
      h(JournalPage, { title: "Today" }, h(CheckItem, { priority: "high" }, "Pay the bill")))
  );
</script>
```

Set `data-theme="dark"` on `<html>` for the Night cover theme.

## Change the components

```
npm install
npm run build
```

Edit `design-system/components/src/index.jsx`, run the build, and reload any screen.

## Notes

- The AI helper screens use scripted replies built from the same demo data as the tools (`modules/habits/sample-data.js` plus `preview/ai-demo.js` for tasks and what the helper can see). The data each module needs and returns is in `design-system/README.md` under **AI helper**.
- The logo is a draft mark made for this project.
- Fonts: Sniglet, Caveat and Hind (Google Fonts, Open Font License).
