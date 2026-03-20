"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getWorkspaceId } from "@/lib/storage/workspace";
import {
  getSeatPacks,
  getSubscriptions,
  type SeatPack,
  type Subscription,
} from "@/lib/api/billing";
import { getWorkspaces, removeWorkspaceLogo, uploadWorkspaceLogo } from "@/lib/api/workspaces";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { useLanguage } from "@/lib/i18n/language-context";

// Reusable icon pill used inside each settings card
function SettingsIcon({ label, bgClass, textClass }: { label: string; bgClass: string; textClass: string }) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${bgClass} ${textClass}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export default function SettingsClient() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([]);
  const [workspaceId] = useState<string | null>(() => getWorkspaceId());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;

    const loadWorkspace = async () => {
      try {
        const response = await getWorkspaces({ page: 1, pageSize: 50 });
        const active = response.items.find((item) => item.id === workspaceId) ?? null;
        setLogoPreview(active?.logoUrl ?? null);
      } catch {
        setLogoPreview(null);
      }
    };

    const loadBilling = async () => {
      try {
        const [subs, packs] = await Promise.all([
          getSubscriptions(workspaceId),
          getSeatPacks(workspaceId),
        ]);
        setSubscriptions(subs.items);
        setSeatPacks(packs.items);
      } catch {
        setSubscriptions([]);
        setSeatPacks([]);
      }
    };

    const loadMembers = async () => {
      try {
        const memberships = await getWorkspaceMemberships(workspaceId);
        setMemberCount(memberships.total ?? memberships.items.length);
      } catch {
        setMemberCount(0);
      }
    };

    loadBilling();
    loadWorkspace();
    loadMembers();
  }, [workspaceId]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError(t.settings.logoErrorType);
      return;
    }

    setLogoFileName(file.name);

    const upload = async () => {
      try {
        const updated = await uploadWorkspaceLogo({ workspaceId, file });
        setLogoPreview(updated.logoUrl ?? null);
        setLogoError(null);
        window.dispatchEvent(new Event("workspace-updated"));
      } catch {
        setLogoError(t.settings.logoError);
      }
    };

    upload();
  };

  const handleLogoRemove = () => {
    if (!workspaceId) return;
    const remove = async () => {
      try {
        await removeWorkspaceLogo({ workspaceId });
        setLogoPreview(null);
        setLogoFileName(null);
        window.dispatchEvent(new Event("workspace-updated"));
      } catch {
        setLogoError(t.settings.logoErrorRemove);
      }
    };
    remove();
  };

  const activeSubscription = subscriptions[0];
  const memberCountLabel =
    memberCount === 1
      ? `1 ${t.members.statusActive.toLowerCase()} member`
      : `${memberCount} ${t.members.statusActive.toLowerCase()} members`;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">{t.settings.title}</h2>
        <p className="mt-0.5 text-sm text-[var(--foreground)]/50">{t.settings.subtitle}</p>
      </div>

      {/* 2×2 grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Plan card */}
        <Card id="plan" className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <SettingsIcon label="P" bgClass="bg-blue-500/10" textClass="text-blue-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.settings.plan}</p>
              <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
                {activeSubscription
                  ? `${activeSubscription.planKey} · ${activeSubscription.status}`
                  : t.settings.planNoActive}
              </p>
            </div>
          </div>
          <Link href="/plans">
            <Button className="w-full">{t.settings.planChange}</Button>
          </Link>
        </Card>

        {/* Billing card */}
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <SettingsIcon label="$" bgClass="bg-green-500/10" textClass="text-green-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.settings.billing}</p>
              <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
                {t.settings.billingSeats}: {seatPacks.length}
              </p>
            </div>
          </div>
          <Button variant="secondary" className="w-full">{t.settings.billingManage}</Button>
        </Card>

        {/* Limits card */}
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <SettingsIcon label="W" bgClass="bg-amber-500/10" textClass="text-amber-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.limits.title}</p>
              <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{t.settings.limitsSummary}</p>
            </div>
          </div>
          <Link href="/limits">
            <Button variant="secondary" className="w-full">{t.settings.limitsView}</Button>
          </Link>
        </Card>

        {/* Logo card */}
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <SettingsIcon label="L" bgClass="bg-purple-500/10" textClass="text-purple-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.settings.logoTitle}</p>
              <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
                {logoFileName ?? (logoPreview ? "" : t.settings.logoNoImage)}
              </p>
            </div>
          </div>

          {/* Custom dropzone */}
          <label
            htmlFor="logo-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed [border-color:var(--border)] bg-[var(--surface-muted)] px-4 py-5 text-center transition-colors hover:[border-color:var(--sidebar)]"
          >
            <span className="text-xs font-medium text-[var(--foreground)]/60">{t.settings.logoHint}</span>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleLogoChange}
            />
          </label>

          {logoPreview && (
            <div className="flex items-center gap-4">
              <Image
                src={logoPreview}
                alt={t.settings.logoTitle}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl object-cover"
                unoptimized
              />
              <Button variant="secondary" onClick={handleLogoRemove}>
                {t.settings.logoRemove}
              </Button>
            </div>
          )}

          {logoError && <p className="text-sm text-red-500">{logoError}</p>}
        </Card>
      </div>

      {/* Members card — full width */}
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <SettingsIcon label="M" bgClass="bg-indigo-500/10" textClass="text-indigo-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">{t.members.title}</p>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{memberCountLabel}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--foreground)]/50">{t.settings.membersDescription}</p>
        <div>
          <Link href="/settings/users">
            <Button variant="secondary">{t.settings.membersManage}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
