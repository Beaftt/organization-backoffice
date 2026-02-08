"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { clearWorkspaceId, getWorkspaceId, setWorkspaceId } from "@/lib/storage/workspace";
import { getWorkspaces, type Workspace } from "@/lib/api/workspaces";
import { getEntitlements, type Entitlement } from "@/lib/api/entitlements";
import { getMyProfile } from "@/lib/api/user-profile";
import { getMyUser } from "@/lib/api/users";
import { logout } from "@/lib/api/auth";
import { clearLastVisitedRoute, setLastVisitedRoute } from "@/lib/storage/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";

const moduleLinks = [
  { key: "reminders", href: "/reminders", entitlement: "module.organization" },
  { key: "calendar", href: "/calendar", entitlement: "module.organization" },
  { key: "secrets", href: "/secrets", entitlement: "module.organization" },
  { key: "documents", href: "/documents", entitlement: "module.organization" },
  { key: "finance", href: "/finance", entitlement: "module.finance" },
  { key: "studies", href: "/studies", entitlement: "module.organization" },
  { key: "hr", href: "/hr", entitlement: "module.hr" },
  { key: "jobs", href: "/vagas", entitlement: "module.jobs" },
];

const routeTitles: Record<string, string> = {
  "/dashboard": "dashboard",
  "/settings": "settings",
  "/settings/users": "members",
  "/profile": "profile",
  "/limits": "limits",
  "/workspaces/new": "newWorkspace",
  "/workspaces/share": "shareWorkspace",
  "/reminders": "reminders",
  "/secrets": "secrets",
  "/documents": "documents",
  "/finance": "finance",
  "/hr": "hr",
  "/hr/people": "hrPeople",
  "/hr/jobs": "hrJobs",
  "/studies": "studies",
  "/calendar": "calendar",
  "/vagas": "jobs",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "suporte@organization.com";
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspace] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(true);
  const [isEntitlementsLoading, setIsEntitlementsLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportContact, setSupportContact] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [lastRoute, setLastRoute] = useState<string | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const entitlementsMap = useMemo(() => {
    return entitlements.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }, [entitlements]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const previous = previousPathRef.current;
    if (previous && previous !== pathname) {
      setLastRoute(previous);
    }

    previousPathRef.current = pathname;
    setLastVisitedRoute(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const getInitials = (value: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const getEmailInitial = (email?: string | null) =>
    email?.trim()?.[0]?.toUpperCase() ?? null;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profile, user] = await Promise.all([
          getMyProfile(),
          getMyUser(),
        ]);
        const name = [profile.firstName, profile.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        setProfileEmail(user.email ?? null);
        setProfileName(name || user.email || "");
        setProfilePhoto(profile.photoUrl ?? null);
      } catch {
        setProfilePhoto(null);
        setProfileName("");
        setProfileEmail(null);
      }
    };

    loadProfile();
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setIsWorkspacesLoading(true);
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
    } finally {
      setIsWorkspacesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    const loadEntitlements = async () => {
      if (!activeWorkspaceId) {
        setIsEntitlementsLoading(false);
        return;
      }
      setIsEntitlementsLoading(true);
      try {
        const response = await getEntitlements(activeWorkspaceId);
        setEntitlements(response.items);
      } catch {
        setEntitlements([]);
      } finally {
        setIsEntitlementsLoading(false);
      }
    };

    loadEntitlements();
  }, [activeWorkspaceId]);

  useEffect(() => {
    const handleProfileUpdate = async () => {
      try {
        const profile = await getMyProfile();
        const name = [profile.firstName, profile.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (name) {
          setProfileName(name);
        }
        setProfilePhoto(profile.photoUrl ?? null);
      } catch {
        setProfilePhoto(null);
      }
    };

    const handleWorkspaceUpdate = () => {
      loadWorkspaces();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("workspace-updated", handleWorkspaceUpdate);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("workspace-updated", handleWorkspaceUpdate);
    };
  }, [loadWorkspaces]);

  const activeWorkspace = useMemo(() => {
    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;
  }, [workspaces, activeWorkspaceId]);
  const isOrgWorkspace = activeWorkspace?.type === "ORG";

  const workspaceLogo = activeWorkspace?.logoUrl ?? "/logo_organization.png";
  const supportWorkspaceLabel = activeWorkspace?.name ?? "Workspace";

  const pageKey = routeTitles[pathname] ?? "dashboard";
  const pageTitle =
    pageKey === "dashboard"
      ? t.layout.dashboard
      : pageKey === "settings"
        ? t.layout.settings
        : pageKey === "members"
          ? t.layout.members
        : pageKey === "profile"
          ? t.layout.profile
          : pageKey === "limits"
            ? t.layout.limits
            : pageKey === "newWorkspace"
              ? t.layout.newWorkspace
              : pageKey === "shareWorkspace"
                ? t.layout.shareWorkspace
          : pageKey === "hrPeople"
            ? t.hr.peopleTitle
            : pageKey === "hrJobs"
              ? t.hr.jobsTitle
                : t.modules[pageKey as keyof typeof t.modules];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout errors
    }

    clearWorkspaceId();
    clearLastVisitedRoute();
    router.replace("/login");
  };

  const visibleModules = moduleLinks.filter((item) => {
    if (item.key === "hr" && !isOrgWorkspace) return false;
    if (item.key === "jobs" && isOrgWorkspace) return false;
    const entitlement = entitlementsMap[item.entitlement];
    return entitlement ? entitlement === "true" : true;
  });

  const handleSupportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupportSent(false);

    const subject = `Suporte - ${supportWorkspaceLabel}`;
    const body = [
      `Nome: ${supportName || "(não informado)"}`,
      `Contato: ${supportContact || "(não informado)"}`,
      `Workspace: ${supportWorkspaceLabel}`,
      "",
      supportMessage || "(sem mensagem)",
    ].join("\n");

    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSupportSent(true);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen w-full items-stretch p-4 sm:p-6">
        <div className="relative flex h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[32px] bg-[var(--surface)] shadow-[0_20px_60px_rgba(22,26,40,0.12)] sm:h-[calc(100vh-3rem)]">
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
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/20 text-white">
                <Image
                  src={workspaceLogo ?? "/logo_organization.png"}
                  alt="Workspace logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized={Boolean(workspaceLogo)}
                />
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
                {isEntitlementsLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-9 w-full rounded-xl bg-white/20" />
                    ))
                  : visibleModules.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`rounded-xl px-3 py-2 transition hover:bg-white/20 ${
                          pathname === item.href
                            ? "bg-white/20 text-white"
                            : "text-white/70"
                        }`}
                      >
                        {t.modules[item.key as keyof typeof t.modules]}
                      </Link>
                    ))}
              </nav>
            </div>
          </div>
        </aside>
        <aside className="hidden h-full w-64 flex-col bg-[var(--sidebar)] p-6 text-[var(--sidebar-text)] lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/20 text-white">
              <Image
                src={workspaceLogo ?? "/logo_organization.png"}
                alt="Workspace logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                unoptimized={Boolean(workspaceLogo)}
              />
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
                {isEntitlementsLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-9 w-full rounded-xl bg-white/20" />
                    ))
                  : visibleModules.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={`rounded-xl px-3 py-2 transition hover:bg-white/20 ${
                          pathname === item.href
                            ? "bg-white/20 text-white"
                            : "text-white/70"
                        }`}
                      >
                        {t.modules[item.key as keyof typeof t.modules]}
                      </Link>
                    ))}
              </nav>
            </div>

          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              href="/settings/users"
              className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/20 ${
                pathname === "/settings/users"
                  ? "bg-white/20 text-white"
                  : "text-white/70"
              }`}
            >
              {t.layout.members}
            </Link>
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

        <main className="flex min-h-0 flex-1 flex-col">
          <header className="relative z-40 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-zinc-600 lg:hidden"
                type="button"
                onClick={() => setMobileOpen(true)}
              >
                ☰
              </button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (lastRoute && lastRoute !== pathname) {
                    router.push(lastRoute);
                  }
                }}
                disabled={!lastRoute || lastRoute === pathname}
              >
                {t.layout.back}
              </Button>
            </div>
            <h1 className="text-center text-lg font-semibold">{pageTitle}</h1>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              >
                {t.layout.language}: {language.toUpperCase()}
              </Button>
              <Button variant="secondary" onClick={toggleTheme}>
                {t.layout.theme}: {theme === "light" ? "Light" : "Dark"}
              </Button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-semibold">
                    {profilePhoto ? (
                      <Image
                        src={profilePhoto}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : profileName ? (
                      getInitials(profileName)
                    ) : profileEmail ? (
                      getEmailInitial(profileEmail)
                    ) : (
                      "👤"
                    )}
                  </span>
                  <span className="text-zinc-700">
                    {profileName || profileEmail}
                  </span>
                  <span className="text-xs text-zinc-500">▾</span>
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)] shadow-lg">
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        {t.layout.profileSettings}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        {t.layout.workspaceSettings}
                      </Link>
                      <Link
                        href="/workspaces/share"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        {t.layout.shareWorkspace}
                      </Link>
                      <Link
                        href="/workspaces/new"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        {t.layout.newWorkspace}
                      </Link>
                    </div>
                    <div className="my-3 h-px bg-[var(--border)]" />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] opacity-60">
                        {t.layout.workspaces}
                      </p>
                      {isWorkspacesLoading ? (
                        <Skeleton className="h-10 w-full rounded-xl" />
                      ) : (
                        <select
                          value={activeWorkspaceId ?? ""}
                          onChange={(event) => {
                            setActiveWorkspace(event.target.value);
                            setWorkspaceId(event.target.value);
                          }}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        >
                          {workspaces.map((workspace) => (
                            <option key={workspace.id} value={workspace.id}>
                              {workspace.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <Button className="mt-3 w-full" variant="secondary" onClick={handleLogout}>
                      {t.layout.logout}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-[var(--surface-muted)] p-6 sm:p-8">
            <div key={pathname} className="page-transition">
              {children}
            </div>
          </div>
        </main>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        {supportOpen ? (
          <div className="mb-3 w-80 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Suporte</p>
                <p className="text-xs text-zinc-500">
                  Vamos te responder o quanto antes 💙
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSupportSubmit}>
              <Input
                placeholder="Seu nome"
                value={supportName}
                onChange={(event) => setSupportName(event.target.value)}
              />
              <Input
                placeholder="Seu email ou WhatsApp"
                value={supportContact}
                onChange={(event) => setSupportContact(event.target.value)}
              />
              <textarea
                className="h-28 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Como podemos ajudar?"
                value={supportMessage}
                onChange={(event) => setSupportMessage(event.target.value)}
              />
              <Button type="submit" className="w-full">
                Enviar mensagem
              </Button>
              {supportSent ? (
                <p className="text-center text-xs text-emerald-600">
                  Abrimos seu email com a mensagem pronta.
                </p>
              ) : null}
            </form>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setSupportOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)] transition hover:translate-y-[-2px]"
          aria-label="Abrir suporte"
        >
          💬
        </button>
      </div>
    </div>
  );
}
