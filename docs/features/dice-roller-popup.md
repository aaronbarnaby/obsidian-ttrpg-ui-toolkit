# Dice Roller Ribbon Menu Popup

The Dice Roller is a floating popup that lets you build and roll dice expressions and Duality Dice (Daggerheart-style) from the ribbon or command palette.

## Opening the Dice Roller

- **Ribbon:** Click the pocket-knife icon in the left sidebar (title: "TTRPG UI Toolkit"). A menu appears; choose **Dice Roller** (dice icon).
- **Command palette:** Run **Open Dice Roller** from the command palette (`Ctrl/Cmd + P`).

## UI Behavior

- The Dice Roller opens as a **floating, draggable window**. Drag it by the header bar to move it.
- Close it with the **✖** button in the header.

## Standard Dice

- **Roll count:** Use the number input to set how many of the next die to add (e.g. `2` then d6 → `2d6`).
- **Dice buttons:** Click **d4**, **d6**, **d8**, **d10**, **d12**, **d20**, or **d100** to add that die (or that many, using the roll count) to the queue.
- **Queue:** Each added expression appears in the queue (e.g. `2d6`, `1d8`). Remove an entry with its **x** button.
- **Roll:** Click **Roll** to roll the full queue (e.g. `2d6 + 1d8`). A toast shows the result and the roll is appended to the roll log.

## Duality Dice

- Click **Roll Duality Dice** to roll **Daggerheart-style Duality Dice**: two d12s (Hope and Fear).
- The result shows the total and the **fate**: **Hope** (hope die higher), **Fear** (fear die higher), or **Crit** (both dice equal).
- The roll is also added to the roll log.

## Roll Log

- Rolls appear in the **roll log** below the queue.
- Use **Clear Log** to clear the history.
