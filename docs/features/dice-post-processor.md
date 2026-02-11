# Dice Roller Post Processor (Inline Dice)

The plugin registers a **markdown post-processor** that turns inline `code` in the editor and preview into clickable dice widgets. You write the syntax inside normal paragraphs or lists—no separate code block is required.

## Standard Dice Syntax

Inside a `code` span, use:

```
dice: <expression>
```

**Expression format:**

- `XdY` — e.g. `2d6`, `1d20`, `3d8`
- Optional modifiers with `+`: numbers or more dice, e.g. `2d6+3`, `1d20+1d6+2`

The grammar matches the dice engine: each part is either `(\d*)d(\d+)` (count and sides) or a plain number. Count defaults to 1 when omitted (e.g. `d20` = `1d20`).

**Example:** `` `dice: 2d6+3` `` renders as a clickable widget showing `(2d6+3)`. On click it rolls, shows a toast with the result, and updates the inline result.

## Duality Dice Syntax

Inside a `code` span, use:

```
duality:
duality: +2
duality: 2+3
```

- **No modifiers:** `duality:` — total is Hope die + Fear die.
- **With modifiers:** After the colon, list numbers separated by `+` (e.g. `+2` or `2+3`). They are summed and added to the Hope+Fear total.

The widget displays something like `(Duality)` or `(Duality +5)`. On click it rolls **two d12** (Hope and Fear), shows the total and **fate** (Hope | Fear | Crit), and a toast. **Crit** occurs when both d12 show the same value.

This is intended for **Daggerheart**-style resolution.

## Settings

- **Dice Result Duration** (in plugin settings): Length of time in milliseconds that the result toast is shown. This applies to both the Dice Roller popup and inline dice widgets.
