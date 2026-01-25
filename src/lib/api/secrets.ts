import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type SecretType = "ACCOUNT" | "SERVER" | "API" | "OTHER";

export type SecretSummary = {
  id: string;
  workspaceId: string;
  title: string;
  type: SecretType;
  username?: string | null;
  url?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SecretDetails = SecretSummary & {
  secret: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SecretsListParams = {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt" | "title";
  orderDirection?: "asc" | "desc";
  type?: SecretType;
  query?: string;
};

const buildListQuery = (params: SecretsListParams) => {
  const search = new URLSearchParams();

  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.orderBy) search.set("orderBy", params.orderBy);
  if (params.orderDirection) search.set("orderDirection", params.orderDirection);
  if (params.type) search.set("type", params.type);
  if (params.query) search.set("q", params.query);

  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
};

export const listSecrets = async (params: SecretsListParams = {}) => {
  const workspaceId = params.workspaceId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }

  const query = buildListQuery(params);
  return apiFetch<PaginatedResponse<SecretSummary>>(
    `/workspaces/${workspaceId}/secrets${query}`,
    { workspaceId },
  );
};

export const getSecret = async (input: { workspaceId?: string; id: string }) => {
  const workspaceId = input.workspaceId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }

  return apiFetch<SecretDetails>(`/workspaces/${workspaceId}/secrets/${input.id}`, {
    workspaceId,
  });
};

export const createSecret = async (input: {
  workspaceId?: string;
  title: string;
  type: SecretType;
  secret: string;
  username?: string | null;
  url?: string | null;
  notes?: string | null;
}) => {
  const workspaceId = input.workspaceId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }

  return apiFetch<SecretDetails>(`/workspaces/${workspaceId}/secrets`, {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      type: input.type,
      secret: input.secret,
      username: input.username ?? undefined,
      url: input.url ?? undefined,
      notes: input.notes ?? undefined,
    }),
    workspaceId,
  });
};

export const updateSecret = async (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  type?: SecretType;
  secret?: string;
  username?: string | null;
  url?: string | null;
  notes?: string | null;
}) => {
  const workspaceId = input.workspaceId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }

  return apiFetch<SecretDetails>(`/workspaces/${workspaceId}/secrets/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: input.title,
      type: input.type,
      secret: input.secret,
      username: input.username ?? undefined,
      url: input.url ?? undefined,
      notes: input.notes ?? undefined,
    }),
    workspaceId,
  });
};

export const deleteSecret = async (input: { workspaceId?: string; id: string }) => {
  const workspaceId = input.workspaceId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }

  await apiFetch<void>(`/workspaces/${workspaceId}/secrets/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};
