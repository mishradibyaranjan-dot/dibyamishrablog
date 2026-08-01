# Theme token palette

Every colour in the UI comes from a semantic token. Tokens are declared once in
`src/styles.css` and remapped per theme, so a component written against tokens is
automatically correct on all 10 themes (6 dark, 4 light) with no extra work.

Never write palette utilities (`text-white`, `bg-slate-50`, `border-blue-200`,
`bg-[#0f172a]`) in components — they ignore the active theme and are the usual
cause of invisible text on light palettes. `bun run theme:lint` enforces this.

## Switching themes

The header exposes two controls, both persisted in `localStorage` under
`drm-theme`:

- **Light/Dark button** — one-click flip between the default dark and light theme.
- **Palette button** — full picker grouped into dark and light themes with swatches.

The saved theme is applied by an inline bootstrap script in
`src/routes/__root.tsx` before first paint, so there is no flash of the wrong
theme on reload.

## Token reference

### Surfaces and text

| Token | Utility examples | Use for |
| --- | --- | --- |
| `background` / `foreground` | `bg-background`, `text-foreground` | page base + primary text |
| `card` / `card-foreground` | `bg-card`, `text-card-foreground` | panels, cards, glass surfaces |
| `popover` / `popover-foreground` | `bg-popover`, `text-popover-foreground` | menus, dialogs, chat panel |
| `muted` / `muted-foreground` | `bg-muted/40`, `text-muted-foreground` | secondary surfaces + secondary text |
| `accent` / `accent-foreground` | `bg-accent` | hover states |
| `primary` / `primary-foreground` | `bg-primary text-primary-foreground` | primary buttons, links, emphasis |
| `secondary` / `secondary-foreground` | `bg-secondary` | secondary buttons |
| `destructive` / `destructive-foreground` | `bg-destructive` | destructive actions |

### Inputs

| Token | Utility examples | Use for |
| --- | --- | --- |
| `input` | `border-input`, `bg-input` | field borders/fills |
| `ring` | `ring-ring`, `focus-visible:ring-ring` | focus rings |

Standard field recipe:

```tsx
<input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
```

### Chips and badges

| Token | Utility examples |
| --- | --- |
| `chip` | `bg-chip` |
| `chip-foreground` | `text-chip-foreground` |
| `chip-border` | `border-chip-border` |

```tsx
<span className="rounded-full border border-chip-border bg-chip px-3 py-1 text-xs text-chip-foreground">
  Agentic AI
</span>
```

### Status / topic accents

Five fixed hues, each with a base colour, a `-soft` surface (mixed against the
active theme's `--card`) and a `-border`. Labels on soft surfaces use
`text-foreground`, which keeps contrast correct in both light and dark.

| Family | Meaning | Utilities |
| --- | --- | --- |
| `info` | neutral/informational nodes, diagrams | `bg-info-soft border-info-border text-foreground`, `text-info`, `from-info/25` |
| `success` | completed, healthy, positive delta | `bg-success-soft border-success-border`, `text-success` |
| `warning` | caution, pending, WIP limits | `bg-warning-soft border-warning-border` |
| `danger` | failures, blocked, rejected | `bg-danger-soft border-danger-border` |
| `special` | highlight/secondary topic accent | `bg-special-soft border-special-border` |

### Gradients and effects

CSS variables, applied through utilities defined in `src/styles.css`:

| Variable | Utility |
| --- | --- |
| `--gradient-hero` | `bg-hero` |
| `--gradient-brand` | `bg-brand-gradient` (forces white label text) |
| `--gradient-text` | `text-gradient` |
| `--gradient-aurora` | `bg-aurora` |
| `--shadow-glow` / `--shadow-neon` / `--shadow-card` | `shadow-glow`, `shadow-neon`, `shadow-card-soft` |

For ad-hoc gradients, compose from tokens: `bg-gradient-to-br from-primary/15 via-card to-info/10`.

## Automated checks

```bash
bun run theme:lint         # fails on hardcoded colors in guarded paths
bun run theme:lint:report  # informational count of legacy colors across src/
bun run test               # includes theme-tokens.test.ts
```

Guarded paths (must stay 100% token-based) live in `GUARDED` inside
`scripts/theme-token-lint.mjs`: `src/routes/learn.tsx`, `src/components/learn`,
`src/components/chat`, `src/components/theme`. Add paths to this list as they are
migrated — CI (`.github/workflows/security-scan.yml`) runs the lint on every PR,
so a regression blocks the merge.

A genuinely intentional literal colour (e.g. a brand logo swatch) can be allowed
with a `theme-lint-allow` comment on the same line.
