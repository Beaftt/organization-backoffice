'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  listInventoryItems,
  createInventoryLocation,
  updateInventoryLocation,
  deleteInventoryLocation,
  deleteInventoryItem,
  type InventoryItem,
  type InventoryLocation,
} from '@/lib/api/inventory';
import { useLanguage } from '@/lib/i18n/language-context';
import type { StockFilter } from '@/components/inventory/types';

type Props = {
  initialLocations: InventoryLocation[];
  initialError?: string | null;
};

export function useInventoryState({ initialLocations, initialError }: Props) {
  const { t } = useLanguage();

  // locations
  const [locations, setLocations] = useState<InventoryLocation[]>(initialLocations);
  const [selectedId, setSelectedId] = useState<string | null>(initialLocations[0]?.id ?? null);
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [editLocationName, setEditLocationName] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isNewLocationOpen, setIsNewLocationOpen] = useState(false);
  const [deleteLocationTarget, setDeleteLocationTarget] = useState<InventoryLocation | null>(null);

  // items
  const [itemsByLocation, setItemsByLocation] = useState<Record<string, InventoryItem[]>>({});
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // filters
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  // item modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [consumeTarget, setConsumeTarget] = useState<InventoryItem | null>(null);
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<InventoryItem | null>(null);

  // error
  const [error, setError] = useState<string | null>(initialError ?? null);

  // computed
  const selectedLocation = locations.find((l) => l.id === selectedId) ?? null;
  const allItems = selectedId ? (itemsByLocation[selectedId] ?? []) : [];
  const lowStockCount = allItems.filter((i) => i.status === 'LOW' || i.status === 'OUT_OF_STOCK').length;
  const filteredItems = allItems
    .filter((i) =>
      stockFilter === 'low' ? i.status === 'LOW' || i.status === 'OUT_OF_STOCK' : true,
    )
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || (i.brand ?? '').toLowerCase().includes(q);
    });

  const loadItems = useCallback(
    async (locationId: string) => {
      setIsLoadingItems(true);
      setError(null);
      try {
        const res = await listInventoryItems({ locationId });
        setItemsByLocation((prev) => ({ ...prev, [locationId]: res.items }));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.inventory.loadError);
      } finally {
        setIsLoadingItems(false);
      }
    },
    [t.inventory.loadError],
  );

  useEffect(() => {
    if (selectedId) {
      setSearch('');
      setStockFilter('all');
      loadItems(selectedId);
    }
  }, [selectedId, loadItems]);

  const handleSelectLocation = (id: string) => setSelectedId(id);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    setIsAddingLocation(true);
    try {
      const loc = await createInventoryLocation({ name: newLocationName.trim() });
      setLocations((prev) => [...prev, loc]);
      setNewLocationName('');
      setIsNewLocationOpen(false);
      setSelectedId((prev) => prev ?? loc.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.saveError);
    } finally {
      setIsAddingLocation(false);
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

  const handleConfirmDeleteLocation = useCallback(async () => {
    if (!deleteLocationTarget) return;
    const id = deleteLocationTarget.id;
    try {
      await deleteInventoryLocation({ id });
      setLocations((prev) => {
        const next = prev.filter((l) => l.id !== id);
        setSelectedId((curr) => (curr === id ? (next[0]?.id ?? null) : curr));
        return next;
      });
      setItemsByLocation((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.locationDeleteError);
    } finally {
      setDeleteLocationTarget(null);
    }
  }, [deleteLocationTarget, t.inventory.locationDeleteError]);

  const handleItemCreated = useCallback((item: InventoryItem) => {
    setItemsByLocation((prev) => ({
      ...prev,
      [item.locationId]: [item, ...(prev[item.locationId] ?? [])],
    }));
  }, []);

  const handleItemUpdated = useCallback((updated: InventoryItem) => {
    setItemsByLocation((prev) => ({
      ...prev,
      [updated.locationId]: (prev[updated.locationId] ?? []).map((i) =>
        i.id === updated.id ? updated : i,
      ),
    }));
  }, []);

  const handleConfirmDeleteItem = useCallback(async () => {
    if (!deleteItemTarget) return;
    const { id, locationId } = deleteItemTarget;
    try {
      await deleteInventoryItem({ id });
      setItemsByLocation((prev) => ({
        ...prev,
        [locationId]: (prev[locationId] ?? []).filter((i) => i.id !== id),
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.inventory.deleteError);
    } finally {
      setDeleteItemTarget(null);
    }
  }, [deleteItemTarget, t.inventory.deleteError]);

  return {
    t,
    // locations
    locations,
    selectedId,
    selectedLocation,
    handleSelectLocation,
    editLocationId,
    setEditLocationId,
    editLocationName,
    setEditLocationName,
    isSavingLocation,
    newLocationName,
    setNewLocationName,
    isAddingLocation,
    isNewLocationOpen,
    setIsNewLocationOpen,
    deleteLocationTarget,
    setDeleteLocationTarget,
    handleAddLocation,
    handleStartEditLocation,
    handleSaveLocation,
    handleConfirmDeleteLocation,
    // items
    itemsByLocation,
    isLoadingItems,
    allItems,
    filteredItems,
    lowStockCount,
    // filters
    search,
    setSearch,
    stockFilter,
    setStockFilter,
    // modals
    isAddItemOpen,
    setIsAddItemOpen,
    editTarget,
    setEditTarget,
    consumeTarget,
    setConsumeTarget,
    restockTarget,
    setRestockTarget,
    deleteItemTarget,
    setDeleteItemTarget,
    // error
    error,
    setError,
    // item handlers
    handleItemCreated,
    handleItemUpdated,
    handleConfirmDeleteItem,
  };
}
