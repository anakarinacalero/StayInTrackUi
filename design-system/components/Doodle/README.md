# Doodle

The hand-drawn marks scattered over every page (cloud, flower, plus, dot, rings, squiggle) and the small icon set drawn in the same hand (sparkle, bulb, phone, target, chart, calendar, send, sprout).

- Props: `kind` ('cloud' | 'flower' | 'plus' | 'dot' | 'rings' | 'squiggle' | 'sparkle' | 'bulb' | 'phone' | 'target' | 'chart' | 'calendar' | 'send' | 'sprout'), `tone` ('ink' | 'blush' | 'mustard' | 'tan' | 'gold' | 'rose' | 'onsticky' | 'onink'), `size` in px, `style`.
- The **sparkle** marks anything the AI helper does; use it nowhere else. The other icons label insight cards, stat tiles and menu items.
- Clouds are always ink outline with a `paper-raised` fill. Flowers are `mustard` or `blush` with an ink center. Plus marks are `ink`, `tan` or `blush`.
- Doodles are decoration (`aria-hidden`). Never use one as the only signal of meaning; use a word or `Badge` for state.
- Keep them at the edges of a layout and away from text. To scatter many at once use `DoodleField`.
