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

// Role badge colours by key
function getRoleBadgeClass(roleKey: string): string {
  const key = roleKey.toUpperCase();
  if (key === "ADMIN" || key === "OWNER") return "bg-blue-500/10 text-blue-600";
  if (key === "RH" || key === "HR") return "bg-emerald-500/10 text-emerald-600";
  if (key === "VIEWER") return "bg-amber-500/10 text-amber-600";
  return "bg-[var(--surface-muted)] text-[var(--foreground)]/60 border border-[var(--border)]";
}

// Status dot colours
function getStatusDot(status: string): { dotClass: string; label: string } {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return { dotClass: "bg-emerald-500", label: "active" };
  if (s === "PENDING") return { dotClass: "bg-amber-400", label: "pending" };
  return { dotClass: "bg-zinc-400", label: "inactive" };
}

function EmptyPeopleIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="text-[var(--foreground)]/20"
    >
      <circle cx="18" cy="16" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 38c0-6.627 5.373-12 12-12h0c2.21 0 4.282.596 6.065 1.635"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="20" r="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M22 40c0-5.523 4.477-10 10-10s10 4.477 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      setInviteSuccess(t.members.inviteSuccess);
      setInviteEmail("");
      await loadMembers();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 404) {
        setInviteNotFound(true);
        setInviteError(t.members.inviteError);
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
      setInviteSuccess(t.members.inviteSuccess);
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
      setInviteSuccess(t.members.inviteSuccess);
    } catch {
      setInviteError(t.members.inviteError);
    }
  };

  const memberCount = filteredRows.length;
  const memberCountLabel =
    memberCount === 1
      ? t.members.count.replace("{n}", String(memberCount))
      : t.members.countPlural.replace("{n}", String(memberCount));

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">
            {t.members.title}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--foreground)]/50">{t.members.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canManage && (
            <Button
              onClick={() => {
                setInviteOpen(true);
                setInviteEmail("");
                setInviteError(null);
                setInviteSuccess(null);
                setInviteNotFound(false);
                setInviteLink(null);
              }}
            >
              + {t.members.inviteAction}
            </Button>
          )}
          {!canManage && (
            <span className="text-xs text-[var(--foreground)]/40">{t.members.inviteBlocked}</span>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Search bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b [border-color:var(--border)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.members.searchPlaceholder}
              className="w-64"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="all">{t.members.filterAll}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.key}
                </option>
              ))}
            </select>
          </div>
          {!isLoading && (
            <span className="text-xs text-[var(--foreground)]/40">{memberCountLabel}</span>
          )}
        </div>

        {error && <p className="px-5 py-4 text-sm text-red-500">{error}</p>}

        {isLoading && (
          <p className="px-5 py-6 text-sm text-[var(--foreground)]/40">{t.members.loading}</p>
        )}

        {/* Empty state */}
        {!isLoading && filteredRows.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <EmptyPeopleIcon />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{t.members.emptyTitle}</p>
              <p className="mt-1 text-xs text-[var(--foreground)]/40">{t.members.emptySubtitle}</p>
            </div>
            {canManage && (
              <Button
                onClick={() => {
                  setInviteOpen(true);
                  setInviteEmail("");
                  setInviteError(null);
                  setInviteSuccess(null);
                  setInviteNotFound(false);
                  setInviteLink(null);
                }}
              >
                + {t.members.inviteAction}
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {!isLoading && filteredRows.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header */}
              <div className="grid grid-cols-[40px_2fr_1fr_1fr_140px_60px] gap-4 bg-[var(--surface-muted)] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                <span>#</span>
                <span>{t.members.columnMember}</span>
                <span>{t.members.columnRole}</span>
                <span>{t.members.columnPhone}</span>
                <span>{t.members.columnStatus}</span>
                <span />
              </div>
              {/* Rows */}
              <div className="divide-y [border-color:var(--border)]">
                {filteredRows.map((row, index) => {
                  const { dotClass, label } = getStatusDot(row.status);
                  const statusLabel =
                    label === "active"
                      ? t.members.statusActive
                      : label === "pending"
                        ? t.members.statusPending
                        : t.members.statusInactive;
                  const displayName =
                    row.name !== "-" && row.name !== row.email ? row.name : null;
                  const initials = displayName
                    ? displayName.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")
                    : row.email !== "-"
                      ? row.email.slice(0, 2).toUpperCase()
                      : "?";

                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-[40px_2fr_1fr_1fr_140px_60px] items-center gap-4 px-5 py-3.5 text-sm transition-colors duration-100 hover:bg-[var(--surface-muted)]"
                    >
                      <span className="text-xs text-[var(--foreground)]/30">{index + 1}</span>

                      {/* Member cell: avatar + name + email */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-xs font-semibold text-[var(--foreground)]/70">
                          {row.photoUrl ? (
                            <Image
                              src={row.photoUrl}
                              alt={displayName ?? row.email}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            initials
                          )}
                        </span>
                        <div className="min-w-0">
                          {displayName ? (
                            <>
                              <p className="truncate font-semibold text-[var(--foreground)]">
                                {displayName}
                              </p>
                              <p className="truncate text-xs text-[var(--foreground)]/40">{row.email}</p>
                            </>
                          ) : (
                            <>
                              <p className="truncate font-semibold text-[var(--foreground)]">
                                {row.email !== "-" ? row.email : "—"}
                              </p>
                              <p className="truncate text-xs text-[var(--foreground)]/40 italic">
                                {t.members.noNameSet}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Role badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.roleKeys.length ? (
                          row.roleKeys.map((roleKey) => (
                            <span
                              key={`${row.id}-${roleKey}`}
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getRoleBadgeClass(roleKey)}`}
                            >
                              {roleKey}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[var(--foreground)]/30">{t.members.rolesEmpty}</span>
                        )}
                      </div>

                      {/* Phone */}
                      <span className="text-xs text-[var(--foreground)]/50">{row.phone}</span>

                      {/* Status dot */}
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
                        <span className="text-xs text-[var(--foreground)]/60">{statusLabel}</span>
                      </div>

                      {/* Edit */}
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => openPermissions(row)}
                          className="text-xs font-semibold text-[var(--sidebar)] underline-offset-2 hover:underline"
                        >
                          {t.members.editAction}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Invite modal */}
      {inviteOpen && (
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
                <p className="text-sm text-[var(--foreground)]/50">{t.members.inviteSubtitle}</p>
              </div>
              <Input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder={t.members.invitePlaceholder}
              />
              {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
              {inviteSuccess && <p className="text-sm text-emerald-600">{inviteSuccess}</p>}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleInviteLookup}
                  disabled={inviteLoading || !canManage}
                  variant="secondary"
                >
                  {inviteLoading ? t.members.savingAction : t.members.inviteAction}
                </Button>
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>
                  {t.members.cancelAction}
                </Button>
              </div>
              {inviteNotFound && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border [border-color:var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--foreground)]/70">
                  <span className="font-medium">{inviteEmail.trim().toLowerCase()}</span>
                  <Button onClick={handleInviteSend} disabled={inviteLoading || !canManage}>
                    {inviteLoading ? t.members.savingAction : "Send email"}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Invite sent modal */}
      {inviteSentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{t.members.inviteTitle}</h3>
            <p className="mt-2 text-sm text-[var(--foreground)]/50">{t.members.inviteSuccess}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleCopyInviteLink} disabled={!inviteLink}>
                Copy invite link
              </Button>
              <Button variant="secondary" onClick={() => setInviteSentOpen(false)}>
                {t.members.cancelAction}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions modal */}
      {permissionsOpen && permissionsTarget && (
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
                <p className="text-sm text-[var(--foreground)]/50">{permissionsTarget.name}</p>
              </div>
              <div className="grid gap-2">
                {roles.length ? (
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border [border-color:var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
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
                  <p className="text-sm text-[var(--foreground)]/40">{t.members.rolesEmpty}</p>
                )}
              </div>
              {permissionsError && <p className="text-sm text-red-500">{permissionsError}</p>}
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
      )}
    </div>
  );
}
