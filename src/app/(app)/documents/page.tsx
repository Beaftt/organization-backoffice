"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

type Folder = {
  id: string;
  name: string;
  totalFiles: number;
};

type DocumentItem = {
  id: string;
  name: string;
  folderId: string;
  type: "pdf" | "image" | "spreadsheet" | "other";
  updatedAt: string;
};

const pageSize = 4;

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [page, setPage] = useState(1);

  const folders = useMemo<Folder[]>(
    () => [
      { id: "contracts", name: t.documents.folders.contracts, totalFiles: 12 },
      { id: "tax", name: t.documents.folders.tax, totalFiles: 8 },
      { id: "hr", name: t.documents.folders.hr, totalFiles: 5 },
      { id: "personal", name: t.documents.folders.personal, totalFiles: 3 },
    ],
    [t],
  );

  const documents = useMemo<DocumentItem[]>(
    () => [
      {
        id: "d1",
        name: t.documents.files.vendorContract,
        folderId: "contracts",
        type: "pdf",
        updatedAt: "2026-01-18",
      },
      {
        id: "d2",
        name: t.documents.files.januaryInvoice,
        folderId: "tax",
        type: "pdf",
        updatedAt: "2026-01-10",
      },
      {
        id: "d3",
        name: t.documents.files.resumeJohn,
        folderId: "hr",
        type: "pdf",
        updatedAt: "2026-01-08",
      },
      {
        id: "d4",
        name: t.documents.files.documentPhoto,
        folderId: "personal",
        type: "image",
        updatedAt: "2025-12-29",
      },
      {
        id: "d5",
        name: t.documents.files.costSpreadsheet,
        folderId: "tax",
        type: "spreadsheet",
        updatedAt: "2025-12-12",
      },
    ],
    [t],
  );

  const typeLabels = {
    pdf: t.documents.typePdf,
    image: t.documents.typeImage,
    spreadsheet: t.documents.typeSpreadsheet,
    other: t.documents.typeOther,
  } satisfies Record<DocumentItem["type"], string>;

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
          <h2 className="text-lg font-semibold">{t.modules.documents}</h2>
          <p className="text-sm text-zinc-600">
            {t.documents.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">{t.documents.newFolder}</Button>
          <Button>{t.documents.uploadFile}</Button>
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
            <span>{t.documents.allFolders}</span>
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
              label={t.documents.searchLabel}
              placeholder={t.documents.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.typeLabel}
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="all">{t.documents.typeAll}</option>
              <option value="pdf">{t.documents.typePdf}</option>
              <option value="image">{t.documents.typeImage}</option>
              <option value="spreadsheet">{t.documents.typeSpreadsheet}</option>
              <option value="other">{t.documents.typeOther}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.documents.sortLabel}
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="updatedAt">{t.documents.sortUpdated}</option>
              <option value="name">{t.documents.sortName}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3">{t.documents.tableFile}</th>
                <th className="pb-3">{t.documents.tableFolder}</th>
                <th className="pb-3">{t.documents.tableType}</th>
                <th className="pb-3">{t.documents.tableUpdated}</th>
                <th className="pb-3 text-right">{t.documents.tableActions}</th>
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
                      {typeLabels[item.type]}
                    </span>
                  </td>
                  <td className="py-3">{item.updatedAt}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost">{t.documents.open}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            {t.documents.page} {page} {t.documents.pageOf} {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              {t.documents.prev}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              {t.documents.next}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
