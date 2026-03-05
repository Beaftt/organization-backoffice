---
applyTo: '**/components/ui/**/*.tsx'
---

# UI Component Rules

You are creating or editing a **shared UI primitive** in `src/components/ui/`.

## Structure

```tsx
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted';
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const styles =
    variant === 'muted'
      ? 'bg-[var(--surface-muted)]'
      : 'bg-[var(--surface)] border border-[var(--border)]';

  return (
    <div className={`rounded-xl p-4 ${styles} ${className}`} {...props}>
      {children}
    </div>
  );
}
```

## Mandatory rules

- **Never hardcode colors** — always use `var(--token)` CSS variables or Tailwind token classes.
- **Support dark mode** — test visually in both `html[data-theme="dark"]` and light.
- **Maximum 200 lines** — if growing beyond this, split into sub-components.
- Export as named export — never default export in `ui/` components.
- Accept and spread `...props` to be composable (unless there is a specific reason not to).
- Accept `className` prop and merge it last so callers can override.
- Use semantic HTML elements (`<button>`, `<input>`, `<label>`, etc.).
- Every interactive element must have an accessible name (`aria-label`, `aria-describedby`, or visible label).
- Use `Skeleton` for loading states — never show empty whitespace.
- **Single quotes** in TypeScript, **double quotes** in JSX attributes.

## Available design tokens

```css
var(--background)    /* Page background */
var(--foreground)    /* Primary text */
var(--surface)       /* Card / panel background */
var(--surface-muted) /* Subtle background */
var(--border)        /* Borders and dividers */
var(--sidebar)       /* Sidebar / accent color (#5f80ff) */
var(--sidebar-text)  /* Text on sidebar */
var(--sidebar-active)/* Active sidebar item */
```

## CSS animation classes (do not recreate these)

```
page-transition      → page entrance
list-item-animate    → list item entrance
modal-overlay        → modal backdrop
modal-content        → modal panel
chart-bar            → animated bar chart
```

## After creating

- [ ] Create `__tests__/[ComponentName].test.tsx` with render, variants, interaction, and accessibility tests.
