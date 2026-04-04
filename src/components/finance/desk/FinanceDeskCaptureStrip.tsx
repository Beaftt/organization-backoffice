'use client';

import { Card } from '@/components/ui/Card';
import type { FinanceComposerIntent } from '@/lib/navigation/finance-composer-route-state';

type FinanceDeskCaptureStripProps = {
  onOpenComposer: (intent: FinanceComposerIntent) => void;
};

const quickActions: Array<{
  intent: FinanceComposerIntent;
  label: string;
  description: string;
}> = [
  {
    intent: 'expense',
    label: 'Débito / Pix',
    description: 'Despesa imediata da conta ou Pix.',
  },
  {
    intent: 'credit',
    label: 'Crédito',
    description: 'Compra que segue para a fatura.',
  },
  {
    intent: 'income',
    label: 'Receita',
    description: 'Entrada direta do mês atual.',
  },
  {
    intent: 'transfer',
    label: 'Transferência',
    description: 'Movimento imediato sem categoria padrão.',
  },
];

export function FinanceDeskCaptureStrip({
  onOpenComposer,
}: FinanceDeskCaptureStripProps) {
  return (
    <Card className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
          Entrada rápida
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
          Comece pela rota certa
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.intent}
            type="button"
            onClick={() => onOpenComposer(action.intent)}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition-colors hover:bg-[var(--surface-muted)]"
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">{action.label}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--foreground)]/58">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </Card>
  );
}