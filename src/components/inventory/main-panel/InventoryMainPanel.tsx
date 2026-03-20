'use client';

import type { InventoryItem, InventoryLocation } from '@/components/inventory/types';
import { InventoryHeader } from '@/components/inventory/main-panel/InventoryHeader';
import { LowStockAlertBar } from '@/components/inventory/main-panel/LowStockAlertBar';
import { ItemsGrid } from '@/components/inventory/main-panel/ItemsGrid';

type PanelLabels = {
  addItem: string;
  searchItems: string;
  items: string;
  itemSingular: string;
  lowStockSummary: string;
  belowMinStock: string;
  viewAll: string;
  noBrand: string;
  min: string;
  lastPurchased: string;
  consume: string;
  restock: string;
  delete: string;
  emptyLocation: string;
  emptyLocationHint: string;
  status: { ok: string; low: string; empty: string };
};

type Props = {
  location: InventoryLocation;
  items: InventoryItem[];
  allItemsCount: number;
  lowStockCount: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onShowLowStock: () => void;
  onAddItem: () => void;
  onConsume: (item: InventoryItem) => void;
  onRestock: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  labels: PanelLabels;
};

export function InventoryMainPanel({
  location,
  items,
  allItemsCount,
  lowStockCount,
  isLoading,
  search,
  onSearchChange,
  onShowLowStock,
  onAddItem,
  onConsume,
  onRestock,
  onEdit,
  onDelete,
  labels,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InventoryHeader
        location={location}
        totalCount={allItemsCount}
        lowStockCount={lowStockCount}
        search={search}
        onSearchChange={onSearchChange}
        onAddItem={onAddItem}
        labels={{
          addItem: labels.addItem,
          searchItems: labels.searchItems,
          items: labels.items,
          itemSingular: labels.itemSingular,
          lowStockCount: labels.lowStockSummary,
        }}
      />
      <LowStockAlertBar
        count={lowStockCount}
        onShowLowStock={onShowLowStock}
        labels={{
          belowMinStock: labels.belowMinStock,
          viewAll: labels.viewAll,
          items: labels.items,
        }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ItemsGrid
          items={items}
          isLoading={isLoading}
          onConsume={onConsume}
          onRestock={onRestock}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddItem={onAddItem}
          labels={{
            noBrand: labels.noBrand,
            min: labels.min,
            lastPurchased: labels.lastPurchased,
            consume: labels.consume,
            restock: labels.restock,
            delete: labels.delete,
            addItem: labels.addItem,
            emptyLocation: labels.emptyLocation,
            emptyLocationHint: labels.emptyLocationHint,
            status: labels.status,
          }}
        />
      </div>
    </div>
  );
}
