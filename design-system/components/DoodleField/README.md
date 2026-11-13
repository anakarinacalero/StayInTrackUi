# DoodleField

A background layer that scatters doodles deterministically behind its children.

- Props: `seed` (number, same seed = same layout), `count` (8–18 reads right; more is confetti), `kinds` (array of Doodle kinds), `style`, `className`, children.
- The consumer gives it a size (height or a flex/grid cell). Doodles never catch clicks.
- Use one field per screen, behind the main content. Do not nest fields.
