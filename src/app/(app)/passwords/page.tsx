"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type PasswordRecord = {
  id: string;
  title: string;
  username: string;
  type: "Conta" | "Servidor" | "API" | "Outro";
  updatedAt: string;
};

const records: PasswordRecord[] = [
  {
    id: "1",
    title: "Conta principal",
    username: "lucas@org.com",
    type: "Conta",
    updatedAt: "2026-01-15",
  },
  {
    id: "2",
    title: "Servidor AWS",
    username: "root",
    type: "Servidor",
    updatedAt: "2026-01-10",
  },
  {
    id: "3",
    title: "Chave Stripe",
    username: "sk_live_...",
    type: "API",
    updatedAt: "2026-01-05",
  },
  {
    id: "4",
    title: "Conta banco",
    username: "finance@org.com",
    type: "Conta",
    updatedAt: "2025-12-20",
  },
  {
    id: "5",
    title: "VPN Office",
    username: "vpn-user",
    type: "Outro",
    updatedAt: "2025-12-01",
  },
];

const pageSize = 4;

export default function PasswordsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = records.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesQuery =
        item.title.toLowerCase().includes(q) ||
        item.username.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    if (sortBy === "title") {
      items = items.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      items = items.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    return items;
  }, [query, typeFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Senhas</h2>
          <p className="text-sm text-zinc-600">
            Cadastre senhas, chaves e registros sensíveis com segurança.
          </p>
        </div>
        <Button>+ Novo registro</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Buscar"
              placeholder="Pesquisar por título ou usuário"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Tipo
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="Conta">Conta</option>
              <option value="Servidor">Servidor</option>
              <option value="API">API</option>
              <option value="Outro">Outro</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            Ordenar
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="updatedAt">Atualização</option>
              <option value="title">Título</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3">Título</th>
                <th className="pb-3">Usuário/Chave</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Atualizado</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paged.map((item) => (
                <tr key={item.id} className="text-zinc-700">
                  <td className="py-3 font-medium text-[var(--foreground)]">
                    {item.title}
                  </td>
                  <td className="py-3">{item.username}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3">{item.updatedAt}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost">Ver</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            Página {page} de {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              Próximo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
