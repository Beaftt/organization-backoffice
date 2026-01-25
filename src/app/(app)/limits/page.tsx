"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getWorkspaceId } from "@/lib/storage/workspace";
import {
  getLimits,
  getSeatPacks,
  getSubscriptions,
  type Limit,
  type SeatPack,
  type Subscription,
} from "@/lib/api/billing";
import { getWorkspaces } from "@/lib/api/workspaces";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { getEntitlements, type Entitlement } from "@/lib/api/entitlements";
import { useLanguage } from "@/lib/i18n/language-context";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ORG: "Organization",
};

const LIMIT_META: Record<string, { suffix?: string }> = {
  "storage.gb": {
    suffix: "GB",
  },
};

export default function LimitsPage() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [workspacesTotal, setWorkspacesTotal] = useState(0);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  useEffect(() => {
    const activeWorkspaceId = getWorkspaceId();
    if (!activeWorkspaceId) {
      return;
    }

    const loadBilling = async () => {
      try {
        const [subs, packs, workspaceLimits, workspaces, memberships, entitlementsResponse] = await Promise.all([
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

  const sortedLimits = useMemo(() => {
    return [...limits].sort((a, b) => a.key.localeCompare(b.key));
  }, [limits]);

  const membersLimit = useMemo(() => {
    const limit = limits.find((item) => item.key === "members.max");
    return limit?.value ?? null;
  }, [limits]);

  const workspacesLimit = useMemo(() => {
    const limit = limits.find((item) => item.key === "workspaces.max");
    return limit?.value ?? null;
  }, [limits]);

  const integrationsEnabled = useMemo(() => {
    const entitlement = entitlements.find((item) => item.key === "module.integrations");
    return entitlement ? entitlement.value === "true" : false;
  }, [entitlements]);

  const buildUsagePercent = (used: number, limit: number | null) => {
    if (!limit || limit <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((used / limit) * 100));
  };

  const membersPercent = buildUsagePercent(membersTotal, membersLimit);
  const workspacesPercent = buildUsagePercent(workspacesTotal, workspacesLimit);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold">{t.limits.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{t.limits.subtitle}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>{t.limits.members}</span>
                <span>
                  {membersLimit === null
                    ? t.limits.unlimited
                    : `${membersTotal} ${t.limits.usedOf} ${membersLimit}`}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-200">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${membersPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>{t.limits.workspaces}</span>
                <span>
                  {workspacesLimit === null
                    ? t.limits.unlimited
                    : `${workspacesTotal} ${t.limits.usedOf} ${workspacesLimit}`}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-200">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${workspacesPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>{t.limits.integrations}</span>
                <span>
                  {integrationsEnabled
                    ? t.limits.integrationsEnabled
                    : t.limits.integrationsBlocked}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-200">
                <div
                  className={`h-2 rounded-full ${
                    integrationsEnabled ? "bg-emerald-500" : "bg-zinc-400"
                  }`}
                  style={{ width: integrationsEnabled ? "100%" : "20%" }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {sortedLimits.map((limit) => {
              const meta = LIMIT_META[limit.key];
              const suffix = meta?.suffix ? ` ${meta.suffix}` : "";
              const label =
                limit.key === "members.max"
                  ? t.limits.members
                  : limit.key === "workspaces.max"
                    ? t.limits.workspaces
                    : limit.key === "storage.gb"
                      ? t.limits.storage
                      : limit.key;
              const description =
                limit.key === "members.max"
                  ? t.limits.membersDescription
                  : limit.key === "workspaces.max"
                    ? t.limits.workspacesDescription
                    : limit.key === "storage.gb"
                      ? t.limits.storageDescription
                      : "";
              return (
                <div key={limit.id} className="rounded-xl border border-zinc-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    {label}
                  </p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {limit.value}
                    {suffix}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {description || "-"}
                  </p>
                </div>
              );
            })}
            {sortedLimits.length === 0 ? (
              <p className="text-sm text-zinc-600">
                Nenhum limite encontrado para este workspace.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">{t.limits.currentPlan}</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {activeSubscription
              ? `${PLAN_LABELS[activeSubscription.planKey] ?? activeSubscription.planKey} · ${activeSubscription.status}`
              : "-"}
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            {t.limits.seatPacks}: {seatPacks.length}
          </p>
          <Link href="/plans">
            <Button className="mt-4">{t.limits.changePlan}</Button>
          </Link>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">{t.limits.businessRules}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {t.limits.ruleWorkspacesTitle}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {t.limits.ruleWorkspacesDescription}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {t.limits.ruleRolesTitle}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {t.limits.ruleRolesDescription}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {t.limits.ruleSharingTitle}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {t.limits.ruleSharingDescription}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">{t.limits.upgradeTitle}</h2>
        <p className="mt-2 text-sm text-zinc-600">{t.limits.upgradeSubtitle}</p>
        <Link href="/plans">
          <Button className="mt-4" variant="secondary">
            {t.limits.upgradeCta}
          </Button>
        </Link>
      </Card>
    </div>
  );
}
