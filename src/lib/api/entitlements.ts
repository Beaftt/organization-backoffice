import { apiFetch } from "@/lib/api/client";

export type Entitlement = {
  id: string;
  key: string;
  value: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const getEntitlements = (workspaceId: string) =>
  apiFetch<PaginatedResponse<Entitlement>>(
    `/workspaces/${workspaceId}/entitlements?page=1&pageSize=100`,
    { workspaceId },
  );
