# Codeblock Views

The plugin registers **markdown code block processors** for several view types.

---

## Badges

Renders a row of label/value badges. Good for AC, speed, initiative, or other short stats.

### Usage

Use a fenced code block with language `badges`:

````md
```badges
items:
  - label: AC
    value: 16
  - label: Speed
    value: 30 ft
  - label: Init
    value: "+2"
dense: false
```
````

### YAML schema

| Key    | Type   | Required | Description |
|--------|--------|----------|-------------|
| `items` | array  | Yes      | List of `{ label: string, value: string \| number }`. |
| `dense` | boolean | No     | Tighter layout. Default: false. |

### Templates

- **label** and **value** support **Handlebars** templates.
- Context: `frontmatter` (note frontmatter) and `abilities` (parsed ability modifiers from an `ability` block in the document).
- Example: <code>value: "&#123;&#123;add frontmatter.base_ac 2&#125;&#125;"</code> (uses the plugin’s `add` helper).
- The block re-renders when frontmatter or abilities change (e.g. after editing the `ability` block).

---

## Stats

Same data shape as badges but rendered as **cards** with optional grid and optional **sublabel** per item.

### Usage

````md
```stats
items:
  - label: AC
    sublabel: With shield
    value: 18
  - label: Speed
    value: 30
dense: false
grid:
  columns: 2
```
````

### YAML schema

| Key    | Type   | Required | Description |
|--------|--------|----------|-------------|
| `items` | array  | Yes      | List of `{ label, value, sublabel? }`. `sublabel` is optional. |
| `dense` | boolean | No     | Tighter layout. |
| `grid.columns` | number | No | Number of columns. Default: 1. |

### Templates

Same as **badges**: Handlebars in `label`, `value`, and `sublabel` with `frontmatter` and `abilities`; re-renders on frontmatter/ability change.

---

## Ability

Renders **ability score cards** for either **D&D 5e** or **Daggerheart**. D&D shows modifiers and saving throws; Daggerheart shows modifiers and a short skill list per ability.

### Usage

**D&D 5e:**

````md
```ability
type: dnd
abilities:
  strength: 14
  dexterity: 12
  constitution: 10
  intelligence: 8
  wisdom: 13
  charisma: 10
proficiencies:
  - strength
  - wisdom
bonuses:
  - name: Ring
    target: constitution
    value: 1
    modifies: saving_throw
```
````

**Daggerheart:**

````md
```ability
type: daggerheart
abilities:
  Agility: 1
  Strength: 0
  Finesse: 2
  Instinct: -1
  Presence: 1
  Knowledge: 0
bonuses:
  Agility: 1
```
````

### YAML schema (D&D 5e)

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `type` | string | Yes | Must be `dnd`. |
| `abilities` | object | Yes | Keys: `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`. Values: number (base score). |
| `proficiencies` | string[] | No | Ability names that have saving throw proficiency. |
| `bonuses` | array | No | `{ name?, target, value, modifies? }`. `target` is ability name. `modifies`: `saving_throw` (default) or `score`. |

D&D view uses note **frontmatter** `proficiency_bonus` for saving throws.

### YAML schema (Daggerheart)

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `type` | string | Yes | Must be `daggerheart`. |
| `abilities` | object | Yes | Keys: `Agility`, `Strength`, `Finesse`, `Instinct`, `Presence`, `Knowledge`. Values: modifier number. |
| `bonuses` | object or array | No | Additional modifiers (same ability names); merged with `abilities`. |

Parsing and modifiers: `lib/domains/abilities.ts`.

---

## Skills

Renders a **skills grid** with ability abbreviation and modifier per skill. **D&D 5e only.**

### Dependencies

- **Requires** an `ability` code block in the **same document**. The skills view reads ability scores and bonuses from that block. If no `ability` block is found, the view shows an error.

### Usage

Place a `skills` block in the same note as an `ability` block (language `ability`). Example:

````md
```skills
proficiencies:
  - Perception
  - Stealth
  - Athletics
expertise:
  - Stealth
half_proficiencies:
  - Survival
bonuses:
  - target: Perception
    value: 2
```
````

### YAML schema

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `proficiencies` | string[] | No | Skill names that are proficient. |
| `expertise` | string[] | No | Skill names with expertise (double proficiency). |
| `half_proficiencies` | string[] | No | Skill names with half proficiency. |
| `bonuses` | array | No | `{ target: skill name, value: number }` per-skill bonus. |

Skill names must match the built-in list (e.g. Acrobatics, Animal Handling, Arcana, Athletics, Deception, History, Insight, Intimidation, Investigation, Medicine, Nature, Perception, Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival). See `lib/domains/skills.ts`.

---

## Vitals

Renders **interactive vitals** for **D&D 5e** (HP, temp HP, hit dice, death saves) or **Daggerheart** (HP/stress/armor/evasion blocks, hope). State is persisted in a JSON file (path set in plugin settings).

### Usage

**D&D 5e:**

````md
```vitals
type: dnd
hp: 32
hitdice:
  - dice: d8
    value: 4
  - dice: d6
    value: 2
death_saves: true
hide_actions: false
```
````

**Daggerheart:**

````md
```vitals
type: daggerheart
hp: 5
stress: 6
armor: 3
evasion: 10
thresholds: [4, 10]
```
````

### YAML schema (D&D 5e)

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `type` | string | Yes | Must be `dnd`. |
| `hp` | number or string | Yes | Max HP. Can be a template string (e.g. <code>"&#123;&#123;frontmatter.max_hp&#125;&#125;"</code>). |
| `hitdice` | array or single | Yes | `{ dice: string, value: number }` (e.g. `d8`, `d6`). Can be one object or list; merged by dice type. |
| `death_saves` | boolean | No | Show death save track. |
| `hide_actions` | boolean | No | Hide action buttons. |

### YAML schema (Daggerheart)

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `type` | string | Yes | Must be `daggerheart`. |
| `hp` | number or string | Yes | Number of HP blocks. |
| `stress` | number or string | No | Stress blocks. Default 6. |
| `armor` | number or string | No | Armor blocks. Default 3. |
| `evasion` | number or string | No | Evasion value. Default 10. |
| `thresholds` | [number, number] or string | No | Low/high thresholds. Default `[4, 10]`. |

### Templates

Numeric fields (`hp`, and for Daggerheart `stress`, `armor`, `evasion`, `thresholds`) can be Handlebars template strings so they resolve from frontmatter or abilities (e.g. <code>hp: "&#123;&#123;frontmatter.max_hp&#125;&#125;"</code>). The vitals block re-renders on frontmatter/ability change when templates are used.

### State and settings

- **State file path** (plugin settings): Relative path from vault root for the JSON file that stores vitals state (HP, hit dice used, death saves, Daggerheart blocks, hope). Same store is used for all vitals in the vault.
