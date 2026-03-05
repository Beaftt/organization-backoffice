---
description: Scaffold a complete new page for the backoffice — Server Component page.tsx + Client Component + API function + test file. Follows Next.js App Router + Clean Architecture.
name: new-page
argument-hint: '[module-name] - e.g., notifications, tasks'
agent: agent
---

Scaffold a complete new page for the backoffice following the project's Next.js App Router structure.

**Module**: ${input:moduleName:e.g., notifications}

## What to generate

### 1. API function — `src/lib/api/${input:moduleName}.ts`

- Export TypeScript interface for the resource.
- Export `List[Resource]Response` interface with `data` + `meta`.
- Plain async functions: `get[Resource]s`, `create[Resource]`, `update[Resource]`, `delete[Resource]`.
- Always check `res.ok`, throw on failure.
- Use `credentials: 'include'` and `cache: 'no-store'`.
- Base URL from `process.env.NEXT_PUBLIC_API_URL`.

### 2. Server Component — `src/app/(app)/${input:moduleName}/page.tsx`

```tsx
import { [Module]Client } from './[Module]Client';
import { get[Module]s } from '@/lib/api/${input:moduleName}';

export default async function [Module]Page() {
  const data = await get[Module]s({ page: 1, limit: 10 });
  return <[Module]Client initialData={data} />;
}
```

- No `'use client'`.
- Under 50 lines.
- No interactivity.

### 3. Client Component — `src/app/(app)/${input:moduleName}/[Module]Client.tsx`

- `'use client'` at the top.
- Wraps content with `page-transition` class.
- Uses `SectionHeader`, `Card`, `Button`, `Skeleton` from `@/components/ui/`.
- CSS variables only — no hardcoded colors.
- Responsive: mobile → `md:` → `lg:`.
- Dark mode correct.
- Under 200 lines.

### 4. Test — `src/app/(app)/${input:moduleName}/__tests__/[Module]Client.test.tsx`

- Mock the API function with `vi.fn()`.
- Test: renders with data, renders loading/empty state, user interactions.

## Rules

Read [copilot-instructions.md](../copilot-instructions.md) before generating.
- `@/` alias for all imports.
- Double quotes in JSX, single quotes in TypeScript.
- No hardcoded colors — `var(--token)` only.
- Design tokens: `--background`, `--foreground`, `--surface`, `--surface-muted`, `--border`, `--sidebar`.
