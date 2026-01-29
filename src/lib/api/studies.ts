import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type StudyCourse = {
  id: string;
  workspaceId: string;
  title: string;
  provider: string | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  startAt: string | null;
  endAt: string | null;
  lessonCount: number | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type StudyTask = {
  id: string;
  workspaceId: string;
  courseId: string | null;
  title: string;
  notes: string | null;
  dueAt: string | null;
  status: "OPEN" | "DONE";
  documentIds: string[] | null;
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyActivity = {
  id: string;
  workspaceId: string;
  courseId: string | null;
  title: string;
  kind: "EXAM" | "ASSIGNMENT" | "PRESENTATION" | "OTHER";
  dueAt: string | null;
  status: "SCHEDULED" | "DONE";
  documentIds: string[] | null;
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyProject = {
  id: string;
  workspaceId: string;
  courseId: string | null;
  title: string;
  description: string | null;
  dueAt: string | null;
  status: "ACTIVE" | "DONE" | "PAUSED";
  documentIds: string[] | null;
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

export const listStudyCourses = (input?: {
  workspaceId?: string;
  status?: StudyCourse["status"];
  query?: string;
}) => {
  const resolved = workspacePath(input?.workspaceId);
  const params = new URLSearchParams();
  if (input?.status) params.set("status", input.status);
  if (input?.query) params.set("q", input.query);
  const queryString = params.toString();
  return apiFetch<StudyCourse[]>(
    `/workspaces/${resolved}/studies/courses${queryString ? `?${queryString}` : ""}`,
    { workspaceId: resolved },
  );
};

export const listStudyTasks = (input?: {
  workspaceId?: string;
  status?: StudyTask["status"];
  courseId?: string;
  from?: string;
  to?: string;
  query?: string;
}) => {
  const resolved = workspacePath(input?.workspaceId);
  const params = new URLSearchParams();
  if (input?.status) params.set("status", input.status);
  if (input?.courseId) params.set("courseId", input.courseId);
  if (input?.from) params.set("from", input.from);
  if (input?.to) params.set("to", input.to);
  if (input?.query) params.set("q", input.query);
  const queryString = params.toString();
  return apiFetch<StudyTask[]>(
    `/workspaces/${resolved}/studies/tasks${queryString ? `?${queryString}` : ""}`,
    { workspaceId: resolved },
  );
};

export const listStudyActivities = (input?: {
  workspaceId?: string;
  status?: StudyActivity["status"];
  kind?: StudyActivity["kind"];
  courseId?: string;
  from?: string;
  to?: string;
  query?: string;
}) => {
  const resolved = workspacePath(input?.workspaceId);
  const params = new URLSearchParams();
  if (input?.status) params.set("status", input.status);
  if (input?.kind) params.set("kind", input.kind);
  if (input?.courseId) params.set("courseId", input.courseId);
  if (input?.from) params.set("from", input.from);
  if (input?.to) params.set("to", input.to);
  if (input?.query) params.set("q", input.query);
  const queryString = params.toString();
  return apiFetch<StudyActivity[]>(
    `/workspaces/${resolved}/studies/activities${queryString ? `?${queryString}` : ""}`,
    { workspaceId: resolved },
  );
};

export const listStudyProjects = (input?: {
  workspaceId?: string;
  status?: StudyProject["status"];
  courseId?: string;
  from?: string;
  to?: string;
  query?: string;
}) => {
  const resolved = workspacePath(input?.workspaceId);
  const params = new URLSearchParams();
  if (input?.status) params.set("status", input.status);
  if (input?.courseId) params.set("courseId", input.courseId);
  if (input?.from) params.set("from", input.from);
  if (input?.to) params.set("to", input.to);
  if (input?.query) params.set("q", input.query);
  const queryString = params.toString();
  return apiFetch<StudyProject[]>(
    `/workspaces/${resolved}/studies/projects${queryString ? `?${queryString}` : ""}`,
    { workspaceId: resolved },
  );
};

export const createStudyCourse = (input: {
  workspaceId?: string;
  title: string;
  provider?: string | null;
  status?: StudyCourse["status"];
  startAt?: string | null;
  endAt?: string | null;
  lessonCount?: number | null;
  progress?: number | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<StudyCourse>(`/workspaces/${resolved}/studies/courses`, {
    method: "POST",
    workspaceId: resolved,
    body: JSON.stringify({
      title: input.title,
      provider: input.provider ?? null,
      status: input.status,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      lessonCount: input.lessonCount ?? null,
      progress: input.progress ?? null,
    }),
  });
};

export const updateStudyCourse = (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  provider?: string | null;
  status?: StudyCourse["status"];
  startAt?: string | null;
  endAt?: string | null;
  lessonCount?: number | null;
  progress?: number | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<StudyCourse>(
    `/workspaces/${resolved}/studies/courses/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({
        title: input.title,
        provider: input.provider,
        status: input.status,
        startAt: input.startAt,
        endAt: input.endAt,
        lessonCount: input.lessonCount,
        progress: input.progress,
      }),
    },
  );
};

export const createStudyTask = (input: {
  workspaceId?: string;
  title: string;
  notes?: string | null;
  dueAt?: string | null;
  status?: StudyTask["status"];
  courseId?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<StudyTask>(`/workspaces/${resolved}/studies/tasks`, {
    method: "POST",
    workspaceId: resolved,
    body: JSON.stringify({
      title: input.title,
      notes: input.notes ?? null,
      dueAt: input.dueAt ?? null,
      status: input.status,
      courseId: input.courseId ?? null,
    }),
  });
};

export const updateStudyTask = (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  notes?: string | null;
  dueAt?: string | null;
  status?: StudyTask["status"];
  courseId?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<StudyTask>(
    `/workspaces/${resolved}/studies/tasks/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({
        title: input.title,
        notes: input.notes,
        dueAt: input.dueAt,
        status: input.status,
        courseId: input.courseId,
      }),
    },
  );
};
