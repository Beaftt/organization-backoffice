'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';

type PlanFeature = { label: string; included: boolean };

type PlanData = {
  key: 'starter' | 'pro' | 'business';
  tier: string;
  price: number;
  intervalKey: 'forever' | 'perMonth';
  description: string;
  features: PlanFeature[];
  isCurrent: boolean;
  isPopular?: boolean;
};

function CheckIcon() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-[10px] font-bold text-green-600">
      ✓
    </span>
  );
}

function CrossIcon() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] text-[var(--foreground)]/30">
      ✕
    </span>
  );
}

export default function PlansPage() {
  const { t } = useLanguage();

  const plans: PlanData[] = [
    {
      key: 'starter',
      tier: 'Starter',
      price: 0,
      intervalKey: 'forever',
      description: t.plans.starterDesc,
      isCurrent: true,
      features: [
        { label: t.plans.feature1workspace, included: true },
        { label: t.plans.featureBasicShare, included: true },
        { label: t.plans.featureUnlimitedWorkspaces, included: false },
        { label: t.plans.featureMoreMembers, included: false },
        { label: t.plans.featurePrioritySupport, included: false },
      ],
    },
    {
      key: 'pro',
      tier: 'Pro',
      price: 49,
      intervalKey: 'perMonth',
      description: t.plans.proDesc,
      isCurrent: false,
      isPopular: true,
      features: [
        { label: t.plans.featureUnlimitedWorkspaces, included: true },
        { label: t.plans.featureMoreMembers, included: true },
        { label: t.plans.featurePrioritySupport, included: true },
        { label: t.plans.featureDedicatedSla, included: false },
        { label: t.plans.featureAdvancedEntitlements, included: false },
      ],
    },
    {
      key: 'business',
      tier: 'Business',
      price: 149,
      intervalKey: 'perMonth',
      description: t.plans.businessDesc,
      isCurrent: false,
      features: [
        { label: t.plans.featureEverythingPro, included: true },
        { label: t.plans.featureDedicatedSla, included: true },
        { label: t.plans.featureAdvancedEntitlements, included: true },
        { label: t.plans.featureAudit, included: true },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t.plans.title}</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/50">{t.plans.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={
              plan.isPopular
                ? 'relative border-2 [border-color:var(--sidebar)]'
                : 'relative border [border-color:var(--border)]'
            }
          >
            <div className="flex flex-col gap-4">
              {/* Popular badge */}
              {plan.isPopular && (
                <span className="absolute right-4 top-4 rounded-full bg-[var(--sidebar)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {t.plans.popular}
                </span>
              )}

              {/* Header */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/40">
                  {plan.tier}
                </p>
                <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
                  {formatCurrency(plan.price, 'BRL')}
                </p>
                <p className="text-xs text-[var(--foreground)]/40">
                  {plan.intervalKey === 'forever' ? t.plans.forever : `/ ${t.plans.perMonth}`}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground)]/60">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-[var(--foreground)]/70"
                  >
                    {feature.included ? <CheckIcon /> : <CrossIcon />}
                    {feature.label}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.isCurrent ? (
                <span className="mt-2 text-center text-xs font-semibold text-[var(--foreground)]/40">
                  {t.plans.current}
                </span>
              ) : (
                <Link href="/contact" className="mt-2 block">
                  <Button className="w-full" variant="primary">
                    {t.plans.upgradeTo.replace('{plan}', plan.tier)}
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

