---
name: new-ui-component
description: Scaffold a new shared UI primitive component in src/components/ui/ with proper TypeScript types, design token usage, dark mode support, and a corresponding test file. Use this skill when asked to create a new reusable UI component like a Badge, Modal, Table, or similar.
argument-hint: '[component name] - e.g., Modal, Table, Avatar, Toast'
---

# New UI Component Skill (Backoffice)

Use this skill to scaffold a new shared primitive in `src/components/ui/`.

## Before you start

Check `src/components/ui/` for existing components to avoid duplication:
- `Button.tsx` — actions (`primary | secondary | ghost` variants)
- `Card.tsx` — content panels
- `Input.tsx` — text inputs
- `Badge.tsx` — status tags
- `Skeleton.tsx` — loading placeholders
- `SectionHeader.tsx` — page/section titles

## Component template

```tsx
import type { HTMLAttributes } from 'react';

// 1. TypeScript interface extending the appropriate HTML element
interface [ComponentName]Props extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted'; // define variants
  // add component-specific props here
}

// 2. Named export — never default export
export function [ComponentName]({
  variant = 'default',
  className = '',
  children,
  ...props
}: [ComponentName]Props) {
  // 3. Base styles — use design tokens only
  const base = 'rounded-lg transition duration-200';

  // 4. Variant styles — use var(--token) only
  const styles: Record<string, string> = {
    default: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]',
    muted: 'bg-[var(--surface-muted)] text-[var(--foreground)]/70',
  };

  return (
    <div
      className={`${base} ${styles[variant ?? 'default']} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
```

## Design tokens to use

```css
var(--background)    /* Page background */
var(--foreground)    /* Primary text */
var(--surface)       /* Card / panel background */
var(--surface-muted) /* Subtle background */
var(--border)        /* Borders and dividers */
var(--sidebar)       /* Primary accent color (#5f80ff) */
```

## Dark mode checklist

Verify in `html[data-theme="dark"]` that:
- Text is readable against the dark `--surface` (`#121a30`).
- Borders use `--border` (`#1f2a44`), not hardcoded values.
- No hardcoded colors at all.

## Accessibility checklist

- Semantic HTML element used (not always `<div>`).
- Interactive components have `role`, `aria-label`, or visible text.
- Focus styles visible (`focus:outline`, `focus:ring`).

## Test template

Create `src/components/ui/__tests__/[ComponentName].test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [ComponentName] } from '../[ComponentName]';

describe('[ComponentName]', () => {
  it('renders children', () => {
    render(<[ComponentName]>Content</[ComponentName]>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<[ComponentName]>Default</[ComponentName]>);
    // assert default visual behaviour (role, text)
  });

  it('applies muted variant', () => {
    render(<[ComponentName] variant="muted">Muted</[ComponentName]>);
    // assert muted variant
  });

  it('spreads additional className', () => {
    render(<[ComponentName] className="custom-class">Test</[ComponentName]>);
    // assert className is applied
  });

  // add interaction tests if the component is interactive
});
```

## Checklist

- [ ] Named export (not default export).
- [ ] Extends appropriate HTML element attributes.
- [ ] Accepts and merges `className` prop.
- [ ] Spreads `...props` for composability.
- [ ] No hardcoded colors — design tokens only.
- [ ] Dark mode visually correct.
- [ ] Accessible (semantic HTML, ARIA labels if interactive).
- [ ] Under 200 lines.
- [ ] Test file created with all required scenarios.
