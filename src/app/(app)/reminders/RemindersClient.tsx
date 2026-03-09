"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  updateReminderItem,
  updateReminderList,
  type ReminderFinanceType,
  type ReminderItem,
  type ReminderItemStatus,
  type ReminderList,
  type ReminderListRecurrence,
} from "@/lib/api/reminders";
import { getWorkspaceMemberships } from "@/lib/api/workspace-memberships";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { useLanguage } from "@/lib/i18n/language-context";

const resetDay = 1;

type MemberOption = {
  userId: string;
  label: string;
  photoUrl?: string | null;
};

type RemindersClientProps = {
  initialLists: ReminderList[];
  initialItemsByList: Record<string, ReminderItem[]>;
  initialSelectedId: string | null;
  initialError?: string | null;
};

export default function RemindersClient({
  initialLists,
  initialItemsByList,
  initialSelectedId,
  initialError,
}: RemindersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [lists, setLists] = useState<ReminderList[]>(initialLists);
  const [itemsByList, setItemsByList] = useState<Record<string, ReminderItem[]>>(
    initialItemsByList,
  );
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId ?? "");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
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
  const [editingList, setEditingList] = useState<ReminderList | null>(null);
  const [editListTitle, setEditListTitle] = useState("");
  const [isRenamingList, setIsRenamingList] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
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
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetItems, setPresetItems] = useState<string[]>([]);
  const [presetSaving, setPresetSaving] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);
  const presetOpenRef = useRef(false);
  const lastPresetIdRef = useRef<string | null>(null);
  const presetFlag = useMemo(() => searchParams.get("preset"), [searchParams]);
  const presetLabel = useMemo(
    () => searchParams.get("presetLabel"),
    [searchParams],
  );
  const presetListId = useMemo(() => {
    const listParam = searchParams.get("listId");
    return presetFlag ? listParam : null;
  }, [presetFlag, searchParams]);
  const newListParam = useMemo(
    () => searchParams.get("newList"),
    [searchParams],
  );
  const presetCleanupRef = useRef(false);
  const presetHasItemsRef = useRef(false);

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
  const isPresetFlow = Boolean(presetFlag);
  const presetItemCount = 3;
  const selectedItem =
    selectedItems.find((item) => item.id === selectedItemId) ?? null;
  const presetModalTitle =
    selectedList?.title ?? presetLabel ?? t.reminders.presetListFallback;

  const loadItems = useCallback(async (listId: string) => {
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
  }, [t]);

  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;

    try {
      const memberships = await getWorkspaceMemberships(workspaceId);
      setMembers(
        (memberships?.items ?? []).map((membership) => ({
          userId: membership.userId,
          label:
            membership.displayName ||
            `${membership.userId.slice(0, 8)}...`,
          photoUrl: membership.photoUrl,
        })),
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) return;
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.reminders.loadError);
      }
    }
  }, [t]);

  useEffect(() => {
    if ((isCreatingList || isMemberPickerOpen) && !members.length) {
      loadMembers();
    }
  }, [isCreatingList, isMemberPickerOpen, members.length, loadMembers]);

  useEffect(() => {
    if (!lists.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !lists.some((list) => list.id === selectedId)) {
      setSelectedId(lists[0].id);
    }
  }, [lists, selectedId]);

  const presetKey = useMemo(() => {
    if (!presetFlag) return null;
    return `${presetListId ?? "new"}::${presetLabel ?? ""}`;
  }, [presetFlag, presetLabel, presetListId]);

  useEffect(() => {
    if (!presetKey) {
      lastPresetIdRef.current = null;
      return;
    }
    if (presetKey === lastPresetIdRef.current) return;
    lastPresetIdRef.current = presetKey;
    presetOpenRef.current = false;
    presetCleanupRef.current = false;
    presetHasItemsRef.current = false;
  }, [presetKey]);

  useEffect(() => {
    if (!presetListId) return;
    const hasPresetList = lists.some((list) => list.id === presetListId);
    if (!hasPresetList) return;
    if (selectedId !== presetListId) {
      setSelectedId(presetListId);
    }
  }, [lists, presetListId, selectedId]);

  useEffect(() => {
    if (!newListParam) return;
    setIsCreatingList(true);
    if (selectedList) {
      router.replace(`/reminders?listId=${selectedList.id}`);
    } else {
      router.replace("/reminders");
    }
  }, [newListParam, router, selectedList]);

  useEffect(() => {
    if (!selectedId) return;
    if (itemsByList[selectedId]) return;
    loadItems(selectedId);
  }, [selectedId, itemsByList, loadItems]);

  useEffect(() => {
    if (!selectedList) return;
    setSelectedItemId(null);
    setIsSettingsOpen(false);
  }, [selectedList]);

  useEffect(() => {
    if (!isPresetFlow) return;
    if (presetOpenRef.current) return;
    presetOpenRef.current = true;
    setPresetItems(Array.from({ length: presetItemCount }, () => ""));
    setPresetError(null);
    setIsPresetModalOpen(true);
  }, [isPresetFlow]);

  useEffect(() => {
    if (!presetListId) return;
    const items = itemsByList[presetListId] ?? [];
    if (items.length) {
      presetHasItemsRef.current = true;
    }
  }, [itemsByList, presetListId]);

  const cleanupPresetList = useCallback(async () => {
    if (!presetListId) return;
    if (presetCleanupRef.current) return;
    if (presetHasItemsRef.current) return;
    presetCleanupRef.current = true;
    try {
      await deleteReminderList({ id: presetListId });
      setLists((prev) => {
        const next = prev.filter((list) => list.id !== presetListId);
        if (selectedId === presetListId) {
          setSelectedId(next[0]?.id ?? "");
        }
        return next;
      });
      setItemsByList((prev) => {
        const next = { ...prev };
        delete next[presetListId];
        return next;
      });
    } catch {
      presetCleanupRef.current = false;
    }
  }, [presetListId, selectedId]);

  const handleClosePreset = useCallback(async () => {
    if (isPresetFlow && presetListId) {
      await cleanupPresetList();
    }
    setIsPresetModalOpen(false);
    if (selectedList) {
      router.replace(`/reminders?listId=${selectedList.id}`);
    } else {
      router.replace("/reminders");
    }
  }, [cleanupPresetList, isPresetFlow, presetListId, router, selectedList]);

  const handleSavePreset = useCallback(async () => {
    const values = presetItems.map((value) => value.trim()).filter(Boolean);
    if (!values.length) {
      setPresetError(t.reminders.presetError);
      return;
    }
    setPresetSaving(true);
    setPresetError(null);
    try {
      if (presetListId && selectedList) {
        const created = await Promise.all(
          values.map((value) =>
            createReminderItem({ listId: selectedList.id, title: value }),
          ),
        );
        setItemsByList((prev) => ({
          ...prev,
          [selectedList.id]: [...(prev[selectedList.id] ?? []), ...created],
        }));
        presetHasItemsRef.current = true;
        setPresetItems([]);
        setIsPresetModalOpen(false);
        router.replace(`/reminders?listId=${selectedList.id}`);
        return;
      }

      const listTitle = presetLabel?.trim() || t.reminders.presetListFallback;
      const newList = await createReminderList({ title: listTitle });
      const created = await Promise.all(
        values.map((value) =>
          createReminderItem({ listId: newList.id, title: value }),
        ),
      );
      setLists((prev) => [newList, ...prev]);
      setItemsByList((prev) => ({
        ...prev,
        [newList.id]: created,
      }));
      setSelectedId(newList.id);
      setPresetItems([]);
      setIsPresetModalOpen(false);
      router.replace(`/reminders?listId=${newList.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setPresetError(err.message);
      } else {
        setPresetError(t.reminders.saveError);
      }
    } finally {
      setPresetSaving(false);
    }
  }, [
    presetItems,
    presetLabel,
    presetListId,
    router,
    selectedList,
    t.reminders.presetError,
    t.reminders.presetListFallback,
    t.reminders.saveError,
  ]);

  const handleAddPresetField = useCallback(() => {
    setPresetItems((prev) => [...prev, ""]);
  }, []);

  useEffect(() => {
    return () => {
      void cleanupPresetList();
    };
  }, [cleanupPresetList]);

  useEffect(() => {
    if (!presetListId) return;
    if (selectedId && selectedId !== presetListId) {
      void cleanupPresetList();
    }
  }, [cleanupPresetList, presetListId, selectedId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedItemId) {
        setSelectedItemId(null);
      }
      if (isCreatingList) {
        setIsCreatingList(false);
      }
      if (isMemberPickerOpen) {
        setIsMemberPickerOpen(false);
      }
    };

    if (selectedItemId || isCreatingList || isMemberPickerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItemId, isCreatingList, isMemberPickerOpen]);

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
  }, [selectedItem]);

  const handleSelectList = (listId: string) => {
    setSelectedId(listId);
    const params = new URLSearchParams(window.location.search);
    params.set("listId", listId);
    router.replace(`/reminders?${params.toString()}`);
  };

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
      const params = new URLSearchParams(window.location.search);
      params.set("listId", created.id);
      router.replace(`/reminders?${params.toString()}`);
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

  const toggleItem = async (itemId: string, listId?: string) => {
    const list = listId ? lists.find((l) => l.id === listId) : selectedList;
    if (!list) return;
    const items = itemsByList[list.id] ?? [];
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    setIsUpdatingItem(true);
    setError(null);

    const nextStatus: ReminderItemStatus =
      item.status === "DONE" ? "PENDING" : "DONE";

    try {
      const updated = await updateReminderItem({
        listId: list.id,
        id: item.id,
        status: nextStatus,
      });
      setItemsByList((prev) => ({
        ...prev,
        [list.id]:
          prev[list.id]?.map((entry) =>
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
      const nextLists = lists.filter((list) => list.id !== selectedList.id);
      setLists(nextLists);
      setItemsByList((prev) => {
        const next = { ...prev };
        delete next[selectedList.id];
        return next;
      });
      const nextId = nextLists[0]?.id ?? "";
      setSelectedId(nextId);
      const params = new URLSearchParams(window.location.search);
      if (nextId) {
        params.set("listId", nextId);
      } else {
        params.delete("listId");
      }
      router.replace(`/reminders?${params.toString()}`);
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

  const handleDeleteListById = async (listToDelete: ReminderList) => {
    const confirmed = window.confirm(t.reminders.confirmDeleteList);
    if (!confirmed) return;
    setIsUpdatingList(true);
    setError(null);

    try {
      await deleteReminderList({ id: listToDelete.id });
      const nextLists = lists.filter((l) => l.id !== listToDelete.id);
      setLists(nextLists);
      setItemsByList((prev) => {
        const next = { ...prev };
        delete next[listToDelete.id];
        return next;
      });
      const nextId = nextLists[0]?.id ?? "";
      if (listToDelete.id === selectedId) setSelectedId(nextId);
      const params = new URLSearchParams(window.location.search);
      if (nextId) {
        params.set("listId", nextId);
      } else {
        params.delete("listId");
      }
      router.replace(`/reminders?${params.toString()}`);
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

  const handleRenameList = async () => {
    if (!editingList || !editListTitle.trim()) return;
    setIsRenamingList(true);
    setRenameError(null);
    try {
      const updated = await updateReminderList({
        id: editingList.id,
        title: editListTitle.trim(),
      });
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setEditingList(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setRenameError(err.message);
      } else {
        setRenameError(t.reminders.updateError);
      }
    } finally {
      setIsRenamingList(false);
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
        [selectedList.id]:
          prev[selectedList.id]?.filter((item) => item.id !== itemId) ?? [],
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
        [selectedList.id]:
          prev[selectedList.id]?.map((item) =>
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

      <div className="flex flex-col gap-4">
        {!lists.length ? (
          <Card>
            <p className="text-sm text-zinc-500">{t.reminders.emptyItems}</p>
          </Card>
        ) : null}
        {lists.map((list) => {
          const items = itemsByList[list.id] ?? [];
          const doneCount = items.filter((i) => i.status === 'DONE').length;
          const isSelected = selectedId === list.id;
          const listMembers = (list.allowedUserIds ?? [])
            .map((userId) => membersById.get(userId))
            .filter((member): member is MemberOption => Boolean(member));

          return (
            <Card key={list.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{list.title}</p>
                  {list.description ? <p className="mt-0.5 text-xs text-zinc-500">{list.description}</p> : null}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {list.recurrence === 'MONTHLY' ? (
                      <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600">{t.reminders.badges.monthly}</span>
                    ) : null}
                    {list.linkToFinance ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">{t.reminders.badges.financeLinked}</span>
                    ) : null}
                    {list.linkToCalendar ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">{t.reminders.badges.calendarLinked}</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{doneCount}/{items.length}</span>
                  {listMembers.length > 0 ? (
                    <div className="flex items-center -space-x-2">
                      {listMembers.slice(0, 3).map((member) => (
                        <div
                          key={member?.userId}
                          title={member?.label}
                          className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-zinc-600"
                        >
                          {member?.photoUrl ? (
                            <Image src={member.photoUrl} alt={member.label} width={24} height={24} className="h-full w-full object-cover" unoptimized />
                          ) : (
                            getInitials(member?.label ?? '')
                          )}
                        </div>
                      ))}
                      {listMembers.length > 3 ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-zinc-600">+{listMembers.length - 3}</div>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    title={t.reminders.listSettings}
                    onClick={() => { handleSelectList(list.id); setIsSettingsOpen((prev) => !prev); }}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </button>
                  <button
                    type="button"
                    title={t.reminders.editList}
                    onClick={(e) => { e.stopPropagation(); setEditingList(list); setEditListTitle(list.title); setRenameError(null); }}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    type="button"
                    title={t.reminders.deleteList}
                    onClick={(e) => { e.stopPropagation(); handleDeleteListById(list); }}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>

              {isSelected && isSettingsOpen && selectedList ? (
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedList?.recurrence === "MONTHLY"}
                      onChange={(event) =>
                        updateListFlag("monthlyReset", event.target.checked)
                      }
                      disabled={isUpdatingList}
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
                              prev.map((l) =>
                                l.id === updated.id ? updated : l,
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
                      disabled={isUpdatingList}
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
                      disabled={isUpdatingList}
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
                              prev.map((l) =>
                                l.id === updated.id ? updated : l,
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
                      disabled={isUpdatingList}
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
                  <div className="w-full">
                    <p className="text-sm font-semibold text-zinc-600">{t.reminders.allowedUsersLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {members.map((member) => (
                        <label key={member.userId} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={(selectedList.allowedUserIds ?? []).includes(member.userId)}
                            onChange={(event) => {
                              const nextAllowed = event.target.checked
                                ? Array.from(new Set([...(selectedList.allowedUserIds ?? []), member.userId]))
                                : (selectedList.allowedUserIds ?? []).filter((id) => id !== member.userId);
                              updateListMembers(nextAllowed);
                            }}
                          />
                          {member.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-zinc-400">{t.reminders.emptyItems}</p>
                ) : (
                  items.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[var(--surface-muted)]">
                      <input
                        type="checkbox"
                        checked={item.status === 'DONE'}
                        onChange={() => toggleItem(item.id, list.id)}
                        disabled={isUpdatingItem}
                      />
                      <span className={item.status === 'DONE' ? 'text-sm line-through text-zinc-400' : 'text-sm text-[var(--foreground)]'}>
                        {item.title}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {isSelected ? (
                <div className="mt-4 flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={t.reminders.itemPlaceholder}
                      value={newItemTitle}
                      onChange={(event) => setNewItemTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void addItem();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={addItem} disabled={!selectedList || isUpdatingItem}>
                    {isPresetFlow ? '+' : t.reminders.addItem}
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectList(list.id)}
                  className="mt-4 w-full rounded-xl border border-dashed border-[var(--border)] py-2 text-xs text-zinc-400 transition hover:border-zinc-400"
                >
                  + {t.reminders.addItem}
                </button>
              )}
            </Card>
          );
        })}

        <button
          type="button"
          onClick={() => setIsCreatingList(true)}
          className="w-full rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-sm text-zinc-500 transition hover:border-[var(--sidebar)] hover:text-[var(--sidebar)]"
        >
          + {t.reminders.newList}
        </button>
      </div>

      {editingList ? (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => {
            setEditingList(null);
            setRenameError(null);
          }}
        >
          <div
            className="modal-content w-full max-w-sm rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t.reminders.editList}
              </h4>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingList(null);
                  setRenameError(null);
                }}
              >
                {t.reminders.cancel}
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <Input
                label={t.reminders.listTitleLabel}
                placeholder={t.reminders.listTitleLabel}
                value={editListTitle}
                onChange={(e) => setEditListTitle(e.target.value)}
              />
              {renameError ? (
                <p className="text-sm text-rose-600">{renameError}</p>
              ) : null}
              <Button onClick={handleRenameList} disabled={isRenamingList}>
                {isRenamingList ? t.reminders.renaming : t.reminders.renameList}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isCreatingList ? (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setIsCreatingList(false)}
        >
          <div
            className="modal-content w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
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

      {isPresetModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => void handleClosePreset()}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.reminders.presetTitle}
                </h4>
                <p className="text-sm text-zinc-600">{presetModalTitle}</p>
              </div>
              <Button variant="secondary" onClick={() => void handleClosePreset()}>
                {t.reminders.cancel}
              </Button>
            </div>

            <div className="mt-4 grid gap-4">
              {presetItems.map((value, index) => (
                <Input
                  key={`preset-${index}`}
                  placeholder={t.reminders.itemPlaceholder}
                  value={value}
                  onChange={(event) =>
                    setPresetItems((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index
                          ? event.target.value
                          : current,
                      ),
                    )
                  }
                />
              ))}
            </div>
            {presetError ? (
              <p className="mt-3 text-sm text-red-500">{presetError}</p>
            ) : null}
            <div>
              <button
                type="button"
                onClick={handleAddPresetField}
                className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--surface)] text-lg font-semibold text-[var(--primary)] shadow-sm transition hover:bg-[var(--surface-muted)]"
                aria-label={t.reminders.addItem}
              >
                +
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleSavePreset} disabled={presetSaving}>
                {presetSaving ? t.reminders.creating : t.reminders.presetSave}
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleClosePreset()}
                disabled={presetSaving}
              >
                {t.reminders.cancel}
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
                          <Image
                            src={member.photoUrl}
                            alt={member.label}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                            unoptimized
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
