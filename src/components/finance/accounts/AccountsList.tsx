'use client';

import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceAccount } from '@/lib/api/finance';

function accountInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const accountTypeColors: Record<string, string> = {
  BANK: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CASH: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CARD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

interface AccountsListProps {
  accounts: FinanceAccount[];
  isSaving?: boolean;
  onAdd: () => void;
  onEdit: (account: FinanceAccount) => void;
  onDelete: (account: FinanceAccount) => void;
}

export function AccountsList({ accounts, isSaving, onAdd, onEdit, onDelete }: AccountsListProps) {
  const { t } = useLanguage();

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed [border-color:var(--border)] px-6 py-10 text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]/60">
          {t.finance.accountEmpty ?? t.finance.empty}
        </p>
        <p className="mt-1 text-xs text-[var(--foreground)]/40">
          {t.finance.accountAddMore ?? 'Adicione suas contas para visualizar o saldo unificado.'}
        </p>
        <Button className="mt-4" onClick={onAdd}>
          {t.finance.newAccount ?? t.finance.accountLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {accounts.map((account) => {
        const colorClass = accountTypeColors[account.type] ?? 'bg-zinc-100 text-zinc-600';
        return (
          <div
            key={account.id}
            className="list-item-animate flex flex-wrap items-center justify-between gap-3 rounded-2xl border [border-color:var(--border)] px-4 py-3 transition-colors hover:bg-[var(--surface-muted)]"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorClass}`}
                aria-hidden="true"
              >
                {accountInitials(account.name)}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                  {account.name}
                  {account.isPrimary ? (
                    <span className="rounded-full bg-[var(--sidebar)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--sidebar)]">
                      {t.finance.setPrimary ?? 'Principal'}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--foreground)]/50">
                  {account.type} · {account.currency ?? 'BRL'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onEdit(account)} aria-label={t.finance.editAction}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onDelete(account)}
                disabled={isSaving}
                aria-label={t.finance.deleteAction}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </Button>
            </div>
          </div>
        );
      })}

      <div className="flex justify-center pt-1">
        <Button variant="secondary" onClick={onAdd}>
          + {t.finance.newAccount ?? t.finance.accountLabel}
        </Button>
      </div>
    </div>
  );
}
