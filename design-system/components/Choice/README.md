# Choice

A yes/no question with two pill chips, used to sort distractors.

- Props: `question`, `value` (true | false | null), `onChange(boolean)`, `yes`/`no` labels.
- Yes fills `sticky-sage`, No fills `blush`; both keep their word, so the state never depends on hue.
