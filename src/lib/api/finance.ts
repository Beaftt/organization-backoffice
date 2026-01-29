import { apiFetch } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type FinanceTag = {
  id: string;
  workspaceId: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceCategory = {
  id: string;
  workspaceId: string;
  name: string;
  group: "INCOME" | "EXPENSE";
  createdAt: string;
  updatedAt: string;
};

export type FinanceAccount = {
  id: string;
  workspaceId: string;
  name: string;
  type: "CASH" | "BANK" | "CARD";
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type FinanceTransaction = {
  id: string;
  workspaceId: string;
  title: string;
  amount: number;
  currency: string;
  group: "INCOME" | "EXPENSE";
  status: "PAID" | "PENDING";
  occurredAt: string;
  description: string | null;
  accountId: string | null;
  categoryId: string | null;
  tagIds: string[] | null;
  recurringId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceRecurring = {
  id: string;
  workspaceId: string;
  title: string;
  amount: number;
  currency: string;
  group: "INCOME" | "EXPENSE";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  nextDue: string;
  active: boolean;
  accountId: string | null;
  categoryId: string | null;
  tagIds: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceNotification = {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  type: "CARD" | "INFO";
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpense: number;
  net: number;
  accounts: Array<{
    accountId: string;
    name: string;
    type: "CASH" | "BANK" | "CARD";
    currency: string;
    income: number;
    expense: number;
    net: number;
  }>;
};

const workspacePath = (workspaceId?: string) => {
  const resolved = workspaceId ?? getWorkspaceId();
  if (!resolved) {
    throw new Error("Workspace not selected");
  }
  return resolved;
};

export const listFinanceTags = (workspaceId?: string) => {
  const resolved = workspacePath(workspaceId);
  return apiFetch<FinanceTag[]>(`/workspaces/${resolved}/finance/tags`, {
    workspaceId: resolved,
  });
};

export const createFinanceTag = (input: {
  workspaceId?: string;
  name: string;
  color?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceTag>(`/workspaces/${resolved}/finance/tags`, {
    method: "POST",
    workspaceId: resolved,
    body: JSON.stringify({ name: input.name, color: input.color ?? null }),
  });
};

export const updateFinanceTag = (input: {
  workspaceId?: string;
  id: string;
  name?: string;
  color?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceTag>(`/workspaces/${resolved}/finance/tags/${input.id}`, {
    method: "PUT",
    workspaceId: resolved,
    body: JSON.stringify({ name: input.name, color: input.color }),
  });
};

export const deleteFinanceTag = (input: { workspaceId?: string; id: string }) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<void>(`/workspaces/${resolved}/finance/tags/${input.id}`, {
    method: "DELETE",
    workspaceId: resolved,
  });
};

export const listFinanceCategories = (workspaceId?: string) => {
  const resolved = workspacePath(workspaceId);
  return apiFetch<FinanceCategory[]>(`/workspaces/${resolved}/finance/categories`, {
    workspaceId: resolved,
  });
};

export const createFinanceCategory = (input: {
  workspaceId?: string;
  name: string;
  group: "INCOME" | "EXPENSE";
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceCategory>(`/workspaces/${resolved}/finance/categories`, {
    method: "POST",
    workspaceId: resolved,
    body: JSON.stringify({ name: input.name, group: input.group }),
  });
};

export const updateFinanceCategory = (input: {
  workspaceId?: string;
  id: string;
  name?: string;
  group?: "INCOME" | "EXPENSE";
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceCategory>(
    `/workspaces/${resolved}/finance/categories/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({ name: input.name, group: input.group }),
    },
  );
};

export const deleteFinanceCategory = (input: { workspaceId?: string; id: string }) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<void>(`/workspaces/${resolved}/finance/categories/${input.id}`, {
    method: "DELETE",
    workspaceId: resolved,
  });
};

export const listFinanceAccounts = (workspaceId?: string) => {
  const resolved = workspacePath(workspaceId);
  return apiFetch<FinanceAccount[]>(`/workspaces/${resolved}/finance/accounts`, {
    workspaceId: resolved,
  });
};

export const createFinanceAccount = (input: {
  workspaceId?: string;
  name: string;
  type: "CASH" | "BANK" | "CARD";
  currency?: string;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceAccount>(`/workspaces/${resolved}/finance/accounts`, {
    method: "POST",
    workspaceId: resolved,
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      currency: input.currency ?? "BRL",
    }),
  });
};

export const updateFinanceAccount = (input: {
  workspaceId?: string;
  id: string;
  name?: string;
  type?: "CASH" | "BANK" | "CARD";
  currency?: string;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceAccount>(
    `/workspaces/${resolved}/finance/accounts/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        currency: input.currency,
      }),
    },
  );
};

export const deleteFinanceAccount = (input: { workspaceId?: string; id: string }) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<void>(`/workspaces/${resolved}/finance/accounts/${input.id}`, {
    method: "DELETE",
    workspaceId: resolved,
  });
};

export const listFinanceTransactions = (input?: {
  workspaceId?: string;
  from?: string;
  to?: string;
  group?: "INCOME" | "EXPENSE";
  status?: "PAID" | "PENDING";
  accountId?: string;
  categoryId?: string;
  tagId?: string;
  q?: string;
}) => {
  const resolved = workspacePath(input?.workspaceId);
  const params = new URLSearchParams();
  if (input?.from) params.set("from", input.from);
  if (input?.to) params.set("to", input.to);
  if (input?.group) params.set("group", input.group);
  if (input?.status) params.set("status", input.status);
  if (input?.accountId) params.set("accountId", input.accountId);
  if (input?.categoryId) params.set("categoryId", input.categoryId);
  if (input?.tagId) params.set("tagId", input.tagId);
  if (input?.q) params.set("q", input.q);
  const query = params.toString();

  return apiFetch<FinanceTransaction[]>(
    `/workspaces/${resolved}/finance/transactions${query ? `?${query}` : ""}`,
    { workspaceId: resolved },
  );
};

export const createFinanceTransaction = (input: {
  workspaceId?: string;
  title: string;
  amount: number;
  currency?: string;
  group: "INCOME" | "EXPENSE";
  status?: "PAID" | "PENDING";
  occurredAt: string;
  description?: string | null;
  accountId?: string | null;
  categoryId?: string | null;
  tagIds?: string[] | null;
  recurringId?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceTransaction>(
    `/workspaces/${resolved}/finance/transactions`,
    {
      method: "POST",
      workspaceId: resolved,
      body: JSON.stringify({
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        group: input.group,
        status: input.status,
        occurredAt: input.occurredAt,
        description: input.description ?? null,
        accountId: input.accountId ?? null,
        categoryId: input.categoryId ?? null,
        tagIds: input.tagIds ?? null,
        recurringId: input.recurringId ?? null,
      }),
    },
  );
};

export const updateFinanceTransaction = (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  amount?: number;
  currency?: string;
  group?: "INCOME" | "EXPENSE";
  status?: "PAID" | "PENDING";
  occurredAt?: string;
  description?: string | null;
  accountId?: string | null;
  categoryId?: string | null;
  tagIds?: string[] | null;
  recurringId?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceTransaction>(
    `/workspaces/${resolved}/finance/transactions/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        group: input.group,
        status: input.status,
        occurredAt: input.occurredAt,
        description: input.description ?? null,
        accountId: input.accountId ?? null,
        categoryId: input.categoryId ?? null,
        tagIds: input.tagIds ?? null,
        recurringId: input.recurringId ?? null,
      }),
    },
  );
};

export const deleteFinanceTransaction = (input: { workspaceId?: string; id: string }) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<void>(
    `/workspaces/${resolved}/finance/transactions/${input.id}`,
    {
      method: "DELETE",
      workspaceId: resolved,
    },
  );
};

export const listFinanceRecurring = (workspaceId?: string) => {
  const resolved = workspacePath(workspaceId);
  return apiFetch<FinanceRecurring[]>(`/workspaces/${resolved}/finance/recurring`, {
    workspaceId: resolved,
  });
};

export const createFinanceRecurring = (input: {
  workspaceId?: string;
  title: string;
  amount: number;
  currency?: string;
  group: "INCOME" | "EXPENSE";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  nextDue: string;
  active?: boolean;
  accountId?: string | null;
  categoryId?: string | null;
  tagIds?: string[] | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceRecurring>(`/workspaces/${resolved}/finance/recurring`, {
    method: "POST",
    workspaceId: resolved,
    body: JSON.stringify({
      title: input.title,
      amount: input.amount,
      currency: input.currency,
      group: input.group,
      frequency: input.frequency,
      interval: input.interval,
      nextDue: input.nextDue,
      active: input.active,
      accountId: input.accountId ?? null,
      categoryId: input.categoryId ?? null,
      tagIds: input.tagIds ?? null,
    }),
  });
};

export const updateFinanceRecurring = (input: {
  workspaceId?: string;
  id: string;
  title?: string;
  amount?: number;
  currency?: string;
  group?: "INCOME" | "EXPENSE";
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  nextDue?: string;
  active?: boolean;
  accountId?: string | null;
  categoryId?: string | null;
  tagIds?: string[] | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceRecurring>(
    `/workspaces/${resolved}/finance/recurring/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        group: input.group,
        frequency: input.frequency,
        interval: input.interval,
        nextDue: input.nextDue,
        active: input.active,
        accountId: input.accountId ?? null,
        categoryId: input.categoryId ?? null,
        tagIds: input.tagIds ?? null,
      }),
    },
  );
};

export const deleteFinanceRecurring = (input: { workspaceId?: string; id: string }) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<void>(
    `/workspaces/${resolved}/finance/recurring/${input.id}`,
    {
      method: "DELETE",
      workspaceId: resolved,
    },
  );
};

export const listFinanceNotifications = (workspaceId?: string) => {
  const resolved = workspacePath(workspaceId);
  return apiFetch<FinanceNotification[]>(
    `/workspaces/${resolved}/finance/notifications`,
    { workspaceId: resolved },
  );
};

export const updateFinanceNotification = (input: {
  workspaceId?: string;
  id: string;
  readAt?: string | null;
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceNotification>(
    `/workspaces/${resolved}/finance/notifications/${input.id}`,
    {
      method: "PUT",
      workspaceId: resolved,
      body: JSON.stringify({ readAt: input.readAt ?? null }),
    },
  );
};

export const createFinanceNotification = (input: {
  workspaceId?: string;
  title: string;
  message: string;
  type?: "CARD" | "INFO";
}) => {
  const resolved = workspacePath(input.workspaceId);
  return apiFetch<FinanceNotification>(
    `/workspaces/${resolved}/finance/notifications`,
    {
      method: "POST",
      workspaceId: resolved,
      body: JSON.stringify({
        title: input.title,
        message: input.message,
        type: input.type ?? "CARD",
      }),
    },
  );
};

export const getFinanceSummary = (input?: {
  workspaceId?: string;
  from?: string;
  to?: string;
}) => {
  const resolved = workspacePath(input?.workspaceId);
  const params = new URLSearchParams();
  if (input?.from) params.set("from", input.from);
  if (input?.to) params.set("to", input.to);
  const query = params.toString();
  return apiFetch<FinanceSummary>(
    `/workspaces/${resolved}/finance/summary${query ? `?${query}` : ""}`,
    { workspaceId: resolved },
  );
};
