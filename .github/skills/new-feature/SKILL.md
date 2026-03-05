---
name: new-feature
description: Implement a complete new page feature end-to-end for the backoffice: Server Component page.tsx, Client Component *Client.tsx, API function in lib/api/, and component tests. Use this skill when asked to create a new page, module route, or feature for the backoffice.
argument-hint: '[module] - e.g., notifications, tasks'
---

# New Feature Skill (Backoffice)

Use this skill to implement a complete new page feature following the project's Next.js App Router structure.

## Before you start

1. Check if a route already exists under `src/app/(app)/[module]/`.
2. Check if an API function already exists in `src/lib/api/[module].ts`.
3. Confirm the feature doesn't contradict existing layout rules (sidebar/topbar live in `AppShell.tsx` only).

## Step-by-step implementation

### Step 1 — API layer (`src/lib/api/`)

Create or update `src/lib/api/[resource].ts`:
- Export TypeScript interfaces for the resource shape.
- Export interface for list response (`data` + `meta` with pagination).
- Plain async functions only — `get`, `create`, `update`, `delete`.
- Always check `res.ok` and throw meaningful errors.
- Use `credentials: 'include'` and `cache: 'no-store'`.

### Step 2 — Server Component (`src/app/(app)/[module]/page.tsx`)

```tsx
import { [Module]Client } from './[Module]Client';
import { get[Module] } from '@/lib/api/[module]';

export default async function [Module]Page() {
  const data = await get[Module]();
  return <[Module]Client initialData={data} />;
}
```

- Keep under 50 lines — thin delegation layer only.
- No `'use client'` — must stay a Server Component.
- No interactivity here.

### Step 3 — Client Component (`src/app/(app)/[module]/[Module]Client.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';

interface [Module]ClientProps {
  initialData: [ModuleType][];
}

export function [Module]Client({ initialData }: [Module]ClientProps) {
  const [data, setData] = useState(initialData);
  // ...
  return (
    <div className="page-transition flex flex-col gap-6 p-6">
      <SectionHeader title="[Module]" />
      {/* content */}
    </div>
  );
}
```

Rules:
- Max 200 lines — split into sub-components if needed.
- Apply `page-transition` to root element.
- Use design tokens only — never hardcode colors.
- Responsive at 375px / 768px / 1280px+.
- Support dark mode.

### Step 4 — Tests

Create `src/app/(app)/[module]/__tests__/[Module]Client.test.tsx`:
- Test: renders with data, renders loading state, user interactions.
- Mock API calls with `vi.fn()`.

### Step 5 — Navigation (if new route)

Check `src/components/layout/AppShell.tsx` `moduleLinks` array — add the new route entry if this is a new module.

## Checklist before finishing

- [ ] API function with typed interfaces and error handling.
- [ ] `page.tsx` — async Server Component, under 50 lines.
- [ ] `[Module]Client.tsx` — `'use client'`, under 200 lines, responsive, dark-mode-aware.
- [ ] Uses CSS variables only (no hardcoded colors).
- [ ] Uses `Card`, `Button`, `Skeleton` from `@/components/ui/`.
- [ ] Test file created with render + interaction + loading tests.
- [ ] Route added to `moduleLinks` in `AppShell.tsx` if new module.
