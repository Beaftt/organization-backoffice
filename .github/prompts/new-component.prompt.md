---
description: Scaffold a new shared UI primitive component in src/components/ui/ with design token usage, dark mode support, variants, and a test file.
name: new-component
argument-hint: '[ComponentName] - e.g., Modal, Avatar, Table, Toast'
agent: agent
---

Create a new shared UI primitive for the backoffice.

**Component name**: ${input:componentName:e.g., Modal, Avatar, Table}

## What to generate

### 1. Component — `src/components/ui/${input:componentName}.tsx`

Rules:
- Named export only — never `export default`.
- Extend the appropriate HTML element's attributes (`HTMLAttributes<HTMLDivElement>`, etc.).
- Accept `variant`, `className`, `children`, and `...props`.
- Merge `className` last so callers can override.
- Use `var(--token)` for all colors — never hardcode hex values.
- Must look correct in both light and `html[data-theme="dark"]` themes.
- Use semantic HTML (`<button>`, `<label>`, `<input>` where applicable).
- Add `aria-label` or visible label if the component is interactive.
- Under 200 lines.

Available design tokens:
```
var(--background)     var(--foreground)
var(--surface)        var(--surface-muted)
var(--border)         var(--sidebar)
var(--sidebar-text)   var(--sidebar-active)
```

Existing primitives (compose these, don't rebuild):
- `Button` (`primary | secondary | ghost`)
- `Card`, `Input`, `Badge`, `Skeleton`, `SectionHeader`

### 2. Test — `src/components/ui/__tests__/${input:componentName}.test.tsx`

Test scenarios:
1. Renders children / default state.
2. Each variant renders correctly.
3. `className` prop is applied.
4. User interactions (if interactive) — click, focus, keyboard.
5. Accessible role and label.
6. Loading/empty state (if applicable).

Test rules:
- `screen.getByRole` over `getByTestId`.
- `userEvent.setup()` for interactions.
- `vi.fn()` for mock handlers.
- Single quotes in TypeScript, double quotes in JSX.

## Rules

Read [copilot-instructions.md](../copilot-instructions.md) before generating.
- Import alias: `@/`.
- No hardcoded colors.
- One component per file.
