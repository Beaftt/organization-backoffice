import { apiFetch } from '@/lib/api/client';
import { getWorkspaceId } from '@/lib/storage/workspace';

// ─── Types ───────────────────────────────────────────────────────────────────

export type InventoryItemUnit = 'UN' | 'CX' | 'PCT' | 'KG' | 'G' | 'L' | 'ML' | 'M' | 'PAR';
export type InventoryItemStatus = 'IN_STOCK' | 'LOW' | 'OUT_OF_STOCK';
export type InventoryAutoAddTrigger = 'LOW' | 'OUT_OF_STOCK';
export type InventoryMovementType = 'RESTOCK' | 'CONSUME';
export type InventoryMovementSource = 'MANUAL' | 'SHOPPING_LIST';

export type InventoryLocation = {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type InventoryCategory = {
  id: string;
  workspaceId: string;
  locationId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  workspaceId: string;
  locationId: string;
  categoryId?: string | null;
  name: string;
  brand?: string | null;
  unit: InventoryItemUnit;
  quantity: number;
  minimumQuantity: number;
  status: InventoryItemStatus;
  notes?: string | null;
  reminderListId?: string | null;
  autoAddToList: boolean;
  autoAddTrigger?: InventoryAutoAddTrigger | null;
  autoAddQuantity?: number | null;
  lastPurchasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItemsResponse = {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type InventoryMovementsResponse = {
  items: InventoryMovement[];
  total: number;
  page: number;
  pageSize: number;
};

export type InventoryMovement = {
  id: string;
  itemId: string;
  type: InventoryMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  notes?: string | null;
  source: InventoryMovementSource;
  sourceReferenceId?: string | null;
  createdBy: string;
  createdAt: string;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getWorkspaceOrThrow = (inputId?: string) => {
  const workspaceId = inputId ?? getWorkspaceId();
  if (!workspaceId) throw new Error('Workspace não selecionado');
  return workspaceId;
};

// ─── Locations ────────────────────────────────────────────────────────────────

export const listInventoryLocations = async (params: { workspaceId?: string } = {}) => {
  const workspaceId = getWorkspaceOrThrow(params.workspaceId);
  return apiFetch<InventoryLocation[]>(
    `/workspaces/${workspaceId}/inventory/locations`,
    { workspaceId },
  );
};

export const createInventoryLocation = async (input: {
  name: string;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
  workspaceId?: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<InventoryLocation>(`/workspaces/${workspaceId}/inventory/locations`, {
    method: 'POST',
    body: JSON.stringify({ name: input.name, icon: input.icon, color: input.color, sortOrder: input.sortOrder }),
    workspaceId,
  });
};

export const updateInventoryLocation = async (input: {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  workspaceId?: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<InventoryLocation>(`/workspaces/${workspaceId}/inventory/locations/${input.id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: input.name, icon: input.icon, color: input.color }),
    workspaceId,
  });
};

export const deleteInventoryLocation = async (input: { id: string; workspaceId?: string }) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  await apiFetch<void>(`/workspaces/${workspaceId}/inventory/locations/${input.id}`, {
    method: 'DELETE',
    workspaceId,
  });
};

// ─── Items ────────────────────────────────────────────────────────────────────

export const listInventoryItems = async (params: {
  workspaceId?: string;
  locationId?: string;
  categoryId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) => {
  const workspaceId = getWorkspaceOrThrow(params.workspaceId);
  const query = new URLSearchParams();
  if (params.locationId) query.set('locationId', params.locationId);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.q) query.set('q', params.q);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 50));
  return apiFetch<InventoryItemsResponse>(
    `/workspaces/${workspaceId}/inventory/items?${query}`,
    { workspaceId },
  );
};

export const createInventoryItem = async (input: {
  workspaceId?: string;
  locationId: string;
  categoryId?: string | null;
  name: string;
  brand?: string | null;
  unit: InventoryItemUnit;
  quantity?: number;
  minimumQuantity?: number;
  notes?: string | null;
  reminderListId?: string | null;
  autoAddToList?: boolean;
  autoAddTrigger?: InventoryAutoAddTrigger | null;
  autoAddQuantity?: number | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { workspaceId: _w, ...body } = input;
  return apiFetch<InventoryItem>(`/workspaces/${workspaceId}/inventory/items`, {
    method: 'POST',
    body: JSON.stringify(body),
    workspaceId,
  });
};

export const updateInventoryItem = async (input: {
  id: string;
  workspaceId?: string;
  name?: string;
  brand?: string | null;
  unit?: InventoryItemUnit;
  minimumQuantity?: number;
  notes?: string | null;
  reminderListId?: string | null;
  autoAddToList?: boolean;
  autoAddTrigger?: InventoryAutoAddTrigger | null;
  autoAddQuantity?: number | null;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, workspaceId: _w, ...body } = input;
  return apiFetch<InventoryItem>(`/workspaces/${workspaceId}/inventory/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    workspaceId,
  });
};

export const deleteInventoryItem = async (input: { id: string; workspaceId?: string }) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  await apiFetch<void>(`/workspaces/${workspaceId}/inventory/items/${input.id}`, {
    method: 'DELETE',
    workspaceId,
  });
};

export const consumeInventoryItem = async (input: {
  id: string;
  quantity: number;
  notes?: string | null;
  workspaceId?: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<InventoryItem>(
    `/workspaces/${workspaceId}/inventory/items/${input.id}/consume`,
    {
      method: 'POST',
      body: JSON.stringify({ quantity: input.quantity, notes: input.notes }),
      workspaceId,
    },
  );
};

export const restockInventoryItem = async (input: {
  id: string;
  quantity: number;
  notes?: string | null;
  sourceReminderItemId?: string | null;
  workspaceId?: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  return apiFetch<InventoryItem>(
    `/workspaces/${workspaceId}/inventory/items/${input.id}/restock`,
    {
      method: 'POST',
      body: JSON.stringify({
        quantity: input.quantity,
        notes: input.notes,
        sourceReminderItemId: input.sourceReminderItemId,
      }),
      workspaceId,
    },
  );
};

export const sendInventoryItemToShoppingList = async (input: {
  id: string;
  quantity: number;
  notes?: string | null;
  workspaceId?: string;
}) => {
  const workspaceId = getWorkspaceOrThrow(input.workspaceId);
  await apiFetch<void>(
    `/workspaces/${workspaceId}/inventory/items/${input.id}/send-to-list`,
    {
      method: 'POST',
      body: JSON.stringify({ quantity: input.quantity, notes: input.notes }),
      workspaceId,
    },
  );
};

export const listInventoryMovements = async (params: {
  itemId: string;
  workspaceId?: string;
  page?: number;
  pageSize?: number;
}) => {
  const workspaceId = getWorkspaceOrThrow(params.workspaceId);
  const query = new URLSearchParams();
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 20));
  return apiFetch<InventoryMovementsResponse>(
    `/workspaces/${workspaceId}/inventory/items/${params.itemId}/movements?${query}`,
    { workspaceId },
  );
};
