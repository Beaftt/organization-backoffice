"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  createSecret,
  deleteSecret,
  getSecret,
  listSecrets,
  updateSecret,
  type SecretDetails,
  type SecretSummary,
  type SecretType,
} from "@/lib/api/secrets";

const pageSize = 6;

const initialForm = {
  title: "",
  type: "ACCOUNT" as SecretType,
  username: "",
  secret: "",
  url: "",
  notes: "",
};

type SecretsClientProps = {
  initialQuery?: string;
  initialType?: "all" | SecretType;
  initialSort?: "updatedAt" | "title";
  initialDirection?: "asc" | "desc";
  initialPage?: number;
};

export default function SecretsClient({
  initialQuery = "",
  initialType = "all",
  initialSort = "updatedAt",
  initialDirection = "desc",
  initialPage = 1,
}: SecretsClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<"all" | SecretType>(initialType);
  const [sortBy, setSortBy] = useState<"updatedAt" | "title">(initialSort);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">(
    initialDirection,
  );
  const [page, setPage] = useState(initialPage);
  const [records, setRecords] = useState<SecretSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewSecret, setViewSecret] = useState<SecretDetails | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewForm, setViewForm] = useState(initialForm);

  const typeOptions = useMemo(
    () => [
      { value: "all" as const, label: t.secrets.all },
      { value: "ACCOUNT" as const, label: t.secrets.typeAccount },
      { value: "SERVER" as const, label: t.secrets.typeServer },
      { value: "API" as const, label: t.secrets.typeApi },
      { value: "OTHER" as const, label: t.secrets.typeOther },
    ],
    [t],
  );

  const typeLabels = useMemo(
    () => ({
      ACCOUNT: t.secrets.typeAccount,
      SERVER: t.secrets.typeServer,
      API: t.secrets.typeApi,
      OTHER: t.secrets.typeOther,
    }),
    [t],
  );

  const loadSecrets = useCallback(async (overridePage?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listSecrets({
        page: overridePage ?? page,
        pageSize,
        orderBy: sortBy,
        orderDirection,
        type: typeFilter === "all" ? undefined : typeFilter,
        query: query.trim() ? query.trim() : undefined,
      });

      setRecords(response.items);
      setTotal(response.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.secrets.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderDirection, page, query, sortBy, t, typeFilter]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      await loadSecrets();
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [loadSecrets]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    if (typeFilter !== "all") {
      params.set("type", typeFilter);
    } else {
      params.delete("type");
    }
    if (sortBy !== "updatedAt") {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }
    if (orderDirection !== "desc") {
      params.set("direction", orderDirection);
    } else {
      params.delete("direction");
    }
    if (page !== 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const queryString = params.toString();
    router.replace(`/secrets${queryString ? `?${queryString}` : ""}`);
  }, [page, query, typeFilter, sortBy, orderDirection, router]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total]);

  const resetForm = () => {
    setForm(initialForm);
    setFormError(null);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.title.trim() || !form.secret.trim()) {
      setFormError(t.secrets.requiredError);
      return;
    }

    setIsSaving(true);

    try {
      await createSecret({
        title: form.title.trim(),
        type: form.type,
        secret: form.secret,
        username: form.username.trim() || undefined,
        url: form.url.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      setIsModalOpen(false);
      resetForm();
      setPage(1);
      await loadSecrets(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(t.secrets.saveError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleView = async (id: string) => {
    setIsViewing(true);
    setViewError(null);
    setViewSecret(null);
    setIsEditing(false);

    try {
      const secret = await getSecret({ id });
      setViewSecret(secret);
      setViewForm({
        title: secret.title,
        type: secret.type,
        username: secret.username ?? "",
        secret: secret.secret,
        url: secret.url ?? "",
        notes: secret.notes ?? "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setViewError(err.message);
      } else {
        setViewError(t.secrets.loadError);
      }
    } finally {
      setIsViewing(false);
    }
  };

  const handleUpdate = async () => {
    if (!viewSecret) return;
    setViewError(null);

    if (!viewForm.title.trim() || !viewForm.secret.trim()) {
      setViewError(t.secrets.requiredError);
      return;
    }

    setIsUpdating(true);

    try {
      const updated = await updateSecret({
        id: viewSecret.id,
        title: viewForm.title.trim(),
        type: viewForm.type,
        secret: viewForm.secret,
        username: viewForm.username.trim() || null,
        url: viewForm.url.trim() || null,
        notes: viewForm.notes.trim() || null,
      });

      setViewSecret(updated);
      setIsEditing(false);
      await loadSecrets();
    } catch (err) {
      if (err instanceof ApiError) {
        setViewError(err.message);
      } else {
        setViewError(t.secrets.updateError);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!viewSecret) return;
    const confirmed = window.confirm(t.secrets.deleteConfirm);
    if (!confirmed) return;

    setIsDeleting(true);
    setViewError(null);

    try {
      await deleteSecret({ id: viewSecret.id });
      setViewSecret(null);
      setViewError(null);
      await loadSecrets();
    } catch (err) {
      if (err instanceof ApiError) {
        setViewError(err.message);
      } else {
        setViewError(t.secrets.deleteError);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.secrets.title}</h2>
          <p className="text-sm text-zinc-600">{t.secrets.subtitle}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>{t.secrets.newButton}</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label={t.secrets.searchLabel}
              placeholder={t.secrets.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.secrets.typeLabel}
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as "all" | SecretType);
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.secrets.sortLabel}
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as "updatedAt" | "title");
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="updatedAt">{t.secrets.updatedAt}</option>
              <option value="title">{t.secrets.titleLabel}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-600">
            {t.secrets.directionLabel}
            <select
              value={orderDirection}
              onChange={(event) => {
                setOrderDirection(event.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="desc">{t.secrets.desc}</option>
              <option value="asc">{t.secrets.asc}</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3">{t.secrets.tableTitle}</th>
                <th className="pb-3">{t.secrets.tableUser}</th>
                <th className="pb-3">{t.secrets.tableType}</th>
                <th className="pb-3">{t.secrets.tableUpdated}</th>
                <th className="pb-3 text-right">{t.secrets.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="py-3">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 text-right">
                      <Skeleton className="ml-auto h-8 w-16 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                    {t.secrets.empty}
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} className="text-zinc-700">
                    <td className="py-3 font-medium text-[var(--foreground)]">
                      {item.title}
                    </td>
                    <td className="py-3">{item.username ?? "—"}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                        {typeLabels[item.type]}
                      </span>
                    </td>
                    <td className="py-3">
                      {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" onClick={() => handleView(item.id)}>
                        {t.secrets.view}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            {t.secrets.page} {page} de {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              {t.secrets.prev}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              {t.secrets.next}
            </Button>
          </div>
        </div>
      </Card>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.secrets.modalTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreate}>
              <Input
                label={t.secrets.fieldTitle}
                placeholder="Ex: Conta principal"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.secrets.fieldType}
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      type: event.target.value as SecretType,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  {typeOptions
                    .filter((option) => option.value !== "all")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </label>

              <Input
                label={t.secrets.fieldUser}
                placeholder="Ex: admin@org.com"
                value={form.username}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value }))
                }
              />

              <Input
                label={t.secrets.fieldSecret}
                placeholder="Informe o valor secreto"
                value={form.secret}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, secret: event.target.value }))
                }
              />

              <Input
                label={t.secrets.fieldUrl}
                placeholder="https://app.exemplo.com"
                value={form.url}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, url: event.target.value }))
                }
              />

              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.secrets.fieldNotes}
                <textarea
                  className="min-h-[96px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </label>

              {formError ? (
                <p className="text-sm text-red-500">{formError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  {t.secrets.cancel}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? t.secrets.saving : t.secrets.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewSecret || viewError || isViewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.secrets.viewTitle}</h3>
              <button
                className="text-zinc-500 hover:text-zinc-700"
                onClick={() => {
                  setViewSecret(null);
                  setViewError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {isViewing ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : viewError ? (
                <p className="text-red-500">{viewError}</p>
              ) : viewSecret && isEditing ? (
                <>
                  <Input
                    label={t.secrets.fieldTitle}
                    value={viewForm.title}
                    onChange={(event) =>
                      setViewForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.secrets.fieldType}
                    <select
                      value={viewForm.type}
                      onChange={(event) =>
                        setViewForm((prev) => ({
                          ...prev,
                          type: event.target.value as SecretType,
                        }))
                      }
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      {typeOptions
                        .filter((option) => option.value !== "all")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </label>
                  <Input
                    label={t.secrets.fieldUser}
                    value={viewForm.username}
                    onChange={(event) =>
                      setViewForm((prev) => ({
                        ...prev,
                        username: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label={t.secrets.fieldSecret}
                    value={viewForm.secret}
                    onChange={(event) =>
                      setViewForm((prev) => ({
                        ...prev,
                        secret: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label={t.secrets.fieldUrl}
                    value={viewForm.url}
                    onChange={(event) =>
                      setViewForm((prev) => ({
                        ...prev,
                        url: event.target.value,
                      }))
                    }
                  />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.secrets.fieldNotes}
                    <textarea
                      className="min-h-[96px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      value={viewForm.notes}
                      onChange={(event) =>
                        setViewForm((prev) => ({
                          ...prev,
                          notes: event.target.value,
                        }))
                      }
                    />
                  </label>
                </>
              ) : viewSecret ? (
                <>
                  <div>
                    <p className="text-xs text-zinc-500">{t.secrets.fieldTitle}</p>
                    <p className="font-semibold text-[var(--foreground)]">
                      {viewSecret.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t.secrets.fieldType}</p>
                    <p>{typeLabels[viewSecret.type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t.secrets.fieldUser}</p>
                    <p>{viewSecret.username ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t.secrets.fieldSecret}</p>
                    <p className="break-all rounded-xl bg-[var(--surface-muted)] p-3">
                      {viewSecret.secret}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t.secrets.fieldUrl}</p>
                    <p>{viewSecret.url ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t.secrets.fieldNotes}</p>
                    <p>{viewSecret.notes ?? "—"}</p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                {viewSecret ? (
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    {t.secrets.edit}
                  </Button>
                ) : null}
                {viewSecret ? (
                  <Button
                    variant="secondary"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? t.secrets.deleting ?? t.secrets.delete : t.secrets.delete}
                  </Button>
                ) : null}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <Button onClick={handleUpdate} disabled={isUpdating}>
                    {isUpdating ? t.secrets.updating : t.secrets.update}
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setViewSecret(null);
                    setViewError(null);
                    setIsEditing(false);
                  }}
                >
                  {t.secrets.close}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
