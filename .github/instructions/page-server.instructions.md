---
applyTo: '**/app/(app)/**/page.tsx'
---

# Page (Server Component) Rules

You are creating or editing a **page.tsx** — a Server Component in the Next.js App Router.

## Responsibilities

`page.tsx` is responsible for:
- Fetching data from APIs using `src/lib/api/` functions (server-side only).
- Passing fetched data as props to the `*Client.tsx` component.
- Redirecting unauthenticated users if needed.

## Structure

```tsx
import { MyModuleClient } from './MyModuleClient';
import { getMyData } from '@/lib/api/my-module';

export default async function MyModulePage() {
  const data = await getMyData();

  return <MyModuleClient initialData={data} />;
}
```

## Mandatory rules

- Page component is `async` when it fetches data — never fetch in a sync Server Component.
- **Never** add `'use client'` to `page.tsx` — it must remain a Server Component.
- **Never** add interactivity (onClick, useState, etc.) — delegate to the `*Client.tsx`.
- **Never** call fetch directly — always call functions from `src/lib/api/`.
- Keep the file under 50 lines — it should be a thin delegation layer.
- Name: `page.tsx` (required by Next.js App Router).
- The Client Component it renders is at `[ModuleName]Client.tsx` in the same directory.
