# BarChart

A single-series column chart with optional highlighted columns, for one value per day or per item.

- Props: `title`, `data` ([{label, value}]), `highlight` (labels drawn in `rose` with their value on the cap; the rest in `blush`), `max`, `unit`, `labelHead`.
- Highlight only what an insight card talks about. Columns are at most 24px wide with 4px rounded tops; gridlines are 1px `grid-line`.
- Hover or keyboard focus shows the value; "Show table" swaps in a table. Blush columns are below 3:1 contrast, so the table and tooltip are required.
