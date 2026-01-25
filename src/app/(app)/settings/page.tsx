"use client";

import { useEffect, useState } from "react";
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

export default function SettingsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);

  useEffect(() => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      return;
    }

    const loadBilling = async () => {
      try {
        const [subs, packs, workspaceLimits] = await Promise.all([
          getSubscriptions(workspaceId),
          getSeatPacks(workspaceId),
          getLimits(workspaceId),
        ]);

        setSubscriptions(subs.items);
        setSeatPacks(packs.items);
        setLimits(workspaceLimits.items);
      } catch {
        setSubscriptions([]);
        setSeatPacks([]);
        setLimits([]);
      }
    };

    loadBilling();
  }, []);

  const activeSubscription = subscriptions[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Plano atual</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {activeSubscription
              ? `${activeSubscription.planKey} · ${activeSubscription.status}`
              : "Nenhum plano encontrado."}
          </p>
          <Button className="mt-4">Alterar plano</Button>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Pagamento</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Seat packs ativos: {seatPacks.length}
          </p>
          <Button className="mt-4" variant="secondary">
            Gerenciar pagamento
          </Button>
        </Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold">Limites do workspace</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {limits.map((limit) => (
            <div key={limit.id} className="rounded-xl border border-zinc-200 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {limit.key}
              </p>
              <p className="text-lg font-semibold text-zinc-900">
                {limit.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
