"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { useLanguage } from "@/lib/i18n/language-context";
import { listUsers } from "@/lib/api/users";
import { createWorkspaceInvite } from "@/lib/api/workspace-invites";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
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
          listUsers({ page: 1, pageSize: 200 }),
          listWorkspaceRoles({ workspaceId, page: 1, pageSize: 200 }),
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
        const name =
          [profile?.firstName, profile?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          user?.name ||
          `${membership.userId.slice(0, 8)}...`;
        return {
          id: `${membership.id}-${index}`,
          membershipId: membership.id,
          userId: membership.userId,
          name,
          email: user?.email ?? "-",
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

  const openPermissions = (row: MemberRow) => {
    setPermissionsTarget(row);
    setSelectedRoleIds(row.roleIds);
    setPermissionsError(null);
    setPermissionsOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleSavePermissions = async () => {
    if (!permissionsTarget) return;
    if (!canManage) {
      setPermissionsError(t.members.permissionsBlocked);
      return;
    }

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

  const handleInvite = async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    if (!canManage) {
      setInviteError(t.members.inviteBlocked);
      return;
    }

    setInviteError(null);
    setInviteSuccess(null);

    try {
      await createWorkspaceInvite({ workspaceId, email: inviteEmail.trim() });
      setInviteSuccess(t.members.inviteSuccess);
      setInviteEmail("");
      setInviteOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setInviteError(err.message);
      } else {
        setInviteError(t.members.inviteError);
      }
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
            onClick={() => setInviteOpen(true)}
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
            <div className="min-w-[880px] divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-[40px_1.4fr_1fr_1.2fr_1fr_120px] gap-4 bg-[var(--surface-muted)] px-4 py-3 text-xs font-semibold uppercase text-zinc-500">
                <span>#</span>
                <span>{t.members.tableName}</span>
                <span>{t.members.tableRole}</span>
                <span>{t.members.tableEmail}</span>
                <span>{t.members.tablePhone}</span>
                <span>{t.members.tableStatus}</span>
              </div>
              {filteredRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[40px_1.4fr_1fr_1.2fr_1fr_120px] items-center gap-4 px-4 py-3 text-sm"
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
                      ) : (
                        row.name.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">
                        {row.name}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-zinc-500 hover:text-zinc-700"
                        onClick={() => openPermissions(row)}
                        disabled={!canManage}
                      >
                        {t.members.permissionsAction}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>
                  {t.members.cancelAction}
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail.trim() || !canManage}>
                  {t.members.inviteAction}
                </Button>
              </div>
            </div>
          </Card>
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
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      disabled={!canManage}
                    />
                    {role.key}
                  </label>
                ))}
              </div>
              {permissionsError ? (
                <p className="text-sm text-red-600">{permissionsError}</p>
              ) : null}
              {!canManage ? (
                <p className="text-xs text-zinc-500">
                  {t.members.permissionsBlocked}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPermissionsOpen(false)}>
                  {t.members.cancelAction}
                </Button>
                <Button onClick={handleSavePermissions} disabled={!canManage || isSavingPermissions}>
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
