'use client';

import type { ReactNode } from 'react';

interface FinanceModeHeaderProps {
  eyebrow: string;
  title: string;
  meta?: string[];
  actions?: ReactNode;
}

export function FinanceModeHeader({
  eyebrow,
  title,
  meta = [],
  actions,
}: FinanceModeHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] border [border-color:var(--border)] bg-[var(--surface)] px-4 py-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="grid gap-2">
        <div className="grid gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
            {eyebrow}
          </p>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        </div>

        {meta.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]/65"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}