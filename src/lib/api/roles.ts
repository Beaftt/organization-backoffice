import { apiFetch } from "@/lib/api/client";

export type WorkspaceRole = {
  id: string;
  workspaceId: string;
  key: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const listWorkspaceRoles = (input: {
  workspaceId: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt" | "key";
  orderDirection?: "asc" | "desc";
}) =>
  apiFetch<PaginatedResponse<WorkspaceRole>>(
    `/workspaces/${input.workspaceId}/roles?page=${input.page ?? 1}&pageSize=${
      input.pageSize ?? 100
    }${input.orderBy ? `&orderBy=${input.orderBy}` : ""}${
      input.orderDirection ? `&orderDirection=${input.orderDirection}` : ""
    }`,
    { workspaceId: input.workspaceId },
  );
