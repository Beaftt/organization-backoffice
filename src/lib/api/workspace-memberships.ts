import { apiFetch } from "@/lib/api/client";

export type WorkspaceMembership = {
  id: string;
  workspaceId: string;
  userId: string;
  status: string;
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

export const getWorkspaceMemberships = (workspaceId: string) =>
  apiFetch<PaginatedResponse<WorkspaceMembership>>(
    `/workspaces/${workspaceId}/memberships?page=1&pageSize=50`,
    { workspaceId },
  );

export const createWorkspaceMembership = (input: {
  workspaceId: string;
  userId: string;
  status?: "ACTIVE" | "PENDING" | "INACTIVE";
}) =>
  apiFetch<WorkspaceMembership>(`/workspaces/${input.workspaceId}/memberships`, {
    method: "POST",
    body: JSON.stringify({
      userId: input.userId,
      status: input.status ?? "ACTIVE",
    }),
    workspaceId: input.workspaceId,
  });
