'use client';

import InventoryPage from '@/components/inventory/InventoryPage';
import type { InventoryLocation } from '@/lib/api/inventory';

interface InventoryClientProps {
  initialLocations: InventoryLocation[];
  initialError?: string | null;
}

export function InventoryClient({ initialLocations, initialError }: InventoryClientProps) {
  return <InventoryPage initialLocations={initialLocations} initialError={initialError} />;
}
