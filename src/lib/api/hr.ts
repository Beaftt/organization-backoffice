import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type HrPerson = {
  id: string;
  workspaceId: string;
  fullName: string;
  email: string | null;
  roleTitle: string | null;
  department: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HrJob = {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  department: string | null;
  location: string | null;
  type: "INTERNAL" | "EXTERNAL";
  status: "OPEN" | "CLOSED";
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HrJobParticipant = {
  id: string;
  jobId: string;
  userId: string;
  status: "APPLIED" | "SHORTLISTED" | "SELECTED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const stripNulls = <T extends Record<string, unknown>>(value: T) => {
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => {
      if (field === null || field === undefined) return false;
      if (typeof field === "string" && field.trim() === "") return false;
      return true;
    }),
  ) as T;
};

const workspacePath = (workspaceId?: string) => {
  const resolved = workspaceId ?? getWorkspaceId();
  if (!resolved) {
    throw new Error("Workspace not selected");
  }
  return resolved;
};

export const listHrPeople = (input?: {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}) => {
  const workspaceId = workspacePath(input?.workspaceId);
  const params = new URLSearchParams({
    page: String(input?.page ?? 1),
    pageSize: String(input?.pageSize ?? 20),
  });
  if (input?.q) params.set("q", input.q);
  return apiFetch<PaginatedResponse<HrPerson>>(
    `/workspaces/${workspaceId}/hr/people?${params.toString()}`,
    { workspaceId },
  );
};

export const createHrPerson = (input: {
  workspaceId?: string;
  fullName: string;
  email?: string | null;
  roleTitle?: string | null;
  department?: string | null;
  phone?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  notes?: string | null;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<HrPerson>(`/workspaces/${workspaceId}/hr/people`, {
    method: "POST",
    workspaceId,
    body: JSON.stringify(
      stripNulls({
        fullName: input.fullName,
        email: input.email ?? undefined,
        roleTitle: input.roleTitle ?? undefined,
        department: input.department ?? undefined,
        phone: input.phone ?? undefined,
        status: input.status,
        notes: input.notes ?? undefined,
      }),
    ),
  });
};

export const updateHrPerson = (input: {
  workspaceId?: string;
  id: string;
  fullName?: string;
  email?: string | null;
  roleTitle?: string | null;
  department?: string | null;
  phone?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  notes?: string | null;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<HrPerson>(`/workspaces/${workspaceId}/hr/people/${input.id}`, {
    method: "PUT",
    workspaceId,
    body: JSON.stringify(
      stripNulls({
        fullName: input.fullName,
        email: input.email ?? undefined,
        roleTitle: input.roleTitle ?? undefined,
        department: input.department ?? undefined,
        phone: input.phone ?? undefined,
        status: input.status,
        notes: input.notes ?? undefined,
      }),
    ),
  });
};

export const deleteHrPerson = (input: { workspaceId?: string; id: string }) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<void>(`/workspaces/${workspaceId}/hr/people/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};

export const listHrJobs = (input?: {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
}) => {
  const workspaceId = workspacePath(input?.workspaceId);
  const params = new URLSearchParams({
    page: String(input?.page ?? 1),
    pageSize: String(input?.pageSize ?? 20),
  });
  return apiFetch<PaginatedResponse<HrJob>>(
    `/workspaces/${workspaceId}/hr/jobs?${params.toString()}`,
    { workspaceId },
  );
};

export const createHrJob = (input: {
  workspaceId?: string;
  title: string;
  description?: string | null;
  department?: string | null;
  location?: string | null;
  type?: "INTERNAL" | "EXTERNAL";
  status?: "OPEN" | "CLOSED";
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<HrJob>(`/workspaces/${workspaceId}/hr/jobs`, {
    method: "POST",
    workspaceId,
    body: JSON.stringify(
      stripNulls({
        title: input.title,
        description: input.description ?? undefined,
        department: input.department ?? undefined,
        location: input.location ?? undefined,
        type: input.type,
        status: input.status,
      }),
    ),
  });
};

export const updateHrJob = (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  description?: string | null;
  department?: string | null;
  location?: string | null;
  type?: "INTERNAL" | "EXTERNAL";
  status?: "OPEN" | "CLOSED";
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<HrJob>(`/workspaces/${workspaceId}/hr/jobs/${input.id}`, {
    method: "PUT",
    workspaceId,
    body: JSON.stringify(
      stripNulls({
        title: input.title,
        description: input.description ?? undefined,
        department: input.department ?? undefined,
        location: input.location ?? undefined,
        type: input.type,
        status: input.status,
      }),
    ),
  });
};

export const deleteHrJob = (input: { workspaceId?: string; id: string }) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<void>(`/workspaces/${workspaceId}/hr/jobs/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};

export const listHrJobParticipants = (input: {
  workspaceId?: string;
  jobId: string;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<HrJobParticipant[]>(
    `/workspaces/${workspaceId}/hr/jobs/${input.jobId}/participants`,
    { workspaceId },
  );
};

export const addHrJobParticipant = (input: {
  workspaceId?: string;
  jobId: string;
  userId: string;
  status?: "APPLIED" | "SHORTLISTED" | "SELECTED" | "REJECTED";
  notes?: string | null;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<HrJobParticipant>(
    `/workspaces/${workspaceId}/hr/jobs/${input.jobId}/participants`,
    {
      method: "POST",
      workspaceId,
      body: JSON.stringify(
        stripNulls({
          userId: input.userId,
          status: input.status,
          notes: input.notes ?? undefined,
        }),
      ),
    },
  );
};

export const removeHrJobParticipant = (input: {
  workspaceId?: string;
  jobId: string;
  userId: string;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<void>(
    `/workspaces/${workspaceId}/hr/jobs/${input.jobId}/participants/${input.userId}`,
    {
      method: "DELETE",
      workspaceId,
    },
  );
};
