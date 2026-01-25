import { apiFetch } from "@/lib/api/client";

export type Subscription = {
  id: string;
  planKey: string;
  status: string;
  provider: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
};

export type SeatPack = {
  id: string;
  packSize: number;
  quantity: number;
};

export type Limit = {
  id: string;
  key: string;
  value: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const getSubscriptions = (workspaceId: string) =>
  apiFetch<PaginatedResponse<Subscription>>(
    `/workspaces/${workspaceId}/subscriptions?page=1&pageSize=20`,
    { workspaceId },
  );

export const getSeatPacks = (workspaceId: string) =>
  apiFetch<PaginatedResponse<SeatPack>>(
    `/workspaces/${workspaceId}/seat-packs?page=1&pageSize=20`,
    { workspaceId },
  );

export const getLimits = (workspaceId: string) =>
  apiFetch<PaginatedResponse<Limit>>(
    `/workspaces/${workspaceId}/limits?page=1&pageSize=50`,
    { workspaceId },
  );
