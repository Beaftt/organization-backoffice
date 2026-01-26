"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import {
  createReminderItem,
  createReminderList,
  deleteReminderItem,
  deleteReminderList,
  listReminderItems,
  listReminderLists,
  updateReminderItem,
  updateReminderList,
  type ReminderFinanceType,
  type ReminderItem,
  type ReminderItemStatus,
  type ReminderList,
  type ReminderListRecurrence,
} from "@/lib/api/reminders";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { getMyProfile, listUserProfiles } from "@/lib/api/user-profile";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { useLanguage } from "@/lib/i18n/language-context";

const resetDay = 1;

type MemberOption = {
  userId: string;
  label: string;
  photoUrl?: string | null;
};

export default function RemindersPage() {
  const { t } = useLanguage();
  const [lists, setLists] = useState<ReminderList[]>([]);
  const [itemsByList, setItemsByList] = useState<Record<string, ReminderItem[]>>(
    {},
  );
  const [selectedId, setSelectedId] = useState<string>("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [listForm, setListForm] = useState({
    title: "",
    description: "",
    monthlyReset: false,
    resetDay: resetDay,
    linkFinance: false,
    linkCalendar: false,
    isPrivate: false,
    allowedUserIds: [] as string[],
  });
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [itemForm, setItemForm] = useState({
    notes: "",
    dueDate: "",
    financeType: "" as "" | ReminderFinanceType,
    financeCategory: "",
    financeTags: "",
    status: "PENDING" as ReminderItemStatus,
    assigneeIds: [] as string[],
  });
  const [members, setMembers] = useState<MemberOption[]>([]);

  const membersById = useMemo(
    () => new Map(members.map((member) => [member.userId, member])),
    [members],
  );

  const getInitials = (label: string) =>
    label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedId) ?? lists[0] ?? null,
    [lists, selectedId],
  );

  const selectedItems = selectedList ? itemsByList[selectedList.id] ?? [] : [];
  const selectedItem = selectedItems.find((item) => item.id === selectedItemId) ?? null;

  const loadLists = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listReminderLists({
        page: 1,
        pageSize: 50,
        orderBy: "updatedAt",
        orderDirection: "desc",
      });
      setLists(response.items);
      if (response.items.length && !selectedId) {
        setSelectedId(response.items[0].id);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async (listId: string) => {
    try {
      const response = await listReminderItems({
        listId,
        page: 1,
        pageSize: 100,
        orderBy: "createdAt",
        orderDirection: "asc",
      });
      setItemsByList((prev) => ({ ...prev, [listId]: response.items }));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.loadError);
      }
    }
  };

  const loadMembers = async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;

    try {
      const [membershipsResult, profilesResult, myProfileResult] =
        await Promise.allSettled([
        getWorkspaceMemberships(workspaceId),
        listUserProfiles({ page: 1, pageSize: 100 }),
        getMyProfile(),
      ]);

      const memberships =
        membershipsResult.status === "fulfilled" ? membershipsResult.value : null;
      const profiles =
        profilesResult.status === "fulfilled" ? profilesResult.value : null;
      const myProfile =
        myProfileResult.status === "fulfilled" ? myProfileResult.value : null;

      const profileMap = new Map(
        (profiles?.items ?? []).map((profile) => [
          profile.userId,
          {
            label: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim(),
            photoUrl: profile.photoUrl,
          },
        ]),
      );

      const membershipMembers = (memberships?.items ?? []).map((membership) => ({
        userId: membership.userId,
        label:
          profileMap.get(membership.userId)?.label ||
          `${membership.userId.slice(0, 8)}...`,
        photoUrl: profileMap.get(membership.userId)?.photoUrl,
      }));

      const membersMap = new Map(
        membershipMembers.map((member) => [member.userId, member]),
      );

      if (myProfile) {
        const myLabel = `${myProfile.firstName ?? ""} ${
          myProfile.lastName ?? ""
        }`.trim();
        membersMap.set(myProfile.userId, {
          userId: myProfile.userId,
          label: myLabel || `${myProfile.userId.slice(0, 8)}...`,
          photoUrl: myProfile.photoUrl,
        });
      }

      setMembers(Array.from(membersMap.values()));

      const membershipError =
        membershipsResult.status === "rejected" ? membershipsResult.reason : null;
      const profileError =
        profilesResult.status === "rejected" ? profilesResult.reason : null;

      if (membershipError instanceof ApiError && membershipError.statusCode === 403) {
        return;
      }

      if (membershipError || profileError) {
        const err = membershipError ?? profileError;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(t.reminders.loadError);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.loadError);
      }
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if ((isCreatingList || isMemberPickerOpen) && !members.length) {
      loadMembers();
    }
  }, [isCreatingList, isMemberPickerOpen, members.length]);

  useEffect(() => {
    if (!lists.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !lists.some((list) => list.id === selectedId)) {
      setSelectedId(lists[0].id);
    }
  }, [lists, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    loadItems(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedList) return;
    setSelectedItemId(null);
    setIsSettingsOpen(false);
  }, [selectedList?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedItemId) {
        setSelectedItemId(null);
      }
      if (isCreatingList) {
        setIsCreatingList(false);
      }
    };

    if (selectedItemId || isCreatingList) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItemId, isCreatingList]);

  useEffect(() => {
    if (!selectedItem) return;
    setItemForm({
      notes: selectedItem.notes ?? "",
      dueDate: selectedItem.dueDate ?? "",
      financeType: selectedItem.financeType ?? "",
      financeCategory: selectedItem.financeCategory ?? "",
      financeTags: selectedItem.financeTags?.join(", ") ?? "",
      status: selectedItem.status,
      assigneeIds: selectedItem.assigneeIds ?? [],
    });
  }, [selectedItem?.id]);

  const handleCreateList = async () => {
    if (!listForm.title.trim()) return;
    setIsSavingList(true);
    setError(null);

    try {
      const recurrence: ReminderListRecurrence = listForm.monthlyReset
        ? "MONTHLY"
        : "NONE";

      const created = await createReminderList({
        title: listForm.title.trim(),
        description: listForm.description.trim() || undefined,
        recurrence,
        resetDay: listForm.monthlyReset ? listForm.resetDay : null,
        linkToFinance: listForm.linkFinance,
        linkToCalendar: listForm.linkCalendar,
        isPrivate: listForm.isPrivate,
        allowedUserIds: listForm.isPrivate ? listForm.allowedUserIds : undefined,
      });

      setLists((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setItemsByList((prev) => ({ ...prev, [created.id]: [] }));
      setIsCreatingList(false);
      setListForm({
        title: "",
        description: "",
        monthlyReset: false,
        resetDay: resetDay,
        linkFinance: false,
        linkCalendar: false,
        isPrivate: false,
        allowedUserIds: [],
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.saveError);
      }
    } finally {
      setIsSavingList(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    if (!selectedList) return;
    const items = itemsByList[selectedList.id] ?? [];
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    setIsUpdatingItem(true);
    setError(null);

    const nextStatus: ReminderItemStatus =
      item.status === "DONE" ? "PENDING" : "DONE";

    try {
      const updated = await updateReminderItem({
        listId: selectedList.id,
        id: item.id,
        status: nextStatus,
      });
      setItemsByList((prev) => ({
        ...prev,
        [selectedList.id]: prev[selectedList.id]?.map((entry) =>
          entry.id === item.id ? updated : entry,
        ) ?? [],
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.updateError);
      }
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const addItem = async () => {
    if (!selectedList || !newItemTitle.trim()) return;
    setIsUpdatingItem(true);
    setError(null);

    try {
      const created = await createReminderItem({
        listId: selectedList.id,
        title: newItemTitle.trim(),
      });
      setItemsByList((prev) => ({
        ...prev,
        [selectedList.id]: [...(prev[selectedList.id] ?? []), created],
      }));
      setNewItemTitle("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.saveError);
      }
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const updateListFlag = async (
    key: "monthlyReset" | "linkFinance" | "linkCalendar",
    value: boolean,
  ) => {
    if (!selectedList) return;
    setIsUpdatingList(true);
    setError(null);

    const recurrence: ReminderListRecurrence =
      key === "monthlyReset"
        ? value
          ? "MONTHLY"
          : "NONE"
        : selectedList.recurrence;

    const updated = await updateReminderList({
      id: selectedList.id,
      recurrence,
      resetDay:
        recurrence === "MONTHLY" ? selectedList.resetDay ?? resetDay : null,
      linkToFinance:
        key === "linkFinance" ? value : selectedList.linkToFinance,
      linkToCalendar:
        key === "linkCalendar" ? value : selectedList.linkToCalendar,
    }).catch((err) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.updateError);
      }
      return null;
    });

    if (updated) {
      setLists((prev) =>
        prev.map((list) => (list.id === updated.id ? updated : list)),
      );
    }

    setIsUpdatingList(false);
  };

  const updateListMembers = async (nextAllowedUserIds: string[]) => {
    if (!selectedList) return;
    setIsUpdatingList(true);
    setError(null);

    try {
      const updated = await updateReminderList({
        id: selectedList.id,
        allowedUserIds: nextAllowedUserIds,
      });
      setLists((prev) =>
        prev.map((list) => (list.id === updated.id ? updated : list)),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.updateError);
      }
    } finally {
      setIsUpdatingList(false);
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;
    const confirmed = window.confirm(t.reminders.confirmDeleteList);
    if (!confirmed) return;
    setIsUpdatingList(true);
    setError(null);

    try {
      await deleteReminderList({ id: selectedList.id });
      setLists((prev) => prev.filter((list) => list.id !== selectedList.id));
      setItemsByList((prev) => {
        const next = { ...prev };
        delete next[selectedList.id];
        return next;
      });
      setSelectedId("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.updateError);
      }
    } finally {
      setIsUpdatingList(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedList) return;
    const confirmed = window.confirm(t.reminders.confirmDeleteItem);
    if (!confirmed) return;
    setIsUpdatingItem(true);
    setError(null);

    try {
      await deleteReminderItem({ listId: selectedList.id, id: itemId });
      setItemsByList((prev) => ({
        ...prev,
        [selectedList.id]: prev[selectedList.id]?.filter(
          (item) => item.id !== itemId,
        ) ?? [],
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.updateError);
      }
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const handleSaveItemDetails = async () => {
    if (!selectedList || !selectedItem) return;
    setIsUpdatingItem(true);
    setError(null);

    try {
      const tags = itemForm.financeTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const updated = await updateReminderItem({
        listId: selectedList.id,
        id: selectedItem.id,
        notes: itemForm.notes.trim() || null,
        dueDate: itemForm.dueDate.trim() || null,
        financeType: selectedList.linkToFinance ? itemForm.financeType || null : null,
        financeCategory: selectedList.linkToFinance
          ? itemForm.financeCategory.trim() || null
          : null,
        financeTags: selectedList.linkToFinance ? (tags.length ? tags : null) : null,
        status: itemForm.status,
        assigneeIds: itemForm.assigneeIds,
      });

      setItemsByList((prev) => ({
        ...prev,
        [selectedList.id]: prev[selectedList.id]?.map((item) =>
          item.id === updated.id ? updated : item,
        ) ?? [],
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.updateError);
      }
    } finally {
      setIsUpdatingItem(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.reminders.title}</h2>
          <p className="text-sm text-zinc-600">{t.reminders.subtitle}</p>
        </div>
        <Button onClick={() => setIsCreatingList(true)}>
          {t.reminders.newList}
        </Button>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-rose-600">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {t.reminders.listsTitle}
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-zinc-500">{t.reminders.loading}</p>
            ) : null}
            {!isLoading && !lists.length ? (
              <p className="text-sm text-zinc-500">{t.reminders.emptyItems}</p>
            ) : null}
            {lists.map((list) => {
              const listMembers = (list.allowedUserIds ?? [])
                .map((userId) => membersById.get(userId))
                .filter((member): member is MemberOption => Boolean(member));

              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedId(list.id)}
                  className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    selectedList?.id === list.id
                      ? "border-[var(--border-strong)] bg-[var(--surface-muted)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {list.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {itemsByList[list.id]?.filter((item) => item.status === "DONE")
                        .length ?? 0}
                      /{itemsByList[list.id]?.length ?? 0}
                    </span>
                  </div>
                  {list.description ? (
                    <p className="text-xs text-zinc-500">{list.description}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {list.recurrence === "MONTHLY" ? (
                        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-semibold text-zinc-600">
                          {t.reminders.badges.monthly}
                        </span>
                      ) : null}
                      {list.linkToFinance ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                          {t.reminders.badges.financeLinked}
                        </span>
                      ) : null}
                      {list.linkToCalendar ? (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
                          {t.reminders.badges.calendarLinked}
                        </span>
                      ) : null}
                    </div>
                    {listMembers.length ? (
                      <div className="flex items-center -space-x-2">
                        {listMembers.slice(0, 4).map((member) => (
                          <div
                            key={member?.userId}
                            title={member?.label}
                            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-zinc-600"
                          >
                            {member?.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.label}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(member?.label ?? "")
                            )}
                          </div>
                        ))}
                        {listMembers.length > 4 ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-zinc-600">
                            +{listMembers.length - 4}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t.reminders.itemsTitle}
              </h3>
              {selectedList ? (
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {selectedList.title}
                </p>
              ) : null}
            </div>
            {selectedList ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                >
                  {t.reminders.listSettings}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDeleteList}
                  disabled={isUpdatingList}
                >
                  {t.reminders.deleteList}
                </Button>
              </div>
            ) : null}
          </div>

          {isSettingsOpen && selectedList ? (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedList?.recurrence === "MONTHLY"}
                  onChange={(event) =>
                    updateListFlag("monthlyReset", event.target.checked)
                  }
                  disabled={!selectedList || isUpdatingList}
                />
                {t.reminders.monthlyResetLabel}
              </label>
              {selectedList?.recurrence === "MONTHLY" ? (
                <Input
                  label={t.reminders.listResetDayLabel}
                  placeholder={t.reminders.listResetDayLabel}
                  value={String(selectedList.resetDay ?? resetDay)}
                  onChange={(event) =>
                    updateReminderList({
                      id: selectedList.id,
                      resetDay: Number(event.target.value || resetDay),
                    })
                      .then((updated) => {
                        setLists((prev) =>
                          prev.map((list) =>
                            list.id === updated.id ? updated : list,
                          ),
                        );
                      })
                      .catch((err) => {
                        if (err instanceof ApiError) {
                          setError(err.message);
                        } else {
                          setError(t.reminders.updateError);
                        }
                      })
                  }
                />
              ) : null}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedList?.linkToFinance ?? false}
                  onChange={(event) =>
                    updateListFlag("linkFinance", event.target.checked)
                  }
                  disabled={!selectedList || isUpdatingList}
                />
                {t.reminders.financeLinkLabel}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedList?.linkToCalendar ?? false}
                  onChange={(event) =>
                    updateListFlag("linkCalendar", event.target.checked)
                  }
                  disabled={!selectedList || isUpdatingList}
                />
                {t.reminders.calendarLinkLabel}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedList?.isPrivate ?? false}
                  onChange={(event) =>
                    updateReminderList({
                      id: selectedList.id,
                      isPrivate: event.target.checked,
                      allowedUserIds: event.target.checked
                        ? Array.from(
                            new Set([
                              selectedList.authorId ?? "",
                              ...(selectedList.allowedUserIds ?? []),
                            ].filter(Boolean)),
                          )
                        : selectedList.allowedUserIds ?? null,
                    })
                      .then((updated) => {
                        setLists((prev) =>
                          prev.map((list) =>
                            list.id === updated.id ? updated : list,
                          ),
                        );
                      })
                      .catch((err) => {
                        if (err instanceof ApiError) {
                          setError(err.message);
                        } else {
                          setError(t.reminders.updateError);
                        }
                      })
                  }
                  disabled={!selectedList || isUpdatingList}
                />
                {t.reminders.privateListLabel}
              </label>
              <Button
                variant="secondary"
                onClick={() => {
                  setMemberSearch("");
                  setIsMemberPickerOpen(true);
                }}
              >
                {t.reminders.addUsers}
              </Button>
            </div>
          ) : null}
          {isSettingsOpen && selectedList ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-zinc-600">
                {t.reminders.allowedUsersLabel}
              </p>
              <div className="flex flex-wrap gap-3">
                {members.map((member) => (
                  <label key={member.userId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(selectedList.allowedUserIds ?? []).includes(
                        member.userId,
                      )}
                      onChange={(event) => {
                        const nextAllowed = event.target.checked
                          ? Array.from(
                              new Set([
                                ...(selectedList.allowedUserIds ?? []),
                                member.userId,
                              ]),
                            )
                          : (selectedList.allowedUserIds ?? []).filter(
                              (id) => id !== member.userId,
                            );
                        updateListMembers(nextAllowed);
                      }}
                    />
                    {member.label}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1">
              <Input
                label={t.reminders.addItem}
                placeholder={t.reminders.itemPlaceholder}
                value={newItemTitle}
                onChange={(event) => setNewItemTitle(event.target.value)}
              />
            </div>
            <Button onClick={addItem} disabled={!selectedList || isUpdatingItem}>
              {t.reminders.addItem}
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {selectedItems.length ? (
              selectedItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                    item.id === selectedItemId
                      ? "border-[var(--border-strong)] bg-[var(--surface-muted)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={item.status === "DONE"}
                      onChange={() => toggleItem(item.id)}
                      disabled={isUpdatingItem}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={
                        item.status === "DONE"
                          ? "line-through text-zinc-400"
                          : undefined
                      }
                    >
                      {item.title}
                    </button>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">{t.reminders.emptyItems}</p>
            )}
          </div>

        </Card>
      </div>

      {isCreatingList ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setIsCreatingList(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t.reminders.createList}
              </h4>
              <Button
                variant="secondary"
                onClick={() => setIsCreatingList(false)}
              >
                {t.reminders.cancel}
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label={t.reminders.listTitleLabel}
                placeholder={t.reminders.listTitleLabel}
                value={listForm.title}
                onChange={(event) =>
                  setListForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
              <Input
                label={t.reminders.listDescriptionLabel}
                placeholder={t.reminders.listDescriptionLabel}
                value={listForm.description}
                onChange={(event) =>
                  setListForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={listForm.monthlyReset}
                  onChange={(event) =>
                    setListForm((prev) => ({
                      ...prev,
                      monthlyReset: event.target.checked,
                    }))
                  }
                />
                {t.reminders.monthlyResetLabel}
              </label>
              {listForm.monthlyReset ? (
                <Input
                  label={t.reminders.listResetDayLabel}
                  placeholder={t.reminders.listResetDayLabel}
                  value={String(listForm.resetDay)}
                  onChange={(event) =>
                    setListForm((prev) => ({
                      ...prev,
                      resetDay: Number(event.target.value || resetDay),
                    }))
                  }
                />
              ) : null}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={listForm.linkFinance}
                  onChange={(event) =>
                    setListForm((prev) => ({
                      ...prev,
                      linkFinance: event.target.checked,
                    }))
                  }
                />
                {t.reminders.financeLinkLabel}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={listForm.linkCalendar}
                  onChange={(event) =>
                    setListForm((prev) => ({
                      ...prev,
                      linkCalendar: event.target.checked,
                    }))
                  }
                />
                {t.reminders.calendarLinkLabel}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={listForm.isPrivate}
                  onChange={(event) =>
                    setListForm((prev) => ({
                      ...prev,
                      isPrivate: event.target.checked,
                    }))
                  }
                />
                {t.reminders.privateListLabel}
              </label>
            </div>
            {listForm.isPrivate ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-zinc-600">
                  {t.reminders.allowedUsersLabel}
                </p>
                <div className="flex flex-wrap gap-3">
                  {members.map((member) => (
                    <label key={member.userId} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={listForm.allowedUserIds.includes(member.userId)}
                        onChange={(event) =>
                          setListForm((prev) => ({
                            ...prev,
                            allowedUserIds: event.target.checked
                              ? [...prev.allowedUserIds, member.userId]
                              : prev.allowedUserIds.filter(
                                  (id) => id !== member.userId,
                                ),
                          }))
                        }
                      />
                      {member.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleCreateList} disabled={isSavingList}>
                {t.reminders.createList}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsCreatingList(false)}
                disabled={isSavingList}
              >
                {t.reminders.cancel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setSelectedItemId(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.reminders.itemDetailsTitle}
                </h4>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {selectedItem.title}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setSelectedItemId(null)}>
                {t.reminders.cancel}
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {selectedList?.linkToFinance ? (
                <>
                  <Input
                    label={t.reminders.financeCategoryLabel}
                    placeholder={t.reminders.financeCategoryLabel}
                    value={itemForm.financeCategory}
                    onChange={(event) =>
                      setItemForm((prev) => ({
                        ...prev,
                        financeCategory: event.target.value,
                      }))
                    }
                  />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {t.reminders.financeTypeLabel}
                    <select
                      value={itemForm.financeType}
                      onChange={(event) =>
                        setItemForm((prev) => ({
                          ...prev,
                          financeType: event.target.value as
                            | ""
                            | ReminderFinanceType,
                        }))
                      }
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="">{t.reminders.statusAll}</option>
                      <option value="INCOME">{t.reminders.finance.income}</option>
                      <option value="EXPENSE">{t.reminders.finance.expense}</option>
                    </select>
                  </label>
                  <Input
                    label={t.reminders.financeTagsLabel}
                    placeholder={t.reminders.financeTagsPlaceholder}
                    value={itemForm.financeTags}
                    onChange={(event) =>
                      setItemForm((prev) => ({
                        ...prev,
                        financeTags: event.target.value,
                      }))
                    }
                  />
                </>
              ) : null}
              <Input
                label={t.reminders.notesLabel}
                placeholder={t.reminders.notesLabel}
                value={itemForm.notes}
                onChange={(event) =>
                  setItemForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
              <Input
                label={t.reminders.dueDateLabel}
                placeholder="YYYY-MM-DD"
                value={itemForm.dueDate}
                onChange={(event) =>
                  setItemForm((prev) => ({
                    ...prev,
                    dueDate: event.target.value,
                  }))
                }
              />
              <label className="flex flex-col gap-2 text-sm text-zinc-600">
                {t.reminders.statusLabel}
                <select
                  value={itemForm.status}
                  onChange={(event) =>
                    setItemForm((prev) => ({
                      ...prev,
                      status: event.target.value as ReminderItemStatus,
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="PENDING">{t.reminders.statusPending}</option>
                  <option value="DONE">{t.reminders.statusDone}</option>
                </select>
              </label>
            </div>
            {members.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-zinc-600">
                  {t.reminders.assigneesLabel}
                </p>
                <div className="flex flex-wrap gap-3">
                  {members.map((member) => (
                    <label key={member.userId} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={itemForm.assigneeIds.includes(member.userId)}
                        onChange={(event) =>
                          setItemForm((prev) => ({
                            ...prev,
                            assigneeIds: event.target.checked
                              ? [...prev.assigneeIds, member.userId]
                              : prev.assigneeIds.filter(
                                  (id) => id !== member.userId,
                                ),
                          }))
                        }
                      />
                      {member.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleSaveItemDetails} disabled={isUpdatingItem}>
                {t.reminders.saveItem}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDeleteItem(selectedItem.id)}
                disabled={isUpdatingItem}
              >
                {t.reminders.deleteItem}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {isMemberPickerOpen && selectedList ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setIsMemberPickerOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.reminders.addUsersTitle}
                </h4>
                <p className="text-sm text-zinc-600">{selectedList.title}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsMemberPickerOpen(false)}
              >
                {t.reminders.cancel}
              </Button>
            </div>

            <div className="mt-4">
              <Input
                label={t.reminders.searchLabel}
                placeholder={t.reminders.searchPlaceholder}
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
              />
            </div>

            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {(members.length
                ? members.filter((member) =>
                    member.label
                      .toLowerCase()
                      .includes(memberSearch.toLowerCase()),
                  )
                : []
              ).map((member) => {
                const isSelected = (selectedList.allowedUserIds ?? []).includes(
                  member.userId,
                );

                return (
                  <label
                    key={member.userId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold text-zinc-600">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(member.label)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {member.label}
                        </p>
                        <p className="text-xs text-zinc-500">{member.userId}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => {
                        const nextAllowed = event.target.checked
                          ? Array.from(
                              new Set([
                                ...(selectedList.allowedUserIds ?? []),
                                member.userId,
                              ]),
                            )
                          : (selectedList.allowedUserIds ?? []).filter(
                              (id) => id !== member.userId,
                            );
                        updateListMembers(nextAllowed);
                      }}
                    />
                  </label>
                );
              })}
              {!members.length ? (
                <p className="text-sm text-zinc-500">{t.reminders.noMembers}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
