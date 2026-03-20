'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { FinanceTag } from '@/lib/api/finance';

interface TransactionTagSelectorProps {
  tags: FinanceTag[];
  selectedIds: string[];
  draft: string;
  addLabel: string;
  placeholderLabel: string;
  emptyLabel: string;
  suggested?: string[];
  onToggle: (tagId: string) => void;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onSuggest: (name: string) => void;
}

export function TransactionTagSelector({
  tags,
  selectedIds,
  draft,
  addLabel,
  placeholderLabel,
  emptyLabel,
  suggested = [],
  onToggle,
  onDraftChange,
  onAdd,
  onSuggest,
}: TransactionTagSelectorProps) {
  const displayTags = tags.length > 0 ? tags : null;

  return (
    <div className="grid gap-2">
      {displayTags ? (
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag) => {
            const active = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors ${
                  active
                    ? 'bg-[var(--sidebar)] text-white ring-[var(--sidebar)]'
                    : 'bg-transparent text-[var(--foreground)]/70 ring-[var(--border)] hover:ring-[var(--sidebar)]'
                }`}
                aria-pressed={active}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {suggested.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onSuggest(name)}
                className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--foreground)]/60 hover:bg-[var(--sidebar)]/10 hover:text-[var(--sidebar)]"
              >
                {name}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--foreground)]/40">{emptyLabel}</p>
        </>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          placeholder={placeholderLabel}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
        />
        <Button variant="secondary" onClick={onAdd} className="shrink-0">
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
