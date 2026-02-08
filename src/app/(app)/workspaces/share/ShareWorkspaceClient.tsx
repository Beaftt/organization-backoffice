"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { getLimits, getSubscriptions, type Limit, type Subscription } from "@/lib/api/billing";
import {
  createWorkspaceMembership,
  getWorkspaceMemberships,
  type WorkspaceMembership,
} from "@/lib/api/workspace-memberships";
import { lookupUserByEmail } from "@/lib/api/users";
import { createWorkspaceInvite } from "@/lib/api/workspace-invites";
import { ApiError } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ShareWorkspaceClient() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [limits, setLimits] = useState<Limit[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    const activeWorkspaceId = getWorkspaceId();
    if (!activeWorkspaceId) {
      return;
    }

    setWorkspaceIdState(activeWorkspaceId);

    const loadData = async () => {
      try {
        const [limitsResponse, subsResponse, membershipsResponse] = await Promise.all([
          getLimits(activeWorkspaceId),
          getSubscriptions(activeWorkspaceId),
          getWorkspaceMemberships(activeWorkspaceId),
        ]);

        setLimits(limitsResponse.items);
        setSubscriptions(subsResponse.items);
        setMemberships(membershipsResponse.items);
        setMembersTotal(membershipsResponse.total);
      } catch {
        setLimits([]);
        setSubscriptions([]);
        setMemberships([]);
        setMembersTotal(0);
      }
    };

    loadData();
  }, []);

  const membersLimit = useMemo(() => {
    const limit = limits.find((item) => item.key === "members.max");
    return limit?.value ?? null;
  }, [limits]);

  const planKey = subscriptions[0]?.planKey ?? "FREE";

  const effectiveLimit = useMemo(() => {
    return membersLimit;
  }, [membersLimit]);

  const membersPercent = useMemo(() => {
    if (!effectiveLimit || effectiveLimit <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((membersTotal / effectiveLimit) * 100));
  }, [membersTotal, effectiveLimit]);

  const canShareMore = useMemo(() => {
    if (effectiveLimit === null || effectiveLimit === undefined) {
      return true;
    }

    return membersTotal < effectiveLimit;
  }, [effectiveLimit, membersTotal]);

  const handleLookup = async () => {
    if (!workspaceId) {
      setError("Selecione um workspace.");
      return;
    }

    if (!email.trim()) {
      setError("Informe o e-mail para buscar.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setInviteLink(null);
    setNotFound(false);

    try {
      if (!canShareMore) {
        setError("Seu plano atual não permite compartilhar com mais pessoas.");
        return;
      }

      const user = await lookupUserByEmail(email.trim().toLowerCase());
      await createWorkspaceMembership({
        workspaceId,
        userId: user.id,
        status: "ACTIVE",
      });
      setSuccess("Usuário encontrado e compartilhamento enviado com sucesso.");
      setEmail("");
      const membershipsResponse = await getWorkspaceMemberships(workspaceId);
      setMemberships(membershipsResponse.items);
      setMembersTotal(membershipsResponse.total);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.statusCode === 404) {
        setNotFound(true);
        setError("Usuário não encontrado. Envie o convite abaixo.");
      } else {
        setError("Não foi possível buscar o usuário.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!workspaceId) {
      setError("Selecione um workspace.");
      return;
    }

    if (!email.trim()) {
      setError("Informe o e-mail para convidar.");
      return;
    }

    if (!canShareMore) {
      setError("Seu plano atual não permite compartilhar com mais pessoas.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const invite = await createWorkspaceInvite({
        workspaceId,
        email: email.trim().toLowerCase(),
      });
      const origin = window.location.origin;
      const link = `${origin}/register?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;
      setInviteLink(link);
      setSuccess("Convite enviado por e-mail.");
      setIsInviteModalOpen(true);
    } catch {
      setError("Não foi possível criar o convite.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setSuccess("Link do convite copiado.");
    } catch {
      setError("Não foi possível copiar o link.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold">Compartilhar workspace</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Plano atual: {planKey}. Limite de membros: {effectiveLimit ?? "-"}.
        </p>
        <div className="mt-4 rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between text-sm text-zinc-600">
            <span>{t.limits.members}</span>
            <span>
              {effectiveLimit === null
                ? t.limits.unlimited
                : `${membersTotal} ${t.limits.usedOf} ${effectiveLimit}`}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-zinc-200">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${membersPercent}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <div className="flex flex-col gap-4">
          <Input
            label="E-mail do usuário"
            placeholder="email@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleLookup} disabled={loading} variant="secondary">
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {notFound ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-[var(--surface-muted)] p-3 text-sm text-zinc-700">
              <span className="font-medium">{email.trim().toLowerCase()}</span>
              <Button onClick={handleInvite} disabled={loading || !canShareMore}>
                {loading ? "Enviando..." : "Enviar e-mail"}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {isInviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-100">Convite enviado</h3>
            <p className="mt-2 text-sm text-zinc-400">
              O e-mail foi enviado para o destinatário com o convite para cadastro.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleCopyInviteLink} disabled={!inviteLink}>
                Copiar link do convite
              </Button>
              <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {!canShareMore ? (
        <Card>
          <h3 className="text-base font-semibold">Upgrade de plano necessário</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Seu plano atual permite apenas {Math.max((effectiveLimit ?? 0) - 1, 0)} usuário adicional. Faça upgrade para compartilhar com mais pessoas.
          </p>
          <Link href="/plans">
            <Button className="mt-4" variant="secondary">
              Ver planos
            </Button>
          </Link>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">Membros atuais</h3>
          <Link href="/settings/users">
            <Button variant="secondary">Editar permissões</Button>
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Total de membros: {membersTotal}
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-700">
          {memberships.map((membership) => (
            <div key={membership.id} className="rounded-xl border border-zinc-200 px-3 py-2">
              {membership.userId} · {membership.status}
            </div>
          ))}
          {memberships.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum membro adicional ainda.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
