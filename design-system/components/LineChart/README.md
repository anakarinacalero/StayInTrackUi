# LineChart

A single-series line over ordered steps (sessions, days, weeks): 2px `rose` line, a 10% wash under it, 10px dots ringed in the page color.

- Props: `title`, `data` ([{label, value}]), `max`, `unit`, `labelHead`.
- Only the last value is labeled; a crosshair and tooltip give the rest, and "Show table" lists them all.
- One series only. Two measures make two charts.
