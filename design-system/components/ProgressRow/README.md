# ProgressRow

A labeled meter for "x of y" completion, used in AI answers and summaries.

- Props: `label`, `value`, `total`, `unit` (default 'days'), `icon` (only when the icon names the thing, like a phone for social media; otherwise leave it out).
- The track is `blush-soft`, the fill `rose`. The written "6 of 20 days" always sits beside the meter, so it never relies on the bar alone.
