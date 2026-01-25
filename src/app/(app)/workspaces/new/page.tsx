"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getWorkspaceId, setWorkspaceId } from "@/lib/storage/workspace";
import { createWorkspace, getWorkspaces } from "@/lib/api/workspaces";
import { getLimits, getSubscriptions, type Limit, type Subscription } from "@/lib/api/billing";
import { useLanguage } from "@/lib/i18n/language-context";

const workspaceTypes = [
  { value: "PERSONAL", label: "Pessoal" },
  { value: "FAMILY", label: "Família" },
  { value: "ORG", label: "Empresa" },
] as const;

export default function NewWorkspacePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof workspaceTypes)[number]["value"]>("PERSONAL");
  const [domain, setDomain] = useState("");
  const [limits, setLimits] = useState<Limit[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalWorkspaces, setTotalWorkspaces] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeWorkspaceId = getWorkspaceId();
    if (!activeWorkspaceId) {
      return;
    }

    const loadData = async () => {
      try {
        const [workspaceResponse, limitsResponse, subsResponse] = await Promise.all([
          getWorkspaces({ page: 1, pageSize: 50 }),
          getLimits(activeWorkspaceId),
          getSubscriptions(activeWorkspaceId),
        ]);

        setTotalWorkspaces(workspaceResponse.total);
        setLimits(limitsResponse.items);
        setSubscriptions(subsResponse.items);
      } catch {
        setTotalWorkspaces(0);
        setLimits([]);
        setSubscriptions([]);
      }
    };

    loadData();
  }, []);

  const workspaceLimit = useMemo(() => {
    const limit = limits.find((item) => item.key === "workspaces.max");
    return limit?.value ?? null;
  }, [limits]);

  const workspacePercent = useMemo(() => {
    if (!workspaceLimit || workspaceLimit <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((totalWorkspaces / workspaceLimit) * 100));
  }, [totalWorkspaces, workspaceLimit]);

  const canCreate = useMemo(() => {
    if (workspaceLimit === null) {
      return true;
    }

    return totalWorkspaces < workspaceLimit;
  }, [totalWorkspaces, workspaceLimit]);

  const activePlan = subscriptions[0]?.planKey ?? "FREE";

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Informe o nome do workspace.");
      return;
    }

    if (!canCreate) {
      setError("Seu plano atual não permite criar mais workspaces.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const workspace = await createWorkspace({
        name: name.trim(),
        type,
        domain: type === "ORG" ? domain.trim() || null : null,
      });

      setWorkspaceId(workspace.id);
      window.dispatchEvent(new Event("workspace-updated"));
      router.push("/dashboard");
    } catch {
      setError("Não foi possível criar o workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold">Criar workspace</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Plano atual: {activePlan}. {workspaceLimit === null ? "" : `Limite de workspaces: ${workspaceLimit}.`}
        </p>
        <div className="mt-4 rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between text-sm text-zinc-600">
            <span>{t.limits.workspaces}</span>
            <span>
              {workspaceLimit === null
                ? t.limits.unlimited
                : `${totalWorkspaces} ${t.limits.usedOf} ${workspaceLimit}`}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-zinc-200">
            <div
              className="h-2 rounded-full bg-indigo-500"
              style={{ width: `${workspacePercent}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <div className="flex flex-col gap-4">
          <Input
            label="Nome do workspace"
            placeholder="Ex: Marketing, Família, Financeiro"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Tipo de workspace
            <select
              value={type}
              onChange={(event) => setType(event.target.value as (typeof workspaceTypes)[number]["value"])}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {workspaceTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {type === "ORG" ? (
            <Input
              label="Domínio corporativo (opcional)"
              placeholder="empresa.com"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button onClick={handleCreate} disabled={loading || !canCreate}>
            {loading ? "Criando..." : "Criar workspace"}
          </Button>
        </div>
      </Card>

      {!canCreate ? (
        <Card>
          <h3 className="text-base font-semibold">Limite atingido</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Seu plano atual não permite criar novos workspaces. Faça upgrade para aumentar o limite.
          </p>
          <Link href="/plans">
            <Button className="mt-4" variant="secondary">
              Ver planos
            </Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
