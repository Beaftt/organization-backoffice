---
name: write-tests
description: Write comprehensive component tests using Vitest and @testing-library/react for any component in the backoffice. Covers render, variants, user interactions, accessibility, loading states, and empty states. Use this skill when asked to write, fix, or improve frontend tests.
argument-hint: '[component file] - e.g., Button.tsx, FinanceClient.tsx'
---

# Write Tests Skill (Backoffice)

Use this skill to write thorough component tests following the project's testing standards.

## Testing setup

- **Runner**: Vitest
- **Utilities**: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- **Test location**: colocated as `__tests__/[ComponentName].test.tsx` or `[ComponentName].test.tsx` in the same directory.
- **Import alias**: always `@/` — never relative paths.

## Template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { [ComponentName] } from '../[ComponentName]';

// Mock API calls if the component fetches data
vi.mock('@/lib/api/[resource]', () => ({
  get[Resource]: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
}));

describe('[ComponentName]', () => {
  it('renders with default state', () => {
    render(<[ComponentName] />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('renders all variants correctly', () => {
    const { rerender } = render(<[ComponentName] variant="primary" />);
    // assert primary
    rerender(<[ComponentName] variant="secondary" />);
    // assert secondary
  });

  it('calls handler when user interacts', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<[ComponentName] onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: /action/i }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('has accessible role and label', () => {
    render(<[ComponentName] aria-label="Accessible label" />);
    expect(screen.getByRole('button', { name: /accessible label/i })).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    render(<[ComponentName] isLoading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<[ComponentName] data={[]} />);
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });
});
```

## Mandatory scenarios to cover

1. **Render** — default state, required props.
2. **Variants/Props** — each variant (`primary | secondary | ghost`) and conditional prop.
3. **User interactions** — clicks, form inputs, keyboard navigation.
4. **Accessibility** — roles, labels (`aria-label`, `aria-describedby`), keyboard focus.
5. **Loading state** — skeleton shown, content hidden.
6. **Empty state** — user-facing message when data is empty.
7. **Error state** — error message shown when fetch fails (if applicable).

## Rules

- Use `screen.getByRole` (semantic) over `screen.getByTestId` wherever possible.
- Use `userEvent.setup()` — never `fireEvent` directly.
- Use `vi.fn()` for mocks — `mockResolvedValue` for async functions.
- Never test implementation details or CSS class strings.
- Never snapshot test layout components.
- Test descriptions in English: `'[does what] when [condition]'`.
- Single quotes in TypeScript, double quotes in JSX.
