---
applyTo: '**/*.test.tsx'
---

# Test Rules (Frontend)

You are creating or editing a **component test** using Vitest + @testing-library/react.

## Structure

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with default state', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders all variants correctly', () => {
    const { rerender } = render(<MyComponent variant="primary" title="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();

    rerender(<MyComponent variant="secondary" title="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<MyComponent title="Click me" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible — has correct role and label', () => {
    render(<MyComponent title="Accessible" aria-label="My component" />);
    expect(screen.getByRole('button', { name: 'My component' })).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<MyComponent title="Data" isLoading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Data')).not.toBeInTheDocument();
  });
});
```

## Mandatory test scenarios for every component


1. **Render** — default state with required props.
2. **Variants/Props** — each variant or conditional prop combination.
3. **User interactions** — clicks, inputs, keyboard navigation.
4. **Accessibility** — correct roles (`getByRole`), labels (`aria-label`, `aria-describedby`).
5. **Loading state** — skeleton shown when `isLoading` / data is absent.
6. **Empty state** — correct feedback when data array is empty (if applicable).

## Rules

- Use `screen.getByRole` (semantic) over `screen.getByTestId` (implementation detail) whenever possible.
- Use `userEvent.setup()` for all user interaction simulations.
- Use `vi.fn()` for mock functions — use `mockResolvedValue` for async.
- Group tests with `describe('[ComponentName]', () => { ... })`.
- Test descriptions: `'[does what] when [condition]'` — English, present tense.
- Single quotes in TypeScript, double quotes in JSX.
- Import aliases: always `@/` — never relative `../../` paths.
- Never test implementation details (internal state, CSS classes alone) — test user-visible behaviour.
- Never snapshot test layout components — they change too frequently.
