---
applyTo: '**/*Client.tsx'
---

# Client Component Rules

You are creating or editing a `*Client.tsx` — an interactive Client Component in the Next.js App Router.

## Structure

```tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { MyData } from '@/lib/api/my-module';

interface MyModuleClientProps {
  initialData: MyData[];
}

export function MyModuleClient({ initialData }: MyModuleClientProps) {
  const [data, setData] = useState(initialData);

  return (
    <div className="page-transition flex flex-col gap-6 p-6">
      <SectionHeader title="My Module" />
      {/* content */}
    </div>
  );
}
```

## Mandatory rules

- **Must** start with `'use client';` directive.
- **Never** call fetch directly — use `src/lib/api/` functions for any client-side data refresh.
- **Maximum 200 lines** — extract sub-components and custom hooks when approaching the limit.
- **One responsibility** — if the file handles multiple distinct UI sections, split them.
- Apply `page-transition` class to the root element for consistent entrance animation.
- Use `Skeleton` from `@/components/ui/Skeleton` for loading states.
- Use `Card` from `@/components/ui/Card` for content panels.
- Use `Button` from `@/components/ui/Button` for all button elements (`primary | secondary | ghost`).
- **Responsiveness is mandatory** — use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
- **Never hardcode colors** — always use `var(--token)` or Tailwind token classes.
- **Always support dark mode** — every element must look correct in both themes.
- Exported as `named export` — not default export.

## Responsiveness breakpoints

```
375px  → mobile (default / no prefix)
768px  → tablet (md:)
1280px → desktop (lg:)
```

## After creating

- [ ] Create a test file `__tests__/[ModuleName]Client.test.tsx` covering: render, interactions, loading state.
