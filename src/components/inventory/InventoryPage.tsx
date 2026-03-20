'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useInventoryState } from '@/components/inventory/hooks/useInventoryState';
import { LocationsSidebar } from '@/components/inventory/sidebar/LocationsSidebar';
import { InventoryMainPanel } from '@/components/inventory/main-panel/InventoryMainPanel';
import { AddItemDrawer } from '@/components/inventory/drawers/AddItemDrawer';
import { ConsumeItemModal } from '@/components/inventory/modals/ConsumeItemModal';
import { RestockItemModal } from '@/components/inventory/modals/RestockItemModal';
import { DeleteItemConfirm } from '@/components/inventory/modals/DeleteItemConfirm';
import { DeleteLocationConfirm } from '@/components/inventory/modals/DeleteLocationConfirm';
import type { InventoryLocation } from '@/lib/api/inventory';

type Props = {
  initialLocations: InventoryLocation[];
  initialError?: string | null;
};

export default function InventoryPage({ initialLocations, initialError }: Props) {
  const { t } = useLanguage();
  const s = useInventoryState({ initialLocations, initialError });
  const inv = t.inventory;

  const sidebarLabels = {
    newLocation: inv.newLocation ?? inv.locationPlaceholder,
    noLocations: inv.noLocations ?? inv.selectLocation,
    noLocationsHint: inv.noLocationsHint ?? '',
    edit: inv.locationEdit,
    delete: inv.delete,
    save: inv.locationSave,
    cancel: inv.cancel,
  };

  const panelLabels = {
    addItem: inv.addItemLabel ?? inv.addItem,
    searchItems: inv.searchItems ?? '',
    items: inv.itemsLabel ?? inv.itemsTitle.toLowerCase(),
    itemSingular: 'item',
    lowStockSummary: inv.lowStockCount ?? inv.statusLow,
    belowMinStock: inv.belowMinStock ?? inv.statusLow,
    viewAll: inv.viewAll ?? inv.confirm,
    noBrand: inv.noBrand ?? '',
    min: inv.minLabel,
    lastPurchased: inv.lastPurchased,
    consume: inv.consume,
    restock: inv.restock,
    delete: inv.delete,
    emptyLocation: inv.emptyLocation ?? inv.emptyItems,
    emptyLocationHint: inv.emptyLocationHint ?? '',
    status: {
      ok: inv.statusInStock,
      low: inv.statusLow,
      empty: inv.statusOutOfStock,
    },
  };

  return (
    <div className="page-transition flex flex-col gap-4 p-4 md:p-6">
      <SectionHeader title={inv.title} description={inv.subtitle} />

      {s.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{s.error}</p>
      ) : null}

      <div className="flex min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <LocationsSidebar
          locations={s.locations}
          selectedId={s.selectedId}
          itemsByLocation={s.itemsByLocation}
          editLocationId={s.editLocationId}
          editLocationName={s.editLocationName}
          isSavingLocation={s.isSavingLocation}
          newLocationName={s.newLocationName}
          isNewLocationOpen={s.isNewLocationOpen}
          isAddingLocation={s.isAddingLocation}
          onSelectLocation={s.handleSelectLocation}
          onEditStart={s.handleStartEditLocation}
          onEditSave={s.handleSaveLocation}
          onEditCancel={() => s.setEditLocationId(null)}
          onEditNameChange={s.setEditLocationName}
          onDeleteLocation={(loc) => s.setDeleteLocationTarget(loc)}
          onNewLocationNameChange={s.setNewLocationName}
          onAddLocation={s.handleAddLocation}
          onToggleNewLocation={() => s.setIsNewLocationOpen(!s.isNewLocationOpen)}
          labels={sidebarLabels}
        />

        <div className="flex min-h-0 flex-1">
          {s.selectedLocation ? (
            <InventoryMainPanel
              location={s.selectedLocation}
              items={s.filteredItems}
              allItemsCount={s.allItems.length}
              lowStockCount={s.lowStockCount}
              isLoading={s.isLoadingItems}
              search={s.search}
              onSearchChange={s.setSearch}
              onShowLowStock={() => s.setStockFilter('low')}
              onAddItem={() => s.setIsAddItemOpen(true)}
              onConsume={(item) => s.setConsumeTarget(item)}
              onRestock={(item) => s.setRestockTarget(item)}
              onEdit={(item) => s.setEditTarget(item)}
              onDelete={(item) => s.setDeleteItemTarget(item)}
              labels={panelLabels}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-[var(--foreground)]/50">{inv.selectLocation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Item Drawer */}
      {(s.isAddItemOpen || s.editTarget !== null) && (
        <AddItemDrawer
          item={s.editTarget}
          locationId={s.selectedId}
          locations={s.locations}
          onClose={() => {
            s.setIsAddItemOpen(false);
            s.setEditTarget(null);
          }}
          onCreated={(item) => {
            s.handleItemCreated(item);
            s.setIsAddItemOpen(false);
          }}
          onUpdated={(item) => {
            s.handleItemUpdated(item);
            s.setEditTarget(null);
          }}
          onError={s.setError}
        />
      )}

      {/* Consume */}
      {s.consumeTarget && (
        <ConsumeItemModal
          item={s.consumeTarget}
          onClose={() => s.setConsumeTarget(null)}
          onSuccess={(updated) => {
            s.handleItemUpdated(updated);
            s.setConsumeTarget(null);
          }}
          onError={s.setError}
        />
      )}

      {/* Restock */}
      {s.restockTarget && (
        <RestockItemModal
          item={s.restockTarget}
          onClose={() => s.setRestockTarget(null)}
          onSuccess={(updated) => {
            s.handleItemUpdated(updated);
            s.setRestockTarget(null);
          }}
          onError={s.setError}
        />
      )}

      {/* Delete item */}
      {s.deleteItemTarget && (
        <DeleteItemConfirm
          item={s.deleteItemTarget}
          onClose={() => s.setDeleteItemTarget(null)}
          onConfirm={s.handleConfirmDeleteItem}
        />
      )}

      {/* Delete location */}
      {s.deleteLocationTarget && (
        <DeleteLocationConfirm
          location={s.deleteLocationTarget}
          onClose={() => s.setDeleteLocationTarget(null)}
          onConfirm={s.handleConfirmDeleteLocation}
        />
      )}
    </div>
  );
}
