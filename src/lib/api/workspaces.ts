import { apiFetch } from "@/lib/api/client";

export type Workspace = {
  id: string;
  name: string;
  type: string;
  domain: string | null;
  logoUrl: string | null;
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

export const createWorkspace = (input: {
  name: string;
  type: "PERSONAL" | "FAMILY" | "ORG";
  domain?: string | null;
}) =>
  apiFetch<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      domain: input.domain ?? null,
    }),
  });

export const uploadWorkspaceLogo = async (input: {
  workspaceId: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("file", input.file);

  return apiFetch<Workspace>(`/workspaces/${input.workspaceId}/logo`, {
    method: "PUT",
    body: formData,
    workspaceId: input.workspaceId,
  });
};

export const removeWorkspaceLogo = async (input: { workspaceId: string }) =>
  apiFetch<Workspace>(`/workspaces/${input.workspaceId}/logo`, {
    method: "DELETE",
    workspaceId: input.workspaceId,
  });
