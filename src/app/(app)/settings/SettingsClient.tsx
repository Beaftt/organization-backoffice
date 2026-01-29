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
import { useLanguage } from "@/lib/i18n/language-context";

export default function SettingsClient() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([]);
  const [workspaceId] = useState<string | null>(() => getWorkspaceId());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }
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

    loadBilling();
    loadWorkspace();
  }, [workspaceId]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Selecione uma imagem válida.");
      return;
    }

    const upload = async () => {
      try {
        const updated = await uploadWorkspaceLogo({ workspaceId, file });
        setLogoPreview(updated.logoUrl ?? null);
        setLogoError(null);
        window.dispatchEvent(new Event("workspace-updated"));
      } catch {
        setLogoError("Não foi possível atualizar o logo.");
      }
    };

    upload();
  };

  const activeSubscription = subscriptions[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="plan">
          <h2 className="text-lg font-semibold">Plano atual</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {activeSubscription
              ? `${activeSubscription.planKey} · ${activeSubscription.status}`
              : "Nenhum plano encontrado."}
          </p>
          <Link href="/plans">
            <Button className="mt-4">Alterar plano</Button>
          </Link>
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
        <Card>
          <h2 className="text-lg font-semibold">{t.limits.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{t.limits.subtitle}</p>
          <Link href="/limits">
            <Button className="mt-4" variant="secondary">
              {t.limits.view}
            </Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Logo do workspace</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Use uma imagem para personalizar o workspace.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
            {logoPreview ? (
              <div className="flex items-center gap-4">
                <Image
                  src={logoPreview}
                  alt="Logo do workspace"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl object-cover"
                  unoptimized
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!workspaceId) return;
                    const remove = async () => {
                      try {
                        await removeWorkspaceLogo({ workspaceId });
                        setLogoPreview(null);
                        window.dispatchEvent(new Event("workspace-updated"));
                      } catch {
                        setLogoError("Não foi possível remover o logo.");
                      }
                    };

                    remove();
                  }}
                >
                  Remover logo
                </Button>
              </div>
            ) : null}
            {logoError ? <p className="text-sm text-red-600">{logoError}</p> : null}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">{t.members.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{t.members.subtitle}</p>
          <Link href="/settings/users">
            <Button className="mt-4" variant="secondary">
              {t.members.manageAction}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
