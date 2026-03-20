'use client';

import { useLanguage } from '@/lib/i18n/language-context';

interface SecretsHeaderProps {
  total: number;
  onNewSecret: () => void;
}

export function SecretsHeader({ total, onNewSecret }: SecretsHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
      <div>
        <h1 className="text-base font-bold text-[var(--foreground)]">
          {t.secrets?.title ?? 'Segredos'}
        </h1>
        <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
          {t.secrets?.subtitle ?? 'Armazene senhas, chaves e registros sensíveis com segurança.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Secret counter */}
        <div className="text-right">
          <p className="text-xl font-extrabold leading-none text-[var(--foreground)]">{total}</p>
          <p className="mt-0.5 text-[10px] text-[var(--foreground)]/40">
            {t.secrets?.stored ?? 'armazenados'}
          </p>
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        {/* AES-256 badge */}
        <div className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/40">
          <span className="text-xs">🔒</span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">AES-256</span>
        </div>

        <button
          type="button"
          onClick={onNewSecret}
          className="rounded-xl bg-[var(--sidebar)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          {t.secrets?.newSecret ?? 'Novo segredo'}
        </button>
      </div>
    </div>
  );
}
