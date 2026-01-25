import { apiFetch } from "@/lib/api/client";

export type WorkspaceInvite = {
  id: string;
  workspaceId: string;
  email: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export const createWorkspaceInvite = (input: {
  workspaceId: string;
  email: string;
}) =>
  apiFetch<WorkspaceInvite>(`/workspaces/${input.workspaceId}/invites`, {
    method: "POST",
    body: JSON.stringify({ email: input.email }),
    workspaceId: input.workspaceId,
  });
