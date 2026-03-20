'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/lib/i18n/language-context';
import { CategoryBar } from '../cards/CategoryBar';
import type { DashboardExpenseCategory } from '../../types';

const MAX_VISIBLE = 4;

interface DashboardCategoriesPanelProps {
  categories: DashboardExpenseCategory[];
  isLoading: boolean;
  formatValue: (v: number) => string;
}

export function DashboardCategoriesPanel({
  categories,
  isLoading,
  formatValue,
}: DashboardCategoriesPanelProps) {
  const { t } = useLanguage();

  const visible = categories.slice(0, MAX_VISIBLE);
  const overflow = categories.length - MAX_VISIBLE;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
        {t.dashboard.categsTitle}
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--foreground)]/40">{t.dashboard.categsEmpty}</p>
          <Link
            href="/finance"
            className="text-xs font-semibold text-[var(--sidebar)] underline-offset-2 hover:underline"
          >
            {t.dashboard.categsAddCta} →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visible.map((cat) => (
              <CategoryBar key={cat.id} category={cat} formatValue={formatValue} />
            ))}
          </div>
          {overflow > 0 && (
            <Link
              href="/finance"
              className="text-xs text-[var(--foreground)]/40 underline-offset-2 hover:text-[var(--sidebar)] hover:underline"
            >
              + {overflow} {t.dashboard.categsViewMore}
            </Link>
          )}
          {categories.length >= 1 &&
            categories.every((c) => c.name === t.dashboard.categsNone) && (
              <div className="border-t border-[var(--border)] pt-3">
                <Link
                  href="/finance"
                  className="text-xs font-semibold text-[var(--sidebar)] underline-offset-2 hover:underline"
                >
                  + {t.dashboard.categsAddCta} →
                </Link>
              </div>
            )}
        </>
      )}
    </Card>
  );
}
