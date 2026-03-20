'use client';

import { useRef } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  disabled: boolean;
  placeholder: string;
};

export function ListAddItemInline({ value, onChange, onAdd, disabled, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-shrink-0 border-t border-[var(--border)] px-4 py-3">
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-[var(--border)] px-3 py-2 transition-colors hover:border-[var(--sidebar)]">
        {/* Decorative unchecked checkbox */}
        <div className="h-4 w-4 shrink-0 rounded-[4px] border-[1.5px] border-zinc-300" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none"
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled || !value.trim()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--sidebar)] text-white transition-opacity disabled:opacity-40 hover:opacity-90"
          aria-label="Add"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  );
}
