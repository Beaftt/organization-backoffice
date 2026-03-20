'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceTag, FinanceCategory } from '@/lib/api/finance';

interface ManageRecordsModalProps {
  open: boolean;
  tags: FinanceTag[];
  categories: FinanceCategory[];
  onClose: () => void;
  onUpdateTag: (id: string, name: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string, group: 'INCOME' | 'EXPENSE') => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function ManageRecordsModal({
  open,
  tags,
  categories,
  onClose,
  onUpdateTag,
  onDeleteTag,
  onUpdateCategory,
  onDeleteCategory,
}: ManageRecordsModalProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'tags' | 'types'>('tags');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingGroup, setEditingGroup] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [rowError, setRowError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!open) return null;

  const handleStartEdit = (id: string, name: string, group?: 'INCOME' | 'EXPENSE') => {
    setEditingId(id);
    setEditingName(name);
    setEditingGroup(group ?? 'EXPENSE');
    setRowError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setRowError(null);
  };

  const handleSaveTag = async (id: string) => {
    if (!editingName.trim()) return;
    setSaving(true);
    setRowError(null);
    try {
      await onUpdateTag(id, editingName.trim());
      setEditingId(null);
    } catch {
      setRowError(t.finance.saveError ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    setDeleting(id);
    setRowError(null);
    try {
      await onDeleteTag(id);
    } catch {
      setRowError(t.finance.saveError ?? 'Erro ao excluir');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveCategory = async (id: string) => {
    if (!editingName.trim()) return;
    setSaving(true);
    setRowError(null);
    try {
      await onUpdateCategory(id, editingName.trim(), editingGroup);
      setEditingId(null);
    } catch {
      setRowError(t.finance.saveError ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setDeleting(id);
    setRowError(null);
    try {
      await onDeleteCategory(id);
    } catch {
      setRowError(t.finance.saveError ?? 'Erro ao excluir');
    } finally {
      setDeleting(null);
    }
  };

  return createPortal(
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar"
        className="modal-overlay fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Centered modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="modal-content w-full max-w-md flex flex-col bg-[var(--surface)] rounded-2xl shadow-2xl"
          style={{ maxHeight: '85vh', overflow: 'hidden' }}
          role="dialog"
          aria-modal="true"
          aria-label={t.finance.manageRecords ?? 'Gerenciar registros'}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b [border-color:var(--border)] px-5 py-4">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {t.finance.manageRecords ?? 'Gerenciar registros'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.finance.close ?? 'Fechar'}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/50 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-0 border-b [border-color:var(--border)] px-5">
            <button
              type="button"
              onClick={() => { setTab('tags'); handleCancelEdit(); }}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === 'tags'
                  ? 'border-[var(--sidebar)] text-[var(--sidebar)]'
                  : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
              }`}
            >
              {t.finance.tagsLabel ?? 'Tags'}
            </button>
            <button
              type="button"
              onClick={() => { setTab('types'); handleCancelEdit(); }}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === 'types'
                  ? 'border-[var(--sidebar)] text-[var(--sidebar)]'
                  : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
              }`}
            >
              {t.finance.typeLabel ?? 'Tipos'}
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {rowError ? (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--expense)]">{rowError}</p>
            ) : null}

            {tab === 'tags' && (
              <div className="grid gap-2">
                {tags.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--foreground)]/40">
                    {t.finance.tagsEmpty ?? 'Nenhuma tag encontrada'}
                  </p>
                ) : (
                  tags.map((tag) =>
                    editingId === tag.id ? (
                      <div key={tag.id} className="flex items-center gap-2 rounded-xl border [border-color:var(--border)] bg-[var(--surface-muted)] px-3 py-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTag(tag.id); if (e.key === 'Escape') handleCancelEdit(); }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTag(tag.id)}
                          disabled={saving}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sidebar)] text-white transition hover:brightness-110 disabled:opacity-50"
                          aria-label={t.finance.save ?? 'Salvar'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                          aria-label={t.finance.cancel ?? 'Cancelar'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div key={tag.id} className="flex items-center justify-between gap-2 rounded-xl border [border-color:var(--border)] px-3 py-2.5 transition hover:bg-[var(--surface-muted)]">
                        <span className="flex-1 text-sm text-[var(--foreground)]">{tag.name}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(tag.id, tag.name)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                            aria-label={`${t.finance.editAction ?? 'Editar'} ${tag.name}`}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={deleting === tag.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                            aria-label={`Excluir ${tag.name}`}
                          >
                            {deleting === tag.id ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                                <path d="M12 2a10 10 0 0 1 10 10" />
                              </svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            )}

            {tab === 'types' && (
              <div className="grid gap-2">
                {categories.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--foreground)]/40">
                    {t.finance.typeLabel ?? 'Nenhum tipo encontrado'}
                  </p>
                ) : (
                  categories.map((category) =>
                    editingId === category.id ? (
                      <div key={category.id} className="grid gap-2 rounded-xl border [border-color:var(--border)] bg-[var(--surface-muted)] px-3 py-3">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') handleCancelEdit(); }}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
                            {t.finance.groupLabel ?? 'Grupo'}
                            <select
                              value={editingGroup}
                              onChange={(e) => setEditingGroup(e.target.value as 'INCOME' | 'EXPENSE')}
                              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            >
                              <option value="INCOME">{t.finance.groupIncome ?? 'Receita'}</option>
                              <option value="EXPENSE">{t.finance.groupExpense ?? 'Despesa'}</option>
                            </select>
                          </label>
                          <div className="flex gap-1 self-end pb-0.5">
                            <button
                              type="button"
                              onClick={() => handleSaveCategory(category.id)}
                              disabled={saving}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sidebar)] text-white transition hover:brightness-110 disabled:opacity-50"
                              aria-label={t.finance.save ?? 'Salvar'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                              aria-label={t.finance.cancel ?? 'Cancelar'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={category.id} className="flex items-center justify-between gap-2 rounded-xl border [border-color:var(--border)] px-3 py-2.5 transition hover:bg-[var(--surface-muted)]">
                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              category.group === 'INCOME'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {category.group === 'INCOME'
                              ? (t.finance.groupIncome ?? 'Receita')
                              : (t.finance.groupExpense ?? 'Despesa')}
                          </span>
                          <span className="truncate text-sm text-[var(--foreground)]">{category.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(category.id, category.name, category.group)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                            aria-label={`${t.finance.editAction ?? 'Editar'} ${category.name}`}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={deleting === category.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground)]/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                            aria-label={`Excluir ${category.name}`}
                          >
                            {deleting === category.id ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                                <path d="M12 2a10 10 0 0 1 10 10" />
                              </svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t [border-color:var(--border)] px-5 py-4">
            <div className="flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                {t.finance.close ?? 'Fechar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
