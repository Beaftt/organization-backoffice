'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  createSecret,
  deleteSecret,
  getSecret,
  listSecrets,
  updateSecret,
} from '@/lib/api/secrets';
import { ApiError } from '@/lib/api/client';
import type { SecretDetails, SecretSummary, TypeFilter, SortOption, SortDirection } from './types';
import { SecretsHeader } from './header/SecretsHeader';
import { SecretsToolbar } from './toolbar/SecretsToolbar';
import { SecretsTable } from './table/SecretsTable';
import { CreateSecretModal } from './modals/CreateSecretModal';
import { ViewSecretModal } from './modals/ViewSecretModal';
import { DeleteSecretConfirm } from './modals/DeleteSecretConfirm';
import type { SecretFormValues } from './form/SecretForm';

const PAGE_SIZE = 6;

const EMPTY_FORM: SecretFormValues = {
  title: '',
  type: 'ACCOUNT',
  username: '',
  url: '',
  port: '',
  secret: '',
  notes: '',
};

interface SecretsPageProps {
  initialQuery?: string;
  initialType?: TypeFilter;
  initialSort?: SortOption;
  initialDirection?: SortDirection;
  initialPage?: number;
}

export function SecretsPage({
  initialQuery = '',
  initialType = 'all',
  initialSort = 'updatedAt',
  initialDirection = 'desc',
  initialPage = 1,
}: SecretsPageProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // List state
  const [records, setRecords] = useState<SecretSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);
  const [page, setPage] = useState(initialPage);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<SecretFormValues>(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // View modal
  const [viewSummary, setViewSummary] = useState<SecretSummary | null>(null);
  const [viewDetails, setViewDetails] = useState<SecretDetails | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  // Edit modal (reuses create modal)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<SecretFormValues>(EMPTY_FORM);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<SecretSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async (overridePage?: number) => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await listSecrets({
        page: overridePage ?? page,
        pageSize: PAGE_SIZE,
        orderBy: sortBy,
        orderDirection: sortDirection,
        type: typeFilter === 'all' ? undefined : typeFilter,
        query: query.trim() || undefined,
      });
      setRecords(res.items);
      setTotal(res.total);
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : (t.secrets?.loadError ?? 'Erro ao carregar.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, sortDirection, typeFilter, query, t]);

  useEffect(() => { load(); }, [load]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (sortBy !== 'updatedAt') params.set('sort', sortBy);
    if (sortDirection !== 'desc') params.set('direction', sortDirection);
    if (page !== 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(`/secrets${qs ? `?${qs}` : ''}`);
  }, [query, typeFilter, sortBy, sortDirection, page, router]);

  // --- Filter handlers ---
  const handleTypeChange = (t: TypeFilter) => { setTypeFilter(t); setPage(1); };
  const handleSearch = (v: string) => { setQuery(v); setPage(1); };
  const handleSort = (sort: SortOption, dir: SortDirection) => { setSortBy(sort); setSortDirection(dir); setPage(1); };

  // --- Create ---
  const openCreate = () => { setCreateForm(EMPTY_FORM); setCreateError(null); setIsCreateOpen(true); };
  const closeCreate = () => { setIsCreateOpen(false); setCreateError(null); };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.title.trim() || !createForm.secret.trim()) {
      setCreateError(t.secrets?.requiredError ?? 'Preencha o título e o segredo.');
      return;
    }
    setIsCreating(true);
    try {
      await createSecret({
        title: createForm.title.trim(),
        type: createForm.type,
        secret: createForm.secret,
        username: createForm.username.trim() || undefined,
        url: createForm.type === 'SERVER'
          ? (createForm.url.trim()
              ? createForm.url.trim() + (createForm.port.trim() ? ':' + createForm.port.trim() : '')
              : undefined)
          : (createForm.url.trim() || undefined),
        notes: createForm.notes.trim() || undefined,
      });
      closeCreate();
      setPage(1);
      await load(1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : (t.secrets?.saveError ?? 'Erro ao salvar.'));
    } finally {
      setIsCreating(false);
    }
  };

  // --- View ---
  const handleView = async (item: SecretSummary) => {
    setViewSummary(item);
    setViewDetails(null);
    setViewError(null);
    setIsLoadingView(true);
    try {
      const details = await getSecret({ id: item.id });
      setViewDetails(details);
    } catch (err) {
      setViewError(err instanceof ApiError ? err.message : (t.secrets?.loadError ?? 'Erro ao carregar.'));
    } finally {
      setIsLoadingView(false);
    }
  };

  const closeView = () => {
    setViewSummary(null);
    setViewDetails(null);
    setViewError(null);
  };

  // --- Edit (from row or from view modal) ---
  const openEdit = (item: SecretSummary, details?: SecretDetails) => {
    const rawUrl = details?.url ?? item.url ?? '';
    let parsedUrl = rawUrl;
    let parsedPort = '';
    if (item.type === 'SERVER' && rawUrl) {
      const lastColon = rawUrl.lastIndexOf(':');
      if (lastColon >= 0 && /^\d+$/.test(rawUrl.slice(lastColon + 1))) {
        parsedUrl = rawUrl.slice(0, lastColon);
        parsedPort = rawUrl.slice(lastColon + 1);
      }
    }
    setEditTargetId(item.id);
    setEditForm({
      title: item.title,
      type: item.type,
      username: details?.username ?? item.username ?? '',
      url: parsedUrl,
      port: parsedPort,
      secret: details?.secret ?? '',
      notes: details?.notes ?? item.notes ?? '',
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const closeEdit = () => { setIsEditOpen(false); setEditError(null); };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTargetId) return;
    setEditError(null);
    if (!editForm.title.trim() || !editForm.secret.trim()) {
      setEditError(t.secrets?.requiredError ?? 'Preencha o título e o segredo.');
      return;
    }
    setIsUpdating(true);
    try {
      const updated = await updateSecret({
        id: editTargetId,
        title: editForm.title.trim(),
        type: editForm.type,
        secret: editForm.secret,
        username: editForm.username.trim() || null,
        url: editForm.type === 'SERVER'
          ? (editForm.url.trim()
              ? editForm.url.trim() + (editForm.port.trim() ? ':' + editForm.port.trim() : '')
              : null)
          : (editForm.url.trim() || null),
        notes: editForm.notes.trim() || null,
      });
      closeEdit();
      // Refresh view if it's open with the same item
      if (viewSummary?.id === editTargetId) {
        setViewDetails(updated);
        setViewSummary((prev) => prev ? { ...prev, ...updated } : null);
      }
      await load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : (t.secrets?.updateError ?? 'Erro ao atualizar.'));
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Delete ---
  const openDelete = (item: SecretSummary) => { setDeleteTarget(item); };
  const closeDelete = () => { setDeleteTarget(null); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSecret({ id: deleteTarget.id });
      closeDelete();
      if (viewSummary?.id === deleteTarget.id) closeView();
      await load(1);
    } catch {
      // Error is silent here — toast system would be better, but out of scope
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-transition flex flex-col overflow-hidden rounded-2xl border border-[var(--border)]">
      <SecretsHeader total={total} onNewSecret={openCreate} />

      <SecretsToolbar
        typeFilter={typeFilter}
        search={query}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onTypeChange={handleTypeChange}
        onSearchChange={handleSearch}
        onSortChange={handleSort}
      />

      <SecretsTable
        records={records}
        total={total}
        page={page}
        isLoading={isLoading}
        error={listError}
        hasSearch={Boolean(query.trim()) || typeFilter !== 'all'}
        onView={handleView}
        onEdit={(item) => {
          const details = viewDetails?.id === item.id ? viewDetails : undefined;
          openEdit(item, details);
        }}
        onDelete={openDelete}
        onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setPage((p) => p + 1)}
      />

      <CreateSecretModal
        open={isCreateOpen}
        values={createForm}
        onChange={setCreateForm}
        onSubmit={handleCreate}
        onClose={closeCreate}
        isSubmitting={isCreating}
        error={createError}
      />

      <CreateSecretModal
        open={isEditOpen}
        values={editForm}
        onChange={setEditForm}
        onSubmit={handleEdit}
        onClose={closeEdit}
        isSubmitting={isUpdating}
        error={editError}
        isEdit
      />

      <ViewSecretModal
        summary={viewSummary}
        isLoading={isLoadingView}
        loadError={viewError}
        details={viewDetails}
        onClose={closeView}
        onEdit={() => {
          if (viewSummary) {
            openEdit(viewSummary, viewDetails ?? undefined);
            closeView();
          }
        }}
        onDelete={() => {
          if (viewSummary) {
            closeView();
            openDelete(viewSummary);
          }
        }}
      />

      <DeleteSecretConfirm
        secret={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </div>
  );
}
