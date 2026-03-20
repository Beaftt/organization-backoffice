'use client';

import type { InventoryItem, InventoryLocation } from '@/components/inventory/types';
import { LocationSidebarItem } from '@/components/inventory/sidebar/LocationSidebarItem';
import { LocationEmptyState } from '@/components/inventory/sidebar/LocationEmptyState';

type Props = {
  locations: InventoryLocation[];
  selectedId: string | null;
  itemsByLocation: Record<string, InventoryItem[]>;
  editLocationId: string | null;
  editLocationName: string;
  isSavingLocation: boolean;
  newLocationName: string;
  isNewLocationOpen: boolean;
  isAddingLocation: boolean;
  onSelectLocation: (id: string) => void;
  onEditStart: (loc: InventoryLocation) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onEditNameChange: (v: string) => void;
  onDeleteLocation: (loc: InventoryLocation) => void;
  onNewLocationNameChange: (v: string) => void;
  onAddLocation: () => void;
  onToggleNewLocation: () => void;
  labels: {
    newLocation: string;
    noLocations: string;
    noLocationsHint: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
  };
};

export function LocationsSidebar({
  locations,
  selectedId,
  itemsByLocation,
  editLocationId,
  editLocationName,
  isSavingLocation,
  newLocationName,
  isNewLocationOpen,
  isAddingLocation,
  onSelectLocation,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditNameChange,
  onDeleteLocation,
  onNewLocationNameChange,
  onAddLocation,
  onToggleNewLocation,
  labels,
}: Props) {
  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-muted)]">
      <div className="flex-1 overflow-y-auto py-2">
        {locations.length === 0 ? (
          <LocationEmptyState
            noLocationsTitle={labels.noLocations}
            noLocationsHint={labels.noLocationsHint}
          />
        ) : (
          <div className="flex flex-col gap-0.5">
            {locations.map((loc) => (
              <LocationSidebarItem
                key={loc.id}
                location={loc}
                items={itemsByLocation[loc.id]}
                isSelected={selectedId === loc.id}
                isEditing={editLocationId === loc.id}
                editName={editLocationName}
                isSaving={isSavingLocation}
                onSelect={() => onSelectLocation(loc.id)}
                onEditStart={() => onEditStart(loc)}
                onEditSave={() => onEditSave(loc.id)}
                onEditCancel={onEditCancel}
                onEditNameChange={onEditNameChange}
                onDelete={() => onDeleteLocation(loc)}
                labels={labels}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] p-2">
        {isNewLocationOpen ? (
          <div className="flex gap-1">
            <input
              autoFocus
              type="text"
              value={newLocationName}
              onChange={(e) => onNewLocationNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddLocation();
                if (e.key === 'Escape') onToggleNewLocation();
              }}
              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--sidebar)]"
              placeholder="Nome..."
            />
            <button
              onClick={onAddLocation}
              disabled={isAddingLocation || !newLocationName.trim()}
              className="rounded-lg bg-[var(--sidebar)] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isAddingLocation ? '…' : '✓'}
            </button>
            <button
              onClick={onToggleNewLocation}
              className="rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleNewLocation}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {labels.newLocation}
          </button>
        )}
      </div>
    </aside>
  );
}
