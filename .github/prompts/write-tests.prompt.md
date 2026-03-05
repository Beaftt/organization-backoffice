---
description: Write comprehensive Vitest tests for an existing component or page client in the backoffice. Covers render, variants, interactions, accessibility, loading, and empty states.
name: write-tests
argument-hint: '[component file] - e.g., Button.tsx, FinanceClient.tsx'
agent: agent
---

Write comprehensive tests for the following component:

**Target**: ${input:target:component file path or name - e.g., FinanceClient.tsx}

## What to generate

A complete `*.test.tsx` file colocated with the component at `__tests__/[ComponentName].test.tsx`.

## Required test scenarios

1. **Render** — default state, required props.
2. **Variants** — each `variant` prop value (`primary | secondary | ghost` etc.).
3. **User interactions** — click, change, submit, keyboard navigation.
4. **Accessibility** — correct role, label, focus behaviour.
5. **Loading state** — `Skeleton` shown when `isLoading` / data absent.
6. **Empty state** — message or placeholder shown when data array is empty.
7. **Error state** — error message visible when API call fails (if applicable).

## Setup

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock API modules used by the component
vi.mock('@/lib/api/[resource]', () => ({
  get[Resource]: vi.fn().mockResolvedValue({ data: [], meta: { ... } }),
}));
```

## Rules

Read [copilot-instructions.md](../copilot-instructions.md) and [test.instructions.md](../instructions/test.instructions.md) before generating.
- `screen.getByRole` over `getByTestId`.
- `userEvent.setup()` — never `fireEvent`.
- `vi.fn()` for mocks.
- Single quotes in TypeScript, double quotes in JSX.
- Import alias: `@/`.
- Never test CSS class strings directly — test user-visible behaviour.
- Never snapshot layout components.
