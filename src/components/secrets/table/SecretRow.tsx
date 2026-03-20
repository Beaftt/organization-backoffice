'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { SecretSummary } from '../types';
import { SecretTypeIcon } from './SecretTypeIcon';
import { SecretTypeBadge } from './SecretTypeBadge';
import { SecretMaskedValue } from './SecretMaskedValue';

interface SecretRowProps {
  item: SecretSummary;
  index: number;
  onView: (item: SecretSummary) => void;
  onEdit: (item: SecretSummary) => void;
  onDelete: (item: SecretSummary) => void;
}

export function SecretRow({ item, index, onView, onEdit, onDelete }: SecretRowProps) {
  const { t } = useLanguage();

  const formattedDate = new Date(item.updatedAt).toLocaleDateString('pt-BR');

  return (
    <tr className="list-item-animate group border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]/50 transition-colors">
      {/* # */}
      <td className="w-8 py-3 pl-5 pr-2 text-xs text-[var(--foreground)]/30 tabular-nums">
        {index + 1}
      </td>

      {/* Icon + title + url */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <SecretTypeIcon type={item.type} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
            {item.url ? (
              <p className="truncate text-[10.5px] text-[var(--foreground)]/40">{item.url}</p>
            ) : null}
          </div>
        </div>
      </td>

      {/* Masked value + copy */}
      <td className="py-3 pr-4">
        <SecretMaskedValue secretId={item.id} />
      </td>

      {/* Type badge */}
      <td className="py-3 pr-4">
        <SecretTypeBadge type={item.type} />
      </td>

      {/* Updated date */}
      <td className="py-3 pr-4 text-xs text-[var(--foreground)]/50">{formattedDate}</td>

      {/* Actions */}
      <td className="py-3 pl-2 pr-5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onView(item)}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            {t.secrets?.view ?? 'Ver'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            title={t.secrets?.edit ?? 'Editar'}
            className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10.5px] font-semibold text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            title={t.secrets?.delete ?? 'Excluir'}
            className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10.5px] font-semibold text-[var(--foreground)]/60 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}
