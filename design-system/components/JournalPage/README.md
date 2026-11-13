# JournalPage

The main content surface: a white journal sheet with a pale dash grid, dot grid or ruled lines, optional disc binding and an optional scalloped fore-edge.

- Props: `pattern` ('dash' | 'dot' | 'lined' | 'blank'), `binding` ('disc' | 'none'), `scallop` (boolean, right edge), `title` (written in the `script-lg` hand), children.
- Use `dash` for tools and data entry, `dot` for forms, `lined` for free writing (reasons, notes).
- One bound page per column; side-by-side pages drop the binding on the right one.
- Leave a `space-6` gutter between pages and the screen edge so the shadow and scallops breathe.
