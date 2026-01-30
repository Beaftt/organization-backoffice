import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type JobListing = {
  id: string;
  workspaceId: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobResume = {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  summary: string | null;
  experience: string | null;
  education: string | null;
  skills: string | null;
  links: Array<{ label: string; url: string }> | null;
  createdAt: string;
  updatedAt: string;
};

const workspacePath = (workspaceId?: string) => {
  const resolved = workspaceId ?? getWorkspaceId();
  if (!resolved) {
    throw new Error("Workspace not selected");
  }
  return resolved;
};

export const listJobs = (input?: {
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
  return apiFetch<PaginatedResponse<JobListing>>(
    `/workspaces/${workspaceId}/jobs?${params.toString()}`,
    { workspaceId },
  );
};

export const createJob = (input: {
  workspaceId?: string;
  title: string;
  company?: string | null;
  location?: string | null;
  url?: string | null;
  status?: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  source?: string | null;
  notes?: string | null;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<JobListing>(`/workspaces/${workspaceId}/jobs`, {
    method: "POST",
    workspaceId,
    body: JSON.stringify({
      title: input.title,
      company: input.company ?? null,
      location: input.location ?? null,
      url: input.url ?? null,
      status: input.status,
      source: input.source ?? null,
      notes: input.notes ?? null,
    }),
  });
};

export const updateJob = (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  company?: string | null;
  location?: string | null;
  url?: string | null;
  status?: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  source?: string | null;
  notes?: string | null;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<JobListing>(`/workspaces/${workspaceId}/jobs/${input.id}`, {
    method: "PUT",
    workspaceId,
    body: JSON.stringify({
      title: input.title,
      company: input.company ?? null,
      location: input.location ?? null,
      url: input.url ?? null,
      status: input.status,
      source: input.source ?? null,
      notes: input.notes ?? null,
    }),
  });
};

export const deleteJob = (input: { workspaceId?: string; id: string }) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<void>(`/workspaces/${workspaceId}/jobs/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};

export const getResume = (workspaceId?: string) => {
  const resolved = workspacePath(workspaceId);
  return apiFetch<JobResume | null>(`/workspaces/${resolved}/jobs/resume`, {
    workspaceId: resolved,
  });
};

export const upsertResume = (input: {
  workspaceId?: string;
  title: string;
  summary?: string | null;
  experience?: string | null;
  education?: string | null;
  skills?: string | null;
  links?: Array<{ label: string; url: string }> | null;
}) => {
  const workspaceId = workspacePath(input.workspaceId);
  return apiFetch<JobResume>(`/workspaces/${workspaceId}/jobs/resume`, {
    method: "PUT",
    workspaceId,
    body: JSON.stringify({
      title: input.title,
      summary: input.summary ?? null,
      experience: input.experience ?? null,
      education: input.education ?? null,
      skills: input.skills ?? null,
      links: input.links ?? null,
    }),
  });
};
