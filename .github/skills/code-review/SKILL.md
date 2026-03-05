---
name: code-review
description: Perform a structured code review of a component, page, or API function in the backoffice. Checks for design system violations, responsiveness, accessibility, dark mode support, file size, and test coverage. Use this skill when asked to review, audit, or validate frontend code.
argument-hint: '[file or area to review] - e.g., FinanceClient.tsx, lib/api/finance.ts'
---

# Code Review Skill (Backoffice)

Use this skill to perform a structured review of frontend code against the project's standards.

## Review checklist

### Architecture

- [ ] `page.tsx` is a Server Component — no `'use client'`, no interactivity.
- [ ] Interactivity is in `*Client.tsx` only — `'use client'` present.
- [ ] `page.tsx` delegates to `*Client.tsx` — under 50 lines.
- [ ] `*Client.tsx` under 200 lines — split if exceeding.
- [ ] API calls are in `src/lib/api/` — never inline `fetch` in components.
- [ ] Imports use `@/` alias — no relative `../../` paths.

### Design system

- [ ] No hardcoded hex colors — all colors use `var(--token)` or Tailwind token classes.
- [ ] Dark mode supported — every element looks correct in `html[data-theme="dark"]`.
- [ ] Uses existing `ui/` primitives: `Button`, `Card`, `Input`, `Skeleton`, `Badge`, `SectionHeader`.
- [ ] Animation classes used correctly: `page-transition`, `list-item-animate`, `modal-overlay`, `modal-content`, `chart-bar`.
- [ ] No new CSS animations defined outside `globals.css`.

### Layout & Responsiveness

- [ ] Sidebar and top bar not modified inside page components — they live only in `AppShell.tsx`.
- [ ] Responsive at all three breakpoints: 375px (mobile), 768px (md:), 1280px (lg:).
- [ ] No layout that breaks at mobile widths.
- [ ] Loading states use `Skeleton` — never empty whitespace.

### Accessibility

- [ ] Interactive elements have accessible names (`aria-label`, visible label, or semantic HTML).
- [ ] `<button>` used for clickable actions — not `<div onClick>`.
- [ ] Images have `alt` text.
- [ ] Form inputs have associated `<label>` elements.
- [ ] Focus is managed correctly when modals/dialogs open and close.

### Code quality

- [ ] TypeScript explicit types — no implicit `any`.
- [ ] Double quotes in JSX, single quotes in TypeScript strings.
- [ ] File names in `kebab-case`, components in `PascalCase`.
- [ ] One component per file.
- [ ] No `console.log` left in production code.
- [ ] Error handling in API calls — never silent fails.

### Testing

- [ ] Every component has a `*.test.tsx` file.
- [ ] Tests cover: render, variants, interactions, accessibility, loading/empty states.
- [ ] `screen.getByRole` used over `getByTestId`.
- [ ] `userEvent.setup()` used for interactions.

## Reporting format

```
[SEVERITY] Category — Description
File: src/[path]/...
Fix: [short description of what to change]
```

Severity: `CRITICAL`, `WARNING`, `SUGGESTION`
