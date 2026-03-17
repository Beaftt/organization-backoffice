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
  updateInventoryLocation,
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
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [editLocationName, setEditLocationName] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);
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
  }, [t.inventory.loadError]);

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
    if (!window.confirm(t.inventory.locationDeleteConfirm)) return;
    try {
      await deleteInventoryLocation({ id });
      setLocations((prev) => prev.filter((l) => l.id !== id));
      if (selectedId === id) setSelectedId(locations.find((l) => l.id !== id)?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.locationDeleteError);
    }
  };

  const handleStartEditLocation = (loc: InventoryLocation) => {
    setEditLocationId(loc.id);
    setEditLocationName(loc.name);
  };

  const handleSaveLocation = async (id: string) => {
    if (!editLocationName.trim()) return;
    setIsSavingLocation(true);
    try {
      const updated = await updateInventoryLocation({ id, name: editLocationName.trim() });
      setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditLocationId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.locationEditError);
    } finally {
      setIsSavingLocation(false);
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
                {editLocationId === loc.id ? (
                  <div className="flex items-center gap-1 rounded-lg px-1 py-1">
                    <input
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--sidebar)]"
                      value={editLocationName}
                      onChange={(e) => setEditLocationName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLocation(loc.id);
                        if (e.key === 'Escape') setEditLocationId(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveLocation(loc.id)}
                      disabled={isSavingLocation || !editLocationName.trim()}
                      className="shrink-0 rounded-md bg-[var(--sidebar)] px-2 py-1 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      aria-label={t.inventory.locationSave}
                    >
                      {isSavingLocation ? '…' : '✓'}
                    </button>
                    <button
                      onClick={() => setEditLocationId(null)}
                      className="shrink-0 rounded-md px-1.5 py-1 text-xs text-zinc-400 transition hover:text-[var(--foreground)]"
                      aria-label={t.inventory.cancel}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className={`group flex w-full items-center gap-1 rounded-lg transition-colors ${
                    selectedId === loc.id
                      ? 'bg-[var(--sidebar)]'
                      : 'hover:bg-[var(--surface-muted)]'
                  }`}>
                    <button
                      onClick={() => setSelectedId(loc.id)}
                      className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${
                        selectedId === loc.id ? 'text-white' : 'text-[var(--foreground)]'
                      }`}
                    >
                      {loc.icon ? `${loc.icon} ` : ''}{loc.name}
                    </button>
                    <button
                      onClick={() => handleStartEditLocation(loc)}
                      className={`shrink-0 rounded p-1 opacity-0 transition group-hover:opacity-100 ${
                        selectedId === loc.id ? 'text-white/70 hover:text-white' : 'text-zinc-400 hover:text-[var(--foreground)]'
                      }`}
                      aria-label={t.inventory.locationEdit}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className={`shrink-0 rounded p-1 opacity-0 transition group-hover:opacity-100 ${
                        selectedId === loc.id ? 'text-white/70 hover:text-red-300' : 'text-zinc-400 hover:text-red-500'
                      }`}
                      aria-label={t.inventory.delete}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                )}
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
