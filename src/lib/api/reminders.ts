import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type ReminderListRecurrence = "NONE" | "MONTHLY";
export type ReminderItemStatus = "PENDING" | "DONE";
export type ReminderFinanceType = "INCOME" | "EXPENSE";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReminderList = {
  id: string;
  workspaceId: string;
  authorId?: string | null;
  title: string;
  description?: string | null;
  recurrence: ReminderListRecurrence;
  resetDay?: number | null;
  linkToFinance: boolean;
  linkToCalendar: boolean;
  isPrivate: boolean;
  allowedUserIds?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type ReminderItem = {
  id: string;
  listId: string;
  title: string;
  notes?: string | null;
  status: ReminderItemStatus;
  dueDate?: string | null;
  financeType?: ReminderFinanceType | null;
  financeCategory?: string | null;
  financeTags?: string[] | null;
  assigneeIds?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type ReminderListsListParams = {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt" | "title";
  orderDirection?: "asc" | "desc";
  query?: string;
};

export type ReminderItemsListParams = {
  workspaceId?: string;
  listId: string;
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt" | "title";
  orderDirection?: "asc" | "desc";
  status?: ReminderItemStatus;
  query?: string;
};

const buildListQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
};

const getWorkspaceOrThrow = (inputId?: string) => {
  const workspaceId = inputId ?? getWorkspaceId();
  if (!workspaceId) {
    throw new Error("Workspace não selecionado");
  }
  return workspaceId;
};

export const listReminderLists = async (params: ReminderListsListParams = {}) => {
  const workspaceId = getWorkspaceOrThrow(params.workspaceId);
  const query = buildListQuery({
    page: params.page,
    pageSize: params.pageSize,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    q: params.query,
  });

  return apiFetch<PaginatedResponse<ReminderList>>(
    `/workspaces/${workspaceId}/reminders/lists${query}`,
    { workspaceId },
  );
};

export const createReminderList = async (input: {
  workspaceId?: string;
  title: string;
  description?: string | null;
  recurrence?: ReminderListRecurrence;
  resetDay?: number | null;
  linkToFinance?: boolean;
  linkToCalendar?: boolean;
  isPrivate?: boolean;
  allowedUserIds?: string[];
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);

  return apiFetch<ReminderList>(`/workspaces/${workspaceId}/reminders/lists`, {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      description: input.description ?? undefined,
      recurrence: input.recurrence,
      resetDay: input.resetDay ?? undefined,
      linkToFinance: input.linkToFinance ?? undefined,
      linkToCalendar: input.linkToCalendar ?? undefined,
      isPrivate: input.isPrivate ?? undefined,
      allowedUserIds: input.allowedUserIds ?? undefined,
    }),
    workspaceId,
  });
};

export const updateReminderList = async (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  description?: string | null;
  recurrence?: ReminderListRecurrence;
  resetDay?: number | null;
  linkToFinance?: boolean;
  linkToCalendar?: boolean;
  isPrivate?: boolean;
  allowedUserIds?: string[] | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);

  return apiFetch<ReminderList>(
    `/workspaces/${workspaceId}/reminders/lists/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        title: input.title,
        description: input.description ?? undefined,
        recurrence: input.recurrence,
        resetDay: input.resetDay ?? undefined,
        linkToFinance: input.linkToFinance ?? undefined,
        linkToCalendar: input.linkToCalendar ?? undefined,
        isPrivate: input.isPrivate ?? undefined,
        allowedUserIds: input.allowedUserIds ?? undefined,
      }),
      workspaceId,
    },
  );
};

export const deleteReminderList = async (input: {
  workspaceId?: string;
  id: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);

  await apiFetch<void>(`/workspaces/${workspaceId}/reminders/lists/${input.id}`, {
    method: "DELETE",
    workspaceId,
  });
};

export const listReminderItems = async (params: ReminderItemsListParams) => {
  const workspaceId = getWorkspaceOrThrow(params.workspaceId);
  const query = buildListQuery({
    page: params.page,
    pageSize: params.pageSize,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    status: params.status,
    q: params.query,
  });

  return apiFetch<PaginatedResponse<ReminderItem>>(
    `/workspaces/${workspaceId}/reminders/lists/${params.listId}/items${query}`,
    { workspaceId },
  );
};

export const createReminderItem = async (input: {
  workspaceId?: string;
  listId: string;
  title: string;
  notes?: string | null;
  status?: ReminderItemStatus;
  dueDate?: string | null;
  financeType?: ReminderFinanceType | null;
  financeCategory?: string | null;
  financeTags?: string[] | null;
  assigneeIds?: string[] | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);

  return apiFetch<ReminderItem>(
    `/workspaces/${workspaceId}/reminders/lists/${input.listId}/items`,
    {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        notes: input.notes ?? undefined,
        status: input.status,
        dueDate: input.dueDate ?? undefined,
        financeType: input.financeType ?? undefined,
        financeCategory: input.financeCategory ?? undefined,
        financeTags: input.financeTags ?? undefined,
        assigneeIds: input.assigneeIds ?? undefined,
      }),
      workspaceId,
    },
  );
};

export const updateReminderItem = async (input: {
  workspaceId?: string;
  listId: string;
  id: string;
  title?: string;
  notes?: string | null;
  status?: ReminderItemStatus;
  dueDate?: string | null;
  financeType?: ReminderFinanceType | null;
  financeCategory?: string | null;
  financeTags?: string[] | null;
  assigneeIds?: string[] | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);

  return apiFetch<ReminderItem>(
    `/workspaces/${workspaceId}/reminders/lists/${input.listId}/items/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        title: input.title,
        notes: input.notes ?? undefined,
        status: input.status,
        dueDate: input.dueDate ?? undefined,
        financeType: input.financeType ?? undefined,
        financeCategory: input.financeCategory ?? undefined,
        financeTags: input.financeTags ?? undefined,
        assigneeIds: input.assigneeIds ?? undefined,
      }),
      workspaceId,
    },
  );
};

export const deleteReminderItem = async (input: {
  workspaceId?: string;
  listId: string;
  id: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);

  await apiFetch<void>(
    `/workspaces/${workspaceId}/reminders/lists/${input.listId}/items/${input.id}`,
    {
      method: "DELETE",
      workspaceId,
    },
  );
};
