# HandTitle

Sniglet display titles with the mustard brush underline from the source deck.

- Props: `as` (heading tag, default 'h2'), `size` ('xl' | 'lg' | 'md'), `underline` ('mustard' | 'blush' | 'none'), `accent` (trailing words in `rose`), children.
- One `xl` per screen (login hero, Home greeting). Page titles are `lg`. Card titles are `md` with `underline="none"`.
- The accent word is `rose`, which only passes contrast at 24px and up, so keep accent on `lg`/`xl` titles.
