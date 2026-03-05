---
applyTo: '**/lib/api/**/*.ts'
---

# API Layer Rules

You are creating or editing an **API function** in `src/lib/api/`.

## Structure

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface MyResource {
  id: string;
  name: string;
  created_at: string;
}

export interface ListMyResourceResponse {
  data: MyResource[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getMyResources(params: {
  page?: number;
  limit?: number;
}): Promise<ListMyResourceResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  });

  const res = await fetch(`${BASE_URL}/api/v1/my-resource?${query}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch my-resource: ${res.status}`);
  }

  return res.json() as Promise<ListMyResourceResponse>;
}

export async function createMyResource(body: { name: string }): Promise<MyResource> {
  const res = await fetch(`${BASE_URL}/api/v1/my-resource`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to create my-resource: ${res.status}`);
  }

  return res.json() as Promise<MyResource>;
}
```

## Mandatory rules

- **One file per resource** — `src/lib/api/[resource].ts`.
- **Plain async functions only** — never class instances, never hooks.
- **Never call fetch directly inside components** — always go through this layer.
- Always use `credentials: 'include'` for authenticated requests.
- Always use `cache: 'no-store'` for data that must be fresh.
- Always check `res.ok` and throw a meaningful error when false.
- **Never swallow errors silently** — always propagate or throw.
- Export the TypeScript interface for every resource shape.
- Export the interface for list response (`List[Resource]Response` with `data` + `meta`).
- Base URL from `process.env.NEXT_PUBLIC_API_URL` — never hardcode.
- Single quotes in TypeScript strings.
- All imports use `@/` alias.
