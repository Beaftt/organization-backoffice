"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { getAuthTokens } from "@/lib/storage/auth";
import { clearWorkspaceId, getWorkspaceId, setWorkspaceId } from "@/lib/storage/workspace";
import { getWorkspaces, type Workspace } from "@/lib/api/workspaces";
import { getEntitlements, type Entitlement } from "@/lib/api/entitlements";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";

const moduleLinks = [
  { key: "reminders", href: "/reminders", entitlement: "module.organization" },
  { key: "passwords", href: "/passwords", entitlement: "module.organization" },
  { key: "documents", href: "/documents", entitlement: "module.organization" },
  { key: "finance", href: "/finance", entitlement: "module.finance" },
  { key: "hr", href: "/hr", entitlement: "module.hr" },
  { key: "purchasing", href: "/purchasing", entitlement: "module.organization" },
  { key: "calendar", href: "/calendar", entitlement: "module.organization" },
];

const routeTitles: Record<string, string> = {
  "/dashboard": "dashboard",
  "/settings": "settings",
  "/profile": "profile",
  "/reminders": "reminders",
  "/passwords": "passwords",
  "/documents": "documents",
  "/finance": "finance",
  "/hr": "hr",
  "/purchasing": "purchasing",
  "/calendar": "calendar",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspace] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const entitlementsMap = useMemo(() => {
    return entitlements.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }, [entitlements]);

  useEffect(() => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const response = await getWorkspaces();
        setWorkspaces(response.items);
        const stored = getWorkspaceId();
        const fallback = response.items[0]?.id ?? null;
        const nextId = stored ?? fallback;
        if (nextId) {
          setWorkspaceId(nextId);
          setActiveWorkspace(nextId);
        }
      } catch {
        clearWorkspaceId();
      }
    };

    loadWorkspaces();
  }, []);

  useEffect(() => {
    const loadEntitlements = async () => {
      if (!activeWorkspaceId) {
        return;
      }
      try {
        const response = await getEntitlements(activeWorkspaceId);
        setEntitlements(response.items);
      } catch {
        setEntitlements([]);
      }
    };

    loadEntitlements();
  }, [activeWorkspaceId]);

  const pageKey = routeTitles[pathname] ?? "dashboard";
  const pageTitle =
    pageKey === "dashboard"
      ? t.layout.dashboard
      : pageKey === "settings"
        ? t.layout.settings
        : pageKey === "profile"
          ? t.layout.profile
          : t.modules[pageKey as keyof typeof t.modules];

  const visibleModules = moduleLinks.filter((item) => {
    const entitlement = entitlementsMap[item.entitlement];
    return entitlement ? entitlement === "true" : true;
  });

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen w-full items-stretch p-4 sm:p-6">
        <div className="relative flex w-full overflow-hidden rounded-[32px] bg-[var(--surface)] shadow-[0_20px_60px_rgba(22,26,40,0.12)]">
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
        ) : null}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--sidebar)] p-6 text-[var(--sidebar-text)] transition-transform lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                OP
              </div>
              <div>
                <p className="text-sm font-semibold">Organization</p>
                <p className="text-xs text-white/70">Backoffice</p>
              </div>
            </div>
            <button className="text-white/70" onClick={() => setMobileOpen(false)}>
              ✕
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <div>
              <Link
                href="/dashboard"
                className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/20 ${
                  pathname === "/dashboard" ? "bg-white/20 text-white" : "text-white/70"
                }`}
              >
                {t.layout.dashboard}
              </Link>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {t.layout.modules}
              </p>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {visibleModules.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3 py-2 transition hover:bg-white/20 ${
                      pathname === item.href ? "bg-white/20 text-white" : "text-white/70"
                    }`}
                  >
                    {t.modules[item.key as keyof typeof t.modules]}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <aside className="hidden w-64 flex-col bg-[var(--sidebar)] p-6 text-[var(--sidebar-text)] lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              OP
            </div>
            <div>
              <p className="text-sm font-semibold">Organization</p>
              <p className="text-xs text-white/70">Backoffice</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <div>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/20 ${
                  pathname === "/dashboard" ? "bg-white/20 text-white" : "text-white/70"
                }`}
              >
                {t.layout.dashboard}
              </Link>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {t.layout.modules}
              </p>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {visibleModules.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`rounded-xl px-3 py-2 transition hover:bg-white/20 ${
                      pathname === item.href ? "bg-white/20 text-white" : "text-white/70"
                    }`}
                  >
                    {t.modules[item.key as keyof typeof t.modules]}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {t.layout.workspaces}
              </p>
              <select
                value={activeWorkspaceId ?? ""}
                onChange={(event) => {
                  setActiveWorkspace(event.target.value);
                  setWorkspaceId(event.target.value);
                }}
                className="mt-3 w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              href="/settings"
              className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/20 ${
                pathname === "/settings" ? "bg-white/20 text-white" : "text-white/70"
              }`}
            >
              {t.layout.settings}
            </Link>
            <Link
              href="/profile"
              className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/20 ${
                pathname === "/profile" ? "bg-white/20 text-white" : "text-white/70"
              }`}
            >
              {t.layout.profile}
            </Link>
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-zinc-600 lg:hidden"
                type="button"
                onClick={() => setMobileOpen(true)}
              >
                ☰
              </button>
            </div>
            <h1 className="text-center text-lg font-semibold">{pageTitle}</h1>
            <div className="flex flex-wrap items-center justify-end gap-3">
                {workspaces.length > 1 ? (
                  <select
                    value={activeWorkspaceId ?? ""}
                    onChange={(event) => {
                      setActiveWorkspace(event.target.value);
                      setWorkspaceId(event.target.value);
                    }}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  >
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                ) : null}
              <Button
                variant="secondary"
                onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              >
                {t.layout.language}: {language.toUpperCase()}
              </Button>
              <Button variant="secondary" onClick={toggleTheme}>
                {t.layout.theme}: {theme === "light" ? "Light" : "Dark"}
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold">
                  LF
                </span>
                <span className="text-zinc-700">Lucas</span>
              </div>
            </div>
          </header>

          <div className="flex-1 bg-[var(--surface-muted)] p-6 sm:p-8">
            {children}
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
