import RemindersClient from "./RemindersClient";
import type { PaginatedResponse, ReminderItem, ReminderList } from "@/lib/api/reminders";
import { serverFetch } from "@/lib/api/server-client";
import { cookies } from "next/headers";

type SearchParams = {
  listId?: string;
  workspaceId?: string;
};

export default async function RemindersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const cookieStore = await cookies();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const workspaceId =
    resolvedSearchParams?.workspaceId ?? cookieStore.get("workspace_id")?.value;

  if (!workspaceId) {
    return (
      <RemindersClient
        initialLists={[]}
        initialItemsByList={{}}
        initialSelectedId={null}
        initialError="Workspace não selecionado"
      />
    );
  }

  let lists: ReminderList[] = [];
  let itemsByList: Record<string, ReminderItem[]> = {};
  let selectedId: string | null = null;
  let error: string | null = null;

  try {
    const listResponse = await serverFetch<PaginatedResponse<ReminderList>>(
      `/workspaces/${workspaceId}/reminders/lists?page=1&pageSize=50&orderBy=updatedAt&orderDirection=desc`,
      { workspaceId },
    );
    lists = listResponse.items;

    const paramId = resolvedSearchParams?.listId ?? null;
    selectedId = lists.find((list) => list.id === paramId)?.id ?? lists[0]?.id ?? null;

    if (selectedId) {
      const itemsResponse = await serverFetch<PaginatedResponse<ReminderItem>>(
        `/workspaces/${workspaceId}/reminders/lists/${selectedId}/items?page=1&pageSize=100&orderBy=createdAt&orderDirection=asc`,
        { workspaceId },
      );
      itemsByList = { [selectedId]: itemsResponse.items };
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load reminders";
  }

  return (
    <RemindersClient
      initialLists={lists}
      initialItemsByList={itemsByList}
      initialSelectedId={selectedId}
      initialError={error}
    />
  );
}
