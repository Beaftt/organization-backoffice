'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency, formatDateShort } from '@/lib/utils/currency';
import { EntryTypeIcon } from './EntryTypeIcon';
import { EntryStatusBadge } from './EntryStatusBadge';
import type { FinanceTransaction, FinanceCategory } from '@/lib/api/finance';

interface EntryRowProps {
  item: FinanceTransaction;
  index: number;
  category?: FinanceCategory;
  disabled?: boolean;
  onEdit: (item: FinanceTransaction) => void;
  onDelete: (item: FinanceTransaction) => void;
}

export function EntryRow({ item, index, category, disabled, onEdit, onDelete }: EntryRowProps) {
  const { t } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isIncome = item.group === 'INCOME';
  const groupColor = isIncome ? 'text-[var(--income)]' : 'text-[var(--expense)]';

  return (
    <div
      className="list-item-animate flex flex-wrap items-center justify-between gap-4 rounded-2xl border [border-color:var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface-muted)]"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center gap-3">
        <EntryTypeIcon title={item.title} group={item.group} />
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
          <p className="text-xs text-[var(--foreground)]/50">
            {category?.name ?? t.finance.tagsEmpty} ·{' '}
            {formatDateShort(item.occurredAt)}
            {item.installmentIndex && item.installmentTotal
              ? ` · ${item.installmentIndex}/${item.installmentTotal}x`
              : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-sm font-bold ${groupColor}`}>
            {isIncome ? '+' : '-'}
            {formatCurrency(item.amount, item.currency ?? 'BRL')}
          </p>
          <EntryStatusBadge status={item.status} />
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--foreground)]/60">
              {t.finance.deleteConfirmation ?? 'Excluir?'}
            </span>
            <Button
              variant="danger"
              onClick={() => { setConfirmDelete(false); onDelete(item); }}
              disabled={disabled}
            >
              {t.finance.deleteAction}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              {t.finance.cancel}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onEdit(item)} aria-label={t.finance.editAction}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              aria-label={t.finance.deleteAction}
              disabled={disabled}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
