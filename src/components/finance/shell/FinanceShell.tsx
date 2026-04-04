'use client';

import type { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { useLanguage } from '@/lib/i18n/language-context';
import {
  buildFinanceHref,
  parseFinanceRouteState,
  resolveFinanceSurfaceFromPathname,
  type FinanceSurface,
} from '@/lib/navigation/finance-route-state';

type FinanceShellProps = {
  children: ReactNode;
};

export function FinanceShell({ children }: FinanceShellProps) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSurface = resolveFinanceSurfaceFromPathname(pathname);
  const routeState = parseFinanceRouteState(
    new URLSearchParams(searchParams.toString()),
    activeSurface,
  );
  const financeSurfaceItems: Array<{ surface: FinanceSurface; label: string }> =
    language === 'pt'
      ? [
          { surface: 'desk', label: 'Painel' },
          { surface: 'insights', label: 'Análises' },
          { surface: 'setup', label: 'Ajustes' },
        ]
      : [
          { surface: 'desk', label: 'Desk' },
          { surface: 'insights', label: 'Insights' },
          { surface: 'setup', label: 'Setup' },
        ];

  return (
    <div className="page-transition flex flex-col gap-4">
      <div className="rounded-[24px] border [border-color:var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm sm:px-5">
        <div className="flex flex-wrap items-center gap-2 rounded-full bg-[var(--surface-muted)] p-1">
          {financeSurfaceItems.map((item) => {
            const isActive = item.surface === activeSurface;

            return (
              <Link
                key={item.surface}
                href={buildFinanceHref(item.surface, routeState)}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30 ${
                  isActive
                    ? 'bg-[var(--sidebar)] text-[var(--sidebar-text)] shadow-sm'
                    : 'text-[var(--foreground)]/65 hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}