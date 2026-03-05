# Organization Backoffice — Copilot Instructions

You are working on a **Next.js 16 App Router** frontend using **React 19**, **TypeScript**, and **Tailwind CSS v4**.
Testing is done with **Vitest** + **@testing-library/react**.

---

## Project structure

```
src/
  app/
    (app)/               → Protected routes (requires auth)
      [module]/
        page.tsx         → Server Component — data fetching only, renders *Client.tsx
        [Module]Client.tsx → Client Component — all interactivity
      layout.tsx         → Wraps all (app) routes in <AppShell>
    (auth)/              → Public auth routes (login, register)
    globals.css          → Design tokens + global styles
    layout.tsx           → Root layout
  components/
    layout/
      AppShell.tsx       → Sidebar (left) + top bar — never modify layout here for page features
    ui/                  → Shared primitive components (Button, Card, Input, etc.)
    providers/           → React context providers (ThemeProvider, etc.)
  lib/
    api/                 → All API calls — one file per resource
    i18n/                → Translations and language context
    navigation/          → Route helpers
    storage/             → localStorage helpers
    observability/       → Logging/tracing utilities
  test/                  → Integration/E2E tests (separate from unit tests colocated next to components)
```

---

## Non-negotiable rules

- **Every new component must have a corresponding test file** (`*.test.tsx`).
- **Never write business logic inside page components** — pages are Server Components that render a `*Client.tsx`.
- **Never fetch data inside Client Components** — pass data as props from Server Components or use dedicated lib/api functions.
- Use **double quotes** in JSX attributes and **single quotes** in TypeScript/JS strings.
- Always use explicit TypeScript types — no implicit `any`.
- File names in `kebab-case`, components in `PascalCase`.
- **Maximum 200 lines per file** — split into smaller components or hooks when approaching the limit.
- **One responsibility per file** — one component, one hook, one API function per file.
- All imports use the `@/` alias — never relative `../../` paths.

---

## Design system — CSS variables (always use these, never hardcode colors)

```css
--background      /* Page background */
--foreground      /* Primary text */
--surface         /* Card / panel background */
--surface-muted   /* Subtle background (hover states, empty areas) */
--border          /* Borders and dividers */
--sidebar         /* Sidebar background (#5f80ff light / #4058c4 dark) */
--sidebar-text    /* Text inside sidebar */
--sidebar-active  /* Active item in sidebar */
```

**Never hardcode hex colors** — always reference `var(--token-name)` or the Tailwind mapping (`bg-[var(--surface)]`).
**Always support dark mode** — every component must look correct in both `html[data-theme="dark"]` and light.

---

## Layout rules (sidebar + top bar)

- The persistent **left sidebar** and **top bar** live exclusively in `AppShell.tsx`.
- **Never add navigation or global chrome inside page components**.
- Every `(app)` page renders inside `<AppShell>` via the route group layout.
- The sidebar is always visible on desktop; it collapses on mobile.
- **Responsiveness is mandatory** — every page and component must work at mobile (375px), tablet (768px), and desktop (1280px+) breakpoints.

---

## Component rules

- Prefer composing existing `src/components/ui/` primitives over building raw HTML.
- UI primitive variants: `Button` (`primary | secondary | ghost`), `Card`, `Input`, `Badge`, `Skeleton`, `SectionHeader`.
- Every interactive component must have accessible labels (`aria-label`, `aria-describedby` where needed).
- Use `Skeleton` for loading states — never show empty containers without feedback.
- Animations use existing CSS classes: `page-transition`, `list-item-animate`, `chart-bar`, `modal-overlay`, `modal-content`.

---

## API calls

- All API functions live in `src/lib/api/[resource].ts`.
- API functions are plain async functions — never use class instances.
- Never call `fetch` directly inside components — always go through `src/lib/api/`.
- Handle errors explicitly — never swallow them silently.

---

## Testing

- **Test runner**: Vitest
- **Utilities**: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- Test files colocated next to source files as `__tests__/[ComponentName].test.tsx` OR at the same level as `[ComponentName].test.tsx`.
- Every component must have tests for: render (default state), variants/props, user interactions, accessibility.

---

## Commit & branch conventions

- Branch naming: `feat/[module]-[desc]`, `fix/[module]-[desc]`, `chore/[desc]`
- Commit format: `feat(module): short imperative message` (Conventional Commits, English)
- Never commit directly to `main` or `develop`.
- Versioning: `standard-version` (`patch` = bug fix, `minor` = new feature, `major` = breaking change).
