'use client';

import { useLanguage } from '@/lib/i18n/language-context';

interface SecretsEmptyStateProps {
  hasSearch: boolean;
}

export function SecretsEmptyState({ hasSearch }: SecretsEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <tr>
      <td colSpan={5} className="py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">🔐</span>
          <p className="text-sm font-medium text-[var(--foreground)]/60">
            {hasSearch
              ? (t.secrets?.emptySearch ?? 'Nenhum segredo encontrado para esta busca.')
              : (t.secrets?.empty ?? 'Nenhum segredo cadastrado ainda.')
            }
          </p>
        </div>
      </td>
    </tr>
  );
}
