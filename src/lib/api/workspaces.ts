import { apiFetch } from "@/lib/api/client";

export type Workspace = {
  id: string;
  name: string;
  type: string;
  domain: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const getWorkspaces = (input?: { page?: number; pageSize?: number }) =>
  apiFetch<PaginatedResponse<Workspace>>(
    `/workspaces?page=${input?.page ?? 1}&pageSize=${input?.pageSize ?? 50}`,
  );
