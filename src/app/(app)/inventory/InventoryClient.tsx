'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiError } from '@/lib/api/client';
import {
  createInventoryLocation,
  deleteInventoryLocation,
  listInventoryItems,
  type InventoryItem,
  type InventoryLocation,
} from '@/lib/api/inventory';
import { useLanguage } from '@/lib/i18n/language-context';
import { InventoryItemCard } from './_components/InventoryItemCard';
import { InventoryQuantityModal } from './_components/InventoryQuantityModal';
import { InventoryAddItemModal } from './_components/InventoryAddItemModal';
import { InventoryEditItemModal } from './_components/InventoryEditItemModal';

interface InventoryClientProps {
  initialLocations: InventoryLocation[];
  initialError?: string | null;
}

export function InventoryClient({ initialLocations, initialError }: InventoryClientProps) {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<InventoryLocation[]>(initialLocations);
  const [selectedId, setSelectedId] = useState<string | null>(initialLocations[0]?.id ?? null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [newLocationName, setNewLocationName] = useState('');
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [consumeTarget, setConsumeTarget] = useState<InventoryItem | null>(null);
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);

  const loadItems = useCallback(async (locationId: string) => {
    setIsLoadingItems(true);
    setError(null);
    try {
      const res = await listInventoryItems({ locationId });
      setItems(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.loadError);
    } finally {
      setIsLoadingItems(false);
    }
  }, [t]);

  useEffect(() => {
    if (selectedId) loadItems(selectedId);
    else setItems([]);
  }, [selectedId, loadItems]);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    setIsAddingLocation(true);
    try {
      const loc = await createInventoryLocation({ name: newLocationName.trim() });
      setLocations((prev) => [...prev, loc]);
      setNewLocationName('');
      if (!selectedId) setSelectedId(loc.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.saveError);
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await deleteInventoryLocation({ id });
      setLocations((prev) => prev.filter((l) => l.id !== id));
      if (selectedId === id) setSelectedId(locations.find((l) => l.id !== id)?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.deleteError);
    }
  };

  const handleItemUpdated = (updated: InventoryItem) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const handleItemDeleted = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const handleItemCreated = (item: InventoryItem) => {
    setItems((prev) => [item, ...prev]);
    setShowAddItem(false);
  };

  return (
    <div className="page-transition flex flex-col gap-6 p-4 md:p-6">
      <SectionHeader title={t.inventory.title} description={t.inventory.subtitle} />

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Locations panel */}
        <Card className="flex w-full flex-col gap-3 md:w-64 md:shrink-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">{t.inventory.locationsTitle}</p>
          <ul className="flex flex-col gap-1">
            {locations.map((loc) => (
              <li key={loc.id}>
                <button
                  onClick={() => setSelectedId(loc.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedId === loc.id
                      ? 'bg-[var(--sidebar)] text-white'
                      : 'text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <span className="truncate">{loc.icon ? `${loc.icon} ` : ''}{loc.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              placeholder={t.inventory.locationPlaceholder}
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
            />
            <Button variant="secondary" onClick={handleAddLocation} disabled={isAddingLocation || !newLocationName.trim()}>
              +
            </Button>
          </div>
        </Card>

        {/* Items panel */}
        <div className="flex flex-1 flex-col gap-4">
          {selectedId && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.inventory.itemsTitle}</p>
              <Button onClick={() => setShowAddItem(true)}>{t.inventory.addItem}</Button>
            </div>
          )}

          {isLoadingItems && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" aria-hidden="true" />
              ))}
            </div>
          )}

          {!isLoadingItems && selectedId && items.length === 0 && (
            <Card className="py-12 text-center text-sm text-[var(--foreground)] opacity-60">
              {t.inventory.emptyItems}
            </Card>
          )}

          {!isLoadingItems && !selectedId && (
            <Card className="py-12 text-center text-sm text-[var(--foreground)] opacity-60">
              {t.inventory.selectLocation}
            </Card>
          )}

          {!isLoadingItems && items.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onConsume={() => setConsumeTarget(item)}
                  onRestock={() => setRestockTarget(item)}
                  onEdit={() => setEditTarget(item)}
                  onDeleted={() => handleItemDeleted(item.id)}
                  onError={setError}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {consumeTarget && (
        <InventoryQuantityModal
          mode="consume"
          item={consumeTarget}
          onClose={() => setConsumeTarget(null)}
          onSuccess={(updated) => { handleItemUpdated(updated); setConsumeTarget(null); }}
          onError={setError}
        />
      )}

      {restockTarget && (
        <InventoryQuantityModal
          mode="restock"
          item={restockTarget}
          onClose={() => setRestockTarget(null)}
          onSuccess={(updated) => { handleItemUpdated(updated); setRestockTarget(null); }}
          onError={setError}
        />
      )}

      {showAddItem && selectedId && (
        <InventoryAddItemModal
          locationId={selectedId}
          onClose={() => setShowAddItem(false)}
          onCreated={handleItemCreated}
          onError={setError}
        />
      )}

      {editTarget && (
        <InventoryEditItemModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={(updated) => { handleItemUpdated(updated); setEditTarget(null); }}
          onError={setError}
        />
      )}
    </div>
  );
}
