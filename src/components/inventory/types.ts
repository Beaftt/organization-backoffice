import type { InventoryItem, InventoryItemUnit, InventoryItemStatus, InventoryLocation } from '@/lib/api/inventory';

export type { InventoryItem, InventoryItemUnit, InventoryItemStatus, InventoryLocation };

export type StockStatus = 'ok' | 'low' | 'empty';
export type StockFilter = 'all' | 'low';

export function getStockStatus(apiStatus: InventoryItemStatus): StockStatus {
  if (apiStatus === 'OUT_OF_STOCK') return 'empty';
  if (apiStatus === 'LOW') return 'low';
  return 'ok';
}

export const UNIT_OPTIONS: InventoryItemUnit[] = ['UN', 'CX', 'PCT', 'KG', 'G', 'L', 'ML', 'M', 'PAR'];
