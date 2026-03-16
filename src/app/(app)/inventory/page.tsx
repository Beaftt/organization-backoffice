import { cookies } from 'next/headers';
import { InventoryClient } from './InventoryClient';
import { serverFetch } from '@/lib/api/server-client';
import type { InventoryLocation } from '@/lib/api/inventory';

export default async function InventoryPage() {
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get('workspace_id')?.value;

  if (!workspaceId) {
    return (
      <InventoryClient
        initialLocations={[]}
        initialError="Workspace não selecionado"
      />
    );
  }

  let locations: InventoryLocation[] = [];
  let error: string | null = null;

  try {
    locations = await serverFetch<InventoryLocation[]>(
      `/workspaces/${workspaceId}/inventory/locations`,
      { workspaceId },
    );
  } catch (err) {
    error = err instanceof Error ? err.message : 'Não foi possível carregar o inventário.';
  }

  return <InventoryClient initialLocations={locations} initialError={error} />;
}
