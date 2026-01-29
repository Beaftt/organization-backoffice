import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type CalendarRecurrence = {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  byWeekday?: number[];
  byMonthDay?: number[];
  until?: string | null;
};

export type CalendarEvent = {
  id: string;
  workspaceId: string;
  ownerUserId: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  allDay: boolean;
  tags?: string[] | null;
  participantIds?: string[] | null;
  documentIds?: string[] | null;
  minutesText?: string | null;
  minutesDocumentIds?: string[] | null;
  recurrence?: CalendarRecurrence | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarShare = {
  id: string;
  workspaceId: string;
  ownerUserId: string;
  shareWithAll: boolean;
  allowedUserIds?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

const getWorkspaceOrThrow = (inputId?: string) => {
  const workspaceId = inputId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }
  return workspaceId;
};

export const listCalendarEvents = async (input: {
  workspaceId?: string;
  from?: string;
  to?: string;
  ownerUserIds?: string[];
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  const params = new URLSearchParams();
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  if (input.ownerUserIds?.length) params.set("ownerUserIds", input.ownerUserIds.join(","));

  const query = params.toString();
  return apiFetch<CalendarEvent[]>(
    `/workspaces/${workspaceId}/calendar/events${query ? `?${query}` : ""}`,
    { workspaceId },
  );
};

export const createCalendarEvent = async (input: {
  workspaceId?: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  allDay?: boolean;
  tags?: string[] | null;
  participantIds?: string[] | null;
  documentIds?: string[] | null;
  minutesText?: string | null;
  minutesDocumentIds?: string[] | null;
  recurrence?: CalendarRecurrence | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<CalendarEvent>(`/workspaces/${workspaceId}/calendar/events`, {
    method: "POST",
    body: JSON.stringify(input),
    workspaceId,
  });
};

export const updateCalendarEvent = async (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  description?: string | null;
  startAt?: string;
  endAt?: string | null;
  allDay?: boolean;
  tags?: string[] | null;
  participantIds?: string[] | null;
  documentIds?: string[] | null;
  minutesText?: string | null;
  minutesDocumentIds?: string[] | null;
  recurrence?: CalendarRecurrence | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<CalendarEvent>(
    `/workspaces/${workspaceId}/calendar/events/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      workspaceId,
    },
  );
};

export const deleteCalendarEvent = async (input: {
  workspaceId?: string;
  id: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  await apiFetch<void>(`/workspaces/${workspaceId}/calendar/events/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};

export const getMyCalendarShare = async (workspaceId?: string) => {
  const resolvedWorkspaceId = getWorkspaceOrThrow(workspaceId);
  return apiFetch<CalendarShare>(
    `/workspaces/${resolvedWorkspaceId}/calendar/shares/me`,
    { workspaceId: resolvedWorkspaceId },
  );
};

export const updateMyCalendarShare = async (input: {
  workspaceId?: string;
  shareWithAll?: boolean;
  allowedUserIds?: string[] | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<CalendarShare>(
    `/workspaces/${workspaceId}/calendar/shares/me`,
    {
      method: "PUT",
      body: JSON.stringify({
        shareWithAll: input.shareWithAll,
        allowedUserIds: input.allowedUserIds ?? null,
      }),
      workspaceId,
    },
  );
};
