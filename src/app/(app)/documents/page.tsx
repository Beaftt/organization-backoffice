"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Folder = {
  id: string;
  name: string;
  totalFiles: number;
};

type DocumentItem = {
  id: string;
  name: string;
  folderId: string;
  type: "PDF" | "Imagem" | "Planilha" | "Outro";
  updatedAt: string;
};

const folders: Folder[] = [
  { id: "1", name: "Contratos", totalFiles: 12 },
  { id: "2", name: "Fiscal", totalFiles: 8 },
  { id: "3", name: "RH", totalFiles: 5 },
  { id: "4", name: "Pessoal", totalFiles: 3 },
];

const documents: DocumentItem[] = [
  { id: "d1", name: "Contrato fornecedor.pdf", folderId: "1", type: "PDF", updatedAt: "2026-01-18" },
  { id: "d2", name: "Nota fiscal janeiro.pdf", folderId: "2", type: "PDF", updatedAt: "2026-01-10" },
  { id: "d3", name: "Currículo João.pdf", folderId: "3", type: "PDF", updatedAt: "2026-01-08" },
  { id: "d4", name: "Foto documento.png", folderId: "4", type: "Imagem", updatedAt: "2025-12-29" },
  { id: "d5", name: "Planilha custos.xlsx", folderId: "2", type: "Planilha", updatedAt: "2025-12-12" },
];

const pageSize = 4;

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = documents.filter((item) => {
      const matchesFolder = folderFilter === "all" || item.folderId === folderFilter;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesQuery = item.name.toLowerCase().includes(q);
      return matchesFolder && matchesType && matchesQuery;
    });

    if (sortBy === "name") {
      items = items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      items = items.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    return items;
  }, [query, folderFilter, typeFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Documentos</h2>
          <p className="text-sm text-zinc-600">
            Organize arquivos por pastas e mantenha tudo centralizado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">+ Nova pasta</Button>
          <Button>+ Enviar arquivo</Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4">
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => {
                setFolderFilter(folder.id);
                setPage(1);
              }}
              className={`flex min-w-[160px] flex-1 items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3 text-sm transition ${
                folderFilter === folder.id
                  ? "bg-[var(--surface-muted)] text-[var(--foreground)]"
                  : "text-zinc-600 hover:bg-[var(--surface-muted)]"
              }`}
            >
              <span>{folder.name}</span>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
                {folder.totalFiles}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setFolderFilter("all");
              setPage(1);
            }}
            className={`flex min-w-[160px] flex-1 items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3 text-sm transition ${
              folderFilter === "all"
                ? "bg-[var(--surface-muted)] text-[var(--foreground)]"
                : "text-zinc-600 hover:bg-[var(--surface-muted)]"
            }`}
          >
            <span>Todas as pastas</span>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
              {documents.length}
            </span>
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Buscar"
              placeholder="Pesquisar por nome do arquivo"
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
              <option value="PDF">PDF</option>
              <option value="Imagem">Imagem</option>
              <option value="Planilha">Planilha</option>
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
              <option value="name">Nome</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3">Arquivo</th>
                <th className="pb-3">Pasta</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Atualizado</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paged.map((item) => (
                <tr key={item.id} className="text-zinc-700">
                  <td className="py-3 font-medium text-[var(--foreground)]">
                    {item.name}
                  </td>
                  <td className="py-3">
                    {folders.find((folder) => folder.id === item.folderId)?.name ?? "-"}
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3">{item.updatedAt}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost">Abrir</Button>
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
