"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { useLanguage } from "@/lib/i18n/language-context";
import { getUserById, listUsers, lookupUserByEmail } from "@/lib/api/users";
import { createWorkspaceInvite } from "@/lib/api/workspace-invites";
import {
  createWorkspaceMembership,
  getWorkspaceMemberships,
} from "@/lib/api/workspace-memberships";
import { getMyProfile, listUserProfiles } from "@/lib/api/user-profile";
import { listWorkspaceRoles, type WorkspaceRole } from "@/lib/api/roles";
import {
  createMembershipRole,
  deleteMembershipRole,
  listMembershipRoles,
} from "@/lib/api/membership-roles";

const MANAGE_ROLE_KEYS = new Set(["ADMIN", "RH", "OWNER"]);

type MemberRow = {
  id: string;
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
  status: string;
  roleIds: string[];
  roleKeys: string[];
};

export default function UsersClient() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [roles, setRoles] = useState<WorkspaceRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [canManage, setCanManage] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteNotFound, setInviteNotFound] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteSentOpen, setInviteSentOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [permissionsTarget, setPermissionsTarget] = useState<MemberRow | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [membershipsResult, profilesResult, usersResult, rolesResult, myProfileResult] =
        await Promise.allSettled([
          getWorkspaceMemberships(workspaceId),
          listUserProfiles({ page: 1, pageSize: 200 }),
          listUsers({ page: 1, pageSize: 1000, orderBy: "createdAt" }),
          listWorkspaceRoles({ workspaceId, page: 1, pageSize: 100 }),
          getMyProfile(),
        ]);

      const membershipsResponse =
        membershipsResult.status === "fulfilled" ? membershipsResult.value : null;
      const profilesResponse =
        profilesResult.status === "fulfilled" ? profilesResult.value : null;
      const usersResponse =
        usersResult.status === "fulfilled" ? usersResult.value : null;
      const rolesResponse =
        rolesResult.status === "fulfilled" ? rolesResult.value : null;
      const myProfile =
        myProfileResult.status === "fulfilled" ? myProfileResult.value : null;

      const membershipItems = membershipsResponse?.items ?? [];
      setRoles(rolesResponse?.items ?? []);

      const profileMap = new Map(
        (profilesResponse?.items ?? []).map((profile) => [profile.userId, profile]),
      );
      const usersMap = new Map(
        (usersResponse?.items ?? []).map((user) => [user.id, user]),
      );

      const missingUserIds = membershipItems
        .map((membership) => membership.userId)
        .filter((userId) => !usersMap.has(userId));

      if (missingUserIds.length) {
        const missingResults = await Promise.allSettled(
          missingUserIds.map((userId) => getUserById(userId)),
        );

        missingResults.forEach((result) => {
          if (result.status === "fulfilled") {
            usersMap.set(result.value.id, result.value);
          }
        });
      }

      const membershipRolesResults = await Promise.allSettled(
        membershipItems.map((membership) =>
          listMembershipRoles({ membershipId: membership.id, page: 1, pageSize: 100 }),
        ),
      );

      const membershipRolesById = new Map<string, string[]>();
      const membershipRoleIdsById = new Map<string, string[]>();

      membershipRolesResults.forEach((result, index) => {
        const membership = membershipItems[index];
        if (!membership) return;
        if (result.status === "fulfilled") {
          const roleIds = result.value.items.map((item) => item.roleId);
          const roleKeys = roleIds
            .map((roleId) => rolesResponse?.items?.find((role) => role.id === roleId)?.key)
            .filter(Boolean) as string[];
          membershipRolesById.set(membership.id, roleKeys);
          membershipRoleIdsById.set(membership.id, roleIds);
        }
      });

      const rowsData: MemberRow[] = membershipItems.map((membership, index) => {
        const profile = profileMap.get(membership.userId);
        const user = usersMap.get(membership.userId);
        const roleKeys = membershipRolesById.get(membership.id) ?? [];
        const roleIds = membershipRoleIdsById.get(membership.id) ?? [];
        const nameFromProfile = [profile?.firstName, profile?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        const name = nameFromProfile || user?.name || user?.email || "-";
        return {
          id: `${membership.id}-${index}`,
          membershipId: membership.id,
          userId: membership.userId,
          name,
          email: user?.email ?? (name.includes("@") ? name : "-"),
          phone: profile?.phone ?? "-",
          photoUrl: profile?.photoUrl ?? user?.pictureUrl ?? null,
          status: membership.status,
          roleIds,
          roleKeys,
        };
      });

      setRows(rowsData);

      const myMembership = membershipItems.find(
        (membership) => membership.userId === myProfile?.userId,
      );
      if (myMembership) {
        const myRoles = membershipRolesById.get(myMembership.id) ?? [];
        setCanManage(myRoles.some((role) => MANAGE_ROLE_KEYS.has(role)));
      } else {
        setCanManage(false);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.members.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (roleFilter !== "all" && !row.roleIds.includes(roleFilter)) {
        return false;
      }
      if (!trimmed) return true;
      return (
        row.name.toLowerCase().includes(trimmed) ||
        row.email.toLowerCase().includes(trimmed)
      );
    });
  }, [rows, query, roleFilter]);

  const openPermissions = async (row: MemberRow) => {
    setPermissionsTarget(row);
    setSelectedRoleIds(row.roleIds);
    setPermissionsError(null);
    setPermissionsOpen(true);

    if (roles.length > 0) {
      return;
    }

    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      setPermissionsError(t.members.loadError);
      return;
    }

    try {
      const rolesResponse = await listWorkspaceRoles({
        workspaceId,
        page: 1,
        pageSize: 100,
      });
      setRoles(rolesResponse.items ?? []);
    } catch (err) {
      if (err instanceof ApiError) {
        setPermissionsError(err.message);
      } else {
        setPermissionsError(t.members.loadError);
      }
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleSavePermissions = async () => {
    if (!permissionsTarget) return;
    setIsSavingPermissions(true);
    setPermissionsError(null);

    const current = new Set(permissionsTarget.roleIds);
    const next = new Set(selectedRoleIds);

    const toAdd = selectedRoleIds.filter((roleId) => !current.has(roleId));
    const toRemove = permissionsTarget.roleIds.filter((roleId) => !next.has(roleId));

    try {
      await Promise.all([
        ...toAdd.map((roleId) =>
          createMembershipRole({ membershipId: permissionsTarget.membershipId, roleId }),
        ),
        ...toRemove.map((roleId) =>
          deleteMembershipRole({ membershipId: permissionsTarget.membershipId, roleId }),
        ),
      ]);

      setPermissionsOpen(false);
      await loadMembers();
    } catch (err) {
      if (err instanceof ApiError) {
        setPermissionsError(err.message);
      } else {
        setPermissionsError(t.members.permissionsSaveError);
      }
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleInviteLookup = async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    if (!canManage) {
      setInviteError(t.members.inviteBlocked);
      return;
    }

    if (!inviteEmail.trim()) {
      setInviteError(t.members.inviteError);
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    setInviteNotFound(false);
    setInviteLink(null);

    try {
      const user = await lookupUserByEmail(inviteEmail.trim().toLowerCase());
      await createWorkspaceMembership({
        workspaceId,
        userId: user.id,
        status: "ACTIVE",
      });
      setInviteSuccess("Usuário encontrado e compartilhamento enviado com sucesso.");
      setInviteEmail("");
      await loadMembers();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 404) {
        setInviteNotFound(true);
        setInviteError("Usuário não encontrado. Envie o convite abaixo.");
      } else if (err instanceof ApiError) {
        setInviteError(err.message);
      } else {
        setInviteError(t.members.inviteError);
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInviteSend = async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    if (!canManage) {
      setInviteError(t.members.inviteBlocked);
      return;
    }

    if (!inviteEmail.trim()) {
      setInviteError(t.members.inviteError);
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const invite = await createWorkspaceInvite({
        workspaceId,
        email: inviteEmail.trim().toLowerCase(),
      });
      const origin = window.location.origin;
      const link = `${origin}/register?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;
      setInviteLink(link);
      setInviteSuccess("Convite enviado por e-mail.");
      setInviteSentOpen(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setInviteError(err.message);
      } else {
        setInviteError(t.members.inviteError);
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteSuccess("Link do convite copiado.");
    } catch {
      setInviteError("Não foi possível copiar o link.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t.members.title}</h2>
          <p className="text-sm text-zinc-600">{t.members.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              setInviteOpen(true);
              setInviteEmail("");
              setInviteError(null);
              setInviteSuccess(null);
              setInviteNotFound(false);
              setInviteLink(null);
            }}
            disabled={!canManage}
          >
            {t.members.inviteAction}
          </Button>
          {!canManage ? (
            <span className="text-xs text-zinc-500">{t.members.inviteBlocked}</span>
          ) : null}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.members.searchPlaceholder}
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="all">{t.members.filterAll}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.key}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {isLoading ? (
          <p className="mt-4 text-sm text-zinc-500">{t.members.loading}</p>
        ) : null}

        {!isLoading && filteredRows.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">{t.members.empty}</p>
        ) : null}

        {!isLoading && filteredRows.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[940px] divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-[40px_1.4fr_1fr_1.2fr_1fr_120px_60px] gap-4 bg-[var(--surface-muted)] px-4 py-3 text-xs font-semibold uppercase text-zinc-500">
                <span>#</span>
                <span>{t.members.tableName}</span>
                <span>{t.members.tableRole}</span>
                <span>{t.members.tableEmail}</span>
                <span>{t.members.tablePhone}</span>
                <span>{t.members.tableStatus}</span>
                <span />
              </div>
              {filteredRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[40px_1.4fr_1fr_1.2fr_1fr_120px_60px] items-center gap-4 px-4 py-3 text-sm"
                >
                  <span className="text-zinc-500">{index + 1}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-semibold">
                      {row.photoUrl ? (
                        <Image
                          src={row.photoUrl}
                          alt={row.name}
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : row.name !== "-" ? (
                        row.name.slice(0, 2).toUpperCase()
                      ) : row.email !== "-" ? (
                        row.email.slice(0, 2).toUpperCase()
                      ) : (
                        "👤"
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">
                        {row.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {row.roleKeys.length ? (
                      row.roleKeys.map((role) => (
                        <span
                          key={`${row.id}-${role}`}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[11px]"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">
                        {t.members.rolesEmpty}
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-600">{row.email}</span>
                  <span className="text-zinc-600">{row.phone}</span>
                  <span className="text-xs text-zinc-500">{row.status}</span>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => openPermissions(row)}
                      className="h-8 w-8 p-0"
                    >
                      ✏️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      {inviteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setInviteOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-lg">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold">{t.members.inviteTitle}</h3>
                <p className="text-sm text-zinc-600">{t.members.inviteSubtitle}</p>
              </div>
              <Input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder={t.members.invitePlaceholder}
              />
              {inviteError ? (
                <p className="text-sm text-red-600">{inviteError}</p>
              ) : null}
              {inviteSuccess ? (
                <p className="text-sm text-emerald-600">{inviteSuccess}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleInviteLookup}
                  disabled={inviteLoading || !canManage}
                  variant="secondary"
                >
                  {inviteLoading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>
                  {t.members.cancelAction}
                </Button>
              </div>
              {inviteNotFound ? (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-[var(--surface-muted)] p-3 text-sm text-zinc-700">
                  <span className="font-medium">
                    {inviteEmail.trim().toLowerCase()}
                  </span>
                  <Button onClick={handleInviteSend} disabled={inviteLoading || !canManage}>
                    {inviteLoading ? "Enviando..." : "Enviar e-mail"}
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}

      {inviteSentOpen ? (
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
              <Button variant="secondary" onClick={() => setInviteSentOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {permissionsOpen && permissionsTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setPermissionsOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-lg">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold">{t.members.permissionsTitle}</h3>
                <p className="text-sm text-zinc-600">{permissionsTarget.name}</p>
              </div>
              <div className="grid gap-2">
                {roles.length ? (
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                      />
                      {role.key}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    {t.members.rolesEmpty}
                  </p>
                )}
              </div>
              {permissionsError ? (
                <p className="text-sm text-red-600">{permissionsError}</p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPermissionsOpen(false)}>
                  {t.members.cancelAction}
                </Button>
                <Button onClick={handleSavePermissions} disabled={isSavingPermissions}>
                  {isSavingPermissions ? t.members.savingAction : t.members.saveAction}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
