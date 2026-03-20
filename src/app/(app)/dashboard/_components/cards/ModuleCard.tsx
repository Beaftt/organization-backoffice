'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';
import { MODULE_CONFIG, FALLBACK_MODULE_CONFIG } from '../../_constants/moduleConfig';
import type { DashboardModule, ModuleBadgeVariant } from '../../types';

const BADGE_STYLES: Record<ModuleBadgeVariant, string> = {
  default:
    'border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]/60',
  success: 'bg-green-500/15 text-green-600',
  warning: 'bg-amber-500/15 text-amber-600',
  danger: 'bg-red-500/15 text-red-500',
};

interface ModuleCardProps {
  module: DashboardModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const { t } = useLanguage();
  const config = MODULE_CONFIG[module.key] ?? FALLBACK_MODULE_CONFIG;
  const { contextData } = module;
  const isComingSoon = !module.href;

  const inner = (
    <div
      className={[
        'group flex h-full flex-col gap-3 rounded-2xl border [border-color:var(--border)]',
        'bg-[var(--surface)] p-4 transition-[border-color] duration-150',
        isComingSoon
          ? 'cursor-default opacity-60'
          : 'cursor-pointer hover:[border-color:var(--sidebar)]',
      ].join(' ')}
    >
      {/* Header: icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            'text-sm font-bold',
            config.iconBgClass,
            config.iconTextClass,
          ].join(' ')}
          aria-hidden="true"
        >
          {config.iconLabel}
        </div>

        {isComingSoon ? (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground)]/50">
            {t.layout.comingSoon}
          </span>
        ) : contextData.badge ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[contextData.badgeVariant]}`}
          >
            {contextData.badge}
          </span>
        ) : null}
      </div>

      {/* Body: title + description */}
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-[var(--foreground)]">{module.label}</p>
        <p className="text-xs leading-relaxed text-[var(--foreground)]/50">
          {contextData.description}
        </p>
      </div>

      {/* Separator + footer row */}
      <div className="mt-auto border-t border-[var(--border)] pt-3">
        {isComingSoon ? (
          <span className="text-xs text-[var(--foreground)]/30">{contextData.subtitle}</span>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--foreground)]/40">{contextData.subtitle}</span>
            <span className="text-xs font-semibold text-[var(--sidebar)]">
              {t.dashboard.centralModuleAction} →
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return module.href ? (
    <Link href={module.href} className="block h-full">
      {inner}
    </Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

