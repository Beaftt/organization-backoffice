'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getWorkspaceId } from '@/lib/storage/workspace';
import {
  getLimits,
  getSeatPacks,
  getSubscriptions,
  type Limit,
  type SeatPack,
  type Subscription,
} from '@/lib/api/billing';
import { getWorkspaces } from '@/lib/api/workspaces';
import { getWorkspaceMemberships } from '@/lib/api/workspace-memberships';
import { getEntitlements, type Entitlement } from '@/lib/api/entitlements';
import { useLanguage } from '@/lib/i18n/language-context';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  BUSINESS: 'Business',
};

const LIMIT_META: Record<string, { suffix?: string }> = {
  'storage.gb': { suffix: 'GB' },
  'documents.files.max': {},
  'reminders.lists.max': {},
  'secrets.records.max': {},
  'finance.accounts.max': {},
  'calendar.integrations.max': {},
};

function getBarColor(percent: number): string {
  if (percent >= 95) return 'bg-red-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-blue-500';
}

export default function LimitsClient() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [workspacesTotal, setWorkspacesTotal] = useState(0);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  useEffect(() => {
    const activeWorkspaceId = getWorkspaceId();
    if (!activeWorkspaceId) return;

    const loadBilling = async () => {
      try {
        const [subs, packs, workspaceLimits, workspaces, memberships, entitlementsResponse] =
          await Promise.all([
            getSubscriptions(activeWorkspaceId),
            getSeatPacks(activeWorkspaceId),
            getLimits(activeWorkspaceId),
            getWorkspaces({ page: 1, pageSize: 100 }),
            getWorkspaceMemberships(activeWorkspaceId),
            getEntitlements(activeWorkspaceId),
          ]);

        setSubscriptions(subs.items);
        setSeatPacks(packs.items);
        setLimits(workspaceLimits.items);
        setWorkspacesTotal(workspaces.total);
        setMembersTotal(memberships.total);
        setEntitlements(entitlementsResponse.items);
      } catch {
        setSubscriptions([]);
        setSeatPacks([]);
        setLimits([]);
        setWorkspacesTotal(0);
        setMembersTotal(0);
        setEntitlements([]);
      }
    };

    loadBilling();
  }, []);

  const activeSubscription = subscriptions[0];

  const sortedLimits = useMemo(
    () => [...limits].sort((a, b) => a.key.localeCompare(b.key)),
    [limits],
  );

  const membersLimit = useMemo(() => {
    const limit = limits.find((item) => item.key === 'members.max');
    return limit?.value ?? null;
  }, [limits]);

  const workspacesLimit = useMemo(() => {
    const limit = limits.find((item) => item.key === 'workspaces.max');
    return limit?.value ?? null;
  }, [limits]);

  const integrationsEnabled = useMemo(() => {
    const entitlement = entitlements.find((item) => item.key === 'module.integrations');
    return entitlement ? entitlement.value === 'true' : false;
  }, [entitlements]);

  const buildUsagePercent = (used: number, limit: number | null) => {
    if (!limit || limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const membersPercent = buildUsagePercent(membersTotal, membersLimit);
  const workspacesPercent = buildUsagePercent(workspacesTotal, workspacesLimit);

  const getLimitLabel = (key: string): string => {
    const map: Record<string, string> = {
      'members.max': t.limits.members,
      'workspaces.max': t.limits.workspaces,
      'storage.gb': t.limits.storage,
      'documents.files.max': t.limits.documentsFiles,
      'reminders.lists.max': t.limits.remindersLists,
      'secrets.records.max': t.limits.secretsRecords,
      'finance.accounts.max': t.limits.financeAccounts,
      'calendar.integrations.max': t.limits.calendarIntegrations,
    };
    return map[key] ?? key;
  };

  const getLimitDescription = (key: string): string => {
    const map: Record<string, string> = {
      'members.max': t.limits.membersDescription,
      'workspaces.max': t.limits.workspacesDescription,
      'storage.gb': t.limits.storageDescription,
      'documents.files.max': t.limits.documentsFilesDescription,
      'reminders.lists.max': t.limits.remindersListsDescription,
      'secrets.records.max': t.limits.secretsRecordsDescription,
      'finance.accounts.max': t.limits.financeAccountsDescription,
      'calendar.integrations.max': t.limits.calendarIntegrationsDescription,
    };
    return map[key] ?? '';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Usage panel */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{t.limits.title}</h2>
            <p className="mt-1 text-sm text-[var(--foreground)]/50">{t.limits.subtitle}</p>

            {/* Summary bars */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Members */}
              <div className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground)]/70">{t.limits.members}</span>
                  <span className="text-xs text-[var(--foreground)]/50">
                    {membersLimit === null || membersLimit <= 0
                      ? t.limits.unlimited
                      : `${membersTotal} ${t.limits.usedOf} ${membersLimit}`}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--surface-muted)]">
                  <div
                    className={`h-2 rounded-full ${membersLimit === null || membersLimit <= 0 ? 'bg-blue-500' : getBarColor(membersPercent)}`}
                    style={{ width: `${membersLimit === null || membersLimit <= 0 ? 100 : membersPercent}%` }}
                  />
                </div>
              </div>

              {/* Workspaces */}
              <div className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground)]/70">{t.limits.workspaces}</span>
                  <span className="text-xs text-[var(--foreground)]/50">
                    {workspacesLimit === null || workspacesLimit <= 0
                      ? t.limits.unlimited
                      : `${workspacesTotal} ${t.limits.usedOf} ${workspacesLimit}`}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--surface-muted)]">
                  <div
                    className={`h-2 rounded-full ${workspacesLimit === null || workspacesLimit <= 0 ? 'bg-blue-500' : getBarColor(workspacesPercent)}`}
                    style={{ width: `${workspacesLimit === null || workspacesLimit <= 0 ? 100 : workspacesPercent}%` }}
                  />
                </div>
              </div>

              {/* Integrations */}
              <div className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] p-4 sm:col-span-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground)]/70">{t.limits.integrations}</span>
                  <span className="text-xs text-[var(--foreground)]/50">
                    {integrationsEnabled ? t.limits.integrationsEnabled : t.limits.integrationsBlocked}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--surface-muted)]">
                  <div
                    className={`h-2 rounded-full ${integrationsEnabled ? 'bg-blue-500' : 'bg-zinc-400'}`}
                    style={{ width: integrationsEnabled ? '100%' : '20%' }}
                  />
                </div>
              </div>
            </div>

            {/* Detail grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {sortedLimits.map((limit) => {
                const meta = LIMIT_META[limit.key];
                const suffix = meta?.suffix ? ` ${meta.suffix}` : '';
                return (
                  <div
                    key={limit.id}
                    className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] p-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-[var(--foreground)]/40">
                      {getLimitLabel(limit.key)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                      {limit.value <= 0 ? t.limits.unlimited : limit.value}
                      {suffix}
                    </p>
                    <p className="mt-1 text-xs text-[var(--foreground)]/50">
                      {getLimitDescription(limit.key) || '—'}
                    </p>
                  </div>
                );
              })}
              {sortedLimits.length === 0 && (
                <p className="col-span-2 text-sm text-[var(--foreground)]/50">
                  {t.limits.noLimitsFound}
                </p>
              )}
            </div>
          </Card>

          {/* Business rules */}
          <Card>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {t.limits.businessRules}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="text-xs uppercase tracking-wide text-[var(--foreground)]/40">
                  {t.limits.ruleWorkspacesTitle}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)]/70">
                  {t.limits.ruleWorkspacesDescription}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="text-xs uppercase tracking-wide text-[var(--foreground)]/40">
                  {t.limits.ruleRolesTitle}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)]/70">
                  {t.limits.ruleRolesDescription}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="text-xs uppercase tracking-wide text-[var(--foreground)]/40">
                  {t.limits.ruleSharingTitle}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)]/70">
                  {t.limits.ruleSharingDescription}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5">
          {/* Current plan card */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/40">
              {t.limits.currentPlan}
            </p>
            <p className="mt-2 text-xl font-bold text-[var(--foreground)]">
              {activeSubscription
                ? (PLAN_LABELS[activeSubscription.planKey] ?? activeSubscription.planKey)
                : '—'}
            </p>
            <p className="mt-1 text-xs text-[var(--foreground)]/50">
              {activeSubscription ? activeSubscription.status : t.settings.planNoActive}
            </p>
            <p className="mt-3 text-sm text-[var(--foreground)]/70">
              {t.limits.seatPacks}:{' '}
              <span className="font-medium">{seatPacks.length}</span>
            </p>
            <Link href="/plans" className="mt-4 block">
              <Button className="w-full" variant="primary">
                {t.limits.changePlan}
              </Button>
            </Link>
          </Card>

          {/* Upgrade callout */}
          <Card className="border [border-color:var(--sidebar)]">
            <p className="text-sm font-semibold text-[var(--sidebar)]">{t.limits.upgradeTitle}</p>
            <p className="mt-1 text-xs text-[var(--foreground)]/50">{t.limits.upgradeSubtitle}</p>
            <Link href="/plans" className="mt-4 block">
              <Button className="w-full" variant="primary">
                {t.limits.upgradeCta}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
