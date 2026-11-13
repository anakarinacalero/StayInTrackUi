# ChatMessage

One message in an AI conversation: the user's on a `blush-soft` bubble at the right with their initial, the helper's on a `sticky-sky` note at the left with the butter sparkle avatar.

- Props: `from` ('ai' | 'user'), `name` (user's name, for the initial), children (text, `<p>`, lists, or a `Thinking` while waiting).
- Helper replies stay short: one or two sentences, then at most one list. Put tables and charts in a card under the message, not inside the bubble.
- A screen-reader prefix ("StayInTrack helper:" / "You:") is built in.
