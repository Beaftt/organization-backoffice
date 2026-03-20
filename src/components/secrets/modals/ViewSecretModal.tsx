'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import { getSecret } from '@/lib/api/secrets';
import type { SecretDetails, SecretSummary } from '../types';
import { VIEW_FIELD_GROUPS } from '../types';
import { SecretTypeBadge } from '../table/SecretTypeBadge';
import { CopyButton } from '../shared/CopyButton';
import { RevealButton } from '../shared/RevealButton';
import { Skeleton } from '@/components/ui/Skeleton';

interface ViewSecretModalProps {
  summary: SecretSummary | null;
  isLoading: boolean;
  loadError: string | null;
  details: SecretDetails | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ViewSecretModal({
  summary,
  isLoading,
  loadError,
  details,
  onClose,
  onEdit,
  onDelete,
}: ViewSecretModalProps) {
  const { t } = useLanguage();
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});

  const isOpen = Boolean(summary);

  const handleReveal = useCallback(async (fieldKey: string) => {
    if (!details) return;
    // Never log the secret value
    const value = fieldKey === 'secret'
      ? details.secret
      : String((details as unknown as Record<string, unknown>)[fieldKey] ?? '');

    setRevealedValues((prev) => ({ ...prev, [fieldKey]: value }));
    setRevealedFields((prev) => new Set(prev).add(fieldKey));

    // Auto-hide after 30s
    setTimeout(() => {
      setRevealedFields((prev) => {
        const next = new Set(prev);
        next.delete(fieldKey);
        return next;
      });
      setRevealedValues((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }, 30_000);
  }, [details]);

  const handleCopy = useCallback(async (fieldKey: string) => {
    if (!summary) return;
    // Always fetch fresh from API — never copy a revealed in-memory value
    const fresh = await getSecret({ id: summary.id });
    const value = fieldKey === 'secret'
      ? fresh.secret
      : String((fresh as unknown as Record<string, unknown>)[fieldKey] ?? '');
    // Never log secret values
    await navigator.clipboard.writeText(value);
  }, [summary]);

  if (!isOpen) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) { setRevealedFields(new Set()); onClose(); } }}
    >
      <div className="modal-content flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="space-y-1">
            {summary ? (
              <h2 className="text-base font-bold text-[var(--foreground)]">{summary.title}</h2>
            ) : (
              <Skeleton className="h-5 w-40" />
            )}
            {summary ? <SecretTypeBadge type={summary.type} /> : null}
          </div>
          <button
            type="button"
            onClick={() => { setRevealedFields(new Set()); onClose(); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-[var(--border)] px-5 py-2">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : loadError ? (
            <p className="py-6 text-center text-sm text-red-500">{loadError}</p>
          ) : details ? (
            <>
              {VIEW_FIELD_GROUPS[details.type].map((field) => {
                // Non-sensitive fields: use summary (guaranteed from list endpoint);
                // sensitive fields (secret): use details (decrypted value from API)
                const source: Record<string, unknown> = !field.isSensitive && summary
                  ? (summary as unknown as Record<string, unknown>)
                  : (details as unknown as Record<string, unknown>);
                const rawValue = String(source[field.key] ?? '');
                if (!rawValue || rawValue === 'null') return null;

                const isRevealed = revealedFields.has(field.key);
                const displayValue = isRevealed
                  ? revealedValues[field.key] ?? rawValue
                  : null;

                // Resolve label
                const parts = field.labelKey.split('.');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- traversal
                let node: any = t;
                for (const part of parts) node = node?.[part];
                const label = typeof node === 'string' ? node : field.key;

                return (
                  <div key={field.key} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                        {label}
                      </p>
                      {field.isSensitive ? (
                        <p className="font-mono text-sm text-[var(--foreground)]/60">
                          {isRevealed && displayValue
                            ? <span className="break-all text-[var(--foreground)]">{displayValue}</span>
                            : <span className="tracking-widest">••••••••</span>
                          }
                        </p>
                      ) : (
                        <p className="break-all text-sm text-[var(--foreground)]">{rawValue}</p>
                      )}
                    </div>

                    {field.isSensitive ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <RevealButton
                          isRevealed={isRevealed}
                          onReveal={() => handleReveal(field.key)}
                        />
                        <CopyButton onCopy={() => handleCopy(field.key)} size="xs" />
                      </div>
                    ) : (
                      <CopyButton onCopy={() => navigator.clipboard.writeText(rawValue)} size="xs" />
                    )}
                  </div>
                );
              })}

              {/* Timestamps */}
              <div className="flex justify-between py-3 text-xs text-[var(--foreground)]/40">
                <span>{t.secrets?.created ?? 'Criado em'}: {formatDate(details.createdAt)}</span>
                <span>{t.secrets?.updated ?? 'Atualizado'}: {formatDate(details.updatedAt)}</span>
              </div>

              {/* Security warning */}
              <div className="my-1 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/30">
                <span className="mt-0.5 text-sm">⚠</span>
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  {t.secrets?.shareWarning ?? 'Nunca compartilhe este segredo por e-mail ou chat.'}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {details ? (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                ✕ {t.secrets?.delete ?? 'Excluir'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 transition hover:bg-[var(--surface-muted)]"
              >
                ✎ {t.secrets?.edit ?? 'Editar'}
              </button>
              <button
                type="button"
                onClick={() => { setRevealedFields(new Set()); onClose(); }}
                className="rounded-xl bg-[var(--sidebar)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                {t.secrets?.close ?? 'Fechar'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
