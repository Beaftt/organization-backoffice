'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
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
} from '@/lib/api/reminders';
import { getWorkspaceMemberships } from '@/lib/api/workspace-memberships';
import { getWorkspaceId } from '@/lib/storage/workspace';
import { DEFAULT_LIST_FORM, getListColor, toRecurrence } from '@/components/reminders/types';
import type { ListForm, MemberOption } from '@/components/reminders/types';
import { useLanguage } from '@/lib/i18n/language-context';

const DEFAULT_RESET_DAY = 1;

function loadColorMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem('reminders_colors');
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveColorMap(map: Record<string, string>) {
  try {
    localStorage.setItem('reminders_colors', JSON.stringify(map));
  } catch {
    // ignore
  }
}

type RemindersClientProps = {
  initialLists: ReminderList[];
  initialItemsByList: Record<string, ReminderItem[]>;
  initialSelectedId: string | null;
  initialError?: string | null;
};

export type ItemFormState = {
  notes: string;
  dueDate: string;
  financeType: '' | ReminderFinanceType;
  financeCategory: string;
  financeTags: string;
  status: ReminderItemStatus;
  assigneeIds: string[];
};

export function useRemindersState({
  initialLists,
  initialItemsByList,
  initialSelectedId,
  initialError,
}: RemindersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [lists, setLists] = useState<ReminderList[]>(initialLists);
  const [itemsByList, setItemsByList] = useState<Record<string, ReminderItem[]>>(initialItemsByList);
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId ?? '');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [listForm, setListForm] = useState<ListForm>(DEFAULT_LIST_FORM);
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [editingList, setEditingList] = useState<ReminderList | null>(null);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetItems, setPresetItems] = useState<string[]>([]);
  const [presetSaving, setPresetSaving] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>({
    notes: '',
    dueDate: '',
    financeType: '',
    financeCategory: '',
    financeTags: '',
    status: 'PENDING',
    assigneeIds: [],
  });

  const presetOpenRef = useRef(false);
  const lastPresetIdRef = useRef<string | null>(null);
  const presetCleanupRef = useRef(false);
  const presetHasItemsRef = useRef(false);

  const presetFlag = useMemo(() => searchParams.get('preset'), [searchParams]);
  const presetLabel = useMemo(() => searchParams.get('presetLabel'), [searchParams]);
  const presetListId = useMemo(() => {
    const listParam = searchParams.get('listId');
    return presetFlag ? listParam : null;
  }, [presetFlag, searchParams]);
  const newListParam = useMemo(() => searchParams.get('newList'), [searchParams]);

  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedId) ?? lists[0] ?? null,
    [lists, selectedId],
  );

  const selectedItems = selectedList ? itemsByList[selectedList.id] ?? [] : [];
  const isPresetFlow = Boolean(presetFlag);
  const selectedItem = selectedItems.find((item) => item.id === selectedItemId) ?? null;

  useEffect(() => {
    setColorMap(loadColorMap());
  }, []);

  const handleColorChange = useCallback((listId: string, color: string) => {
    setColorMap((prev) => {
      const next = { ...prev, [listId]: color };
      saveColorMap(next);
      return next;
    });
  }, []);

  const listColorFor = useCallback(
    (listId: string) => getListColor(listId, colorMap),
    [colorMap],
  );

  const loadItems = useCallback(
    async (listId: string) => {
      try {
        const response = await listReminderItems({
          listId,
          page: 1,
          pageSize: 100,
          orderBy: 'createdAt',
          orderDirection: 'asc',
        });
        setItemsByList((prev) => ({ ...prev, [listId]: response.items }));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.reminders.loadError);
      }
    },
    [t],
  );

  const loadMembers = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    try {
      const memberships = await getWorkspaceMemberships(workspaceId);
      setMembers(
        (memberships?.items ?? []).map((m) => ({
          userId: m.userId,
          label: m.displayName || `${m.userId.slice(0, 8)}...`,
          photoUrl: m.photoUrl,
        })),
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) return;
      setError(err instanceof ApiError ? err.message : t.reminders.loadError);
    }
  }, [t]);

  useEffect(() => {
    if (isCreatingList && !members.length) loadMembers();
  }, [isCreatingList, members.length, loadMembers]);

  useEffect(() => {
    if (editingList && !members.length) loadMembers();
  }, [editingList, members.length, loadMembers]);

  useEffect(() => {
    if (!lists.length) { setSelectedId(''); return; }
    if (!selectedId || !lists.some((l) => l.id === selectedId)) {
      setSelectedId(lists[0].id);
    }
  }, [lists, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    if (itemsByList[selectedId]) return;
    loadItems(selectedId);
  }, [selectedId, itemsByList, loadItems]);

  useEffect(() => {
    if (!selectedItem) return;
    setItemForm({
      notes: selectedItem.notes ?? '',
      dueDate: selectedItem.dueDate ?? '',
      financeType: selectedItem.financeType ?? '',
      financeCategory: selectedItem.financeCategory ?? '',
      financeTags: selectedItem.financeTags?.join(', ') ?? '',
      status: selectedItem.status,
      assigneeIds: selectedItem.assigneeIds ?? [],
    });
  }, [selectedItem]);

  const presetKey = useMemo(() => {
    if (!presetFlag) return null;
    return `${presetListId ?? 'new'}::${presetLabel ?? ''}`;
  }, [presetFlag, presetLabel, presetListId]);

  useEffect(() => {
    if (!presetKey) { lastPresetIdRef.current = null; return; }
    if (presetKey === lastPresetIdRef.current) return;
    lastPresetIdRef.current = presetKey;
    presetOpenRef.current = false;
    presetCleanupRef.current = false;
    presetHasItemsRef.current = false;
  }, [presetKey]);

  useEffect(() => {
    if (!presetListId) return;
    if (!lists.some((l) => l.id === presetListId)) return;
    if (selectedId !== presetListId) setSelectedId(presetListId);
  }, [lists, presetListId, selectedId]);

  useEffect(() => {
    if (!newListParam) return;
    setIsCreatingList(true);
    router.replace(selectedList ? `/reminders?listId=${selectedList.id}` : '/reminders');
  }, [newListParam, router, selectedList]);

  useEffect(() => {
    if (!isPresetFlow) return;
    if (presetOpenRef.current) return;
    presetOpenRef.current = true;
    setPresetItems(Array.from({ length: 3 }, () => ''));
    setPresetError(null);
    setIsPresetModalOpen(true);
  }, [isPresetFlow]);

  useEffect(() => {
    if (!presetListId) return;
    if ((itemsByList[presetListId] ?? []).length) presetHasItemsRef.current = true;
  }, [itemsByList, presetListId]);

  const cleanupPresetList = useCallback(async () => {
    if (!presetListId || presetCleanupRef.current || presetHasItemsRef.current) return;
    presetCleanupRef.current = true;
    try {
      await deleteReminderList({ id: presetListId });
      setLists((prev) => {
        const next = prev.filter((l) => l.id !== presetListId);
        if (selectedId === presetListId) setSelectedId(next[0]?.id ?? '');
        return next;
      });
      setItemsByList((prev) => { const next = { ...prev }; delete next[presetListId]; return next; });
    } catch {
      presetCleanupRef.current = false;
    }
  }, [presetListId, selectedId]);

  useEffect(() => { return () => { void cleanupPresetList(); }; }, [cleanupPresetList]);

  useEffect(() => {
    if (!presetListId) return;
    if (selectedId && selectedId !== presetListId) void cleanupPresetList();
  }, [cleanupPresetList, presetListId, selectedId]);

  // --- Handlers ---

  const handleSelectList = useCallback(
    (listId: string) => {
      setSelectedId(listId);
      const params = new URLSearchParams(window.location.search);
      params.set('listId', listId);
      router.replace(`/reminders?${params.toString()}`);
    },
    [router],
  );

  const handleCreateList = useCallback(async () => {
    if (!listForm.title.trim()) return;
    setIsSavingList(true);
    setError(null);
    try {
      const recurrence: ReminderListRecurrence = toRecurrence(listForm.monthlyReset);
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
      handleColorChange(created.id, listForm.color);
      setLists((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setItemsByList((prev) => ({ ...prev, [created.id]: [] }));
      const params = new URLSearchParams(window.location.search);
      params.set('listId', created.id);
      router.replace(`/reminders?${params.toString()}`);
      setIsCreatingList(false);
      setListForm(DEFAULT_LIST_FORM);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.reminders.saveError);
    } finally {
      setIsSavingList(false);
    }
  }, [listForm, router, t, handleColorChange]);

  const handleDeleteList = useCallback(
    async (listToDelete: ReminderList) => {
      const confirmed = window.confirm(t.reminders.confirmDeleteList);
      if (!confirmed) return;
      setIsUpdatingList(true);
      setError(null);
      try {
        await deleteReminderList({ id: listToDelete.id });
        const nextLists = lists.filter((l) => l.id !== listToDelete.id);
        setLists(nextLists);
        setItemsByList((prev) => { const next = { ...prev }; delete next[listToDelete.id]; return next; });
        const nextId = nextLists[0]?.id ?? '';
        if (listToDelete.id === selectedId) setSelectedId(nextId);
        const params = new URLSearchParams(window.location.search);
        if (nextId) params.set('listId', nextId);
        else params.delete('listId');
        router.replace(`/reminders?${params.toString()}`);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.reminders.updateError);
      } finally {
        setIsUpdatingList(false);
      }
    },
    [lists, selectedId, router, t],
  );

  const handleRenameList = useCallback(
    async (title: string, description?: string) => {
      if (!editingList) return;
      try {
        const updated = await updateReminderList({ id: editingList.id, title, description });
        setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.reminders.updateError);
        throw err;
      }
    },
    [editingList, t],
  );

  const updateListFlag = useCallback(
    async (key: 'monthlyReset' | 'linkFinance' | 'linkCalendar' | 'isPrivate', value: boolean) => {
      if (!selectedList) return;
      setIsUpdatingList(true);
      const recurrence: ReminderListRecurrence =
        key === 'monthlyReset'
          ? value ? 'MONTHLY' : 'NONE'
          : selectedList.recurrence;
      const updated = await updateReminderList({
        id: selectedList.id,
        recurrence,
        resetDay: recurrence === 'MONTHLY' ? selectedList.resetDay ?? DEFAULT_RESET_DAY : null,
        linkToFinance: key === 'linkFinance' ? value : selectedList.linkToFinance,
        linkToCalendar: key === 'linkCalendar' ? value : selectedList.linkToCalendar,
        isPrivate: key === 'isPrivate' ? value : selectedList.isPrivate,
      }).catch((err) => {
        setError(err instanceof ApiError ? err.message : t.reminders.updateError);
        return null;
      });
      if (updated) setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setIsUpdatingList(false);
    },
    [selectedList, t],
  );

  const updateListMembers = useCallback(
    async (nextAllowedUserIds: string[]) => {
      if (!selectedList) return;
      setIsUpdatingList(true);
      try {
        const updated = await updateReminderList({ id: selectedList.id, allowedUserIds: nextAllowedUserIds });
        setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.reminders.updateError);
      } finally {
        setIsUpdatingList(false);
      }
    },
    [selectedList, t],
  );

  const toggleItem = useCallback(
    async (itemId: string) => {
      if (!selectedList) return;
      const items = itemsByList[selectedList.id] ?? [];
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      setIsUpdatingItem(true);
      const nextStatus: ReminderItemStatus = item.status === 'DONE' ? 'PENDING' : 'DONE';
      try {
        const updated = await updateReminderItem({ listId: selectedList.id, id: item.id, status: nextStatus });
        setItemsByList((prev) => ({
          ...prev,
          [selectedList.id]: prev[selectedList.id]?.map((e) => (e.id === item.id ? updated : e)) ?? [],
        }));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.reminders.updateError);
      } finally {
        setIsUpdatingItem(false);
      }
    },
    [selectedList, itemsByList, t],
  );

  const addItem = useCallback(async () => {
    if (!selectedList || !newItemTitle.trim()) return;
    setIsUpdatingItem(true);
    try {
      const created = await createReminderItem({ listId: selectedList.id, title: newItemTitle.trim() });
      setItemsByList((prev) => ({ ...prev, [selectedList.id]: [...(prev[selectedList.id] ?? []), created] }));
      setNewItemTitle('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.reminders.saveError);
    } finally {
      setIsUpdatingItem(false);
    }
  }, [selectedList, newItemTitle, t]);

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!selectedList) return;
      const confirmed = window.confirm(t.reminders.confirmDeleteItem);
      if (!confirmed) return;
      setIsUpdatingItem(true);
      try {
        await deleteReminderItem({ listId: selectedList.id, id: itemId });
        setItemsByList((prev) => ({
          ...prev,
          [selectedList.id]: prev[selectedList.id]?.filter((i) => i.id !== itemId) ?? [],
        }));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.reminders.updateError);
      } finally {
        setIsUpdatingItem(false);
      }
    },
    [selectedList, t],
  );

  const handleSaveItemDetails = useCallback(async () => {
    if (!selectedList || !selectedItem) return;
    setIsUpdatingItem(true);
    try {
      const tags = itemForm.financeTags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const updated = await updateReminderItem({
        listId: selectedList.id,
        id: selectedItem.id,
        notes: itemForm.notes.trim() || null,
        dueDate: itemForm.dueDate.trim() || null,
        financeType: selectedList.linkToFinance ? itemForm.financeType || null : null,
        financeCategory: selectedList.linkToFinance ? itemForm.financeCategory.trim() || null : null,
        financeTags: selectedList.linkToFinance ? (tags.length ? tags : null) : null,
        status: itemForm.status,
        assigneeIds: itemForm.assigneeIds,
      });
      setItemsByList((prev) => ({
        ...prev,
        [selectedList.id]: prev[selectedList.id]?.map((i) => (i.id === updated.id ? updated : i)) ?? [],
      }));
      setSelectedItemId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.reminders.updateError);
    } finally {
      setIsUpdatingItem(false);
    }
  }, [selectedList, selectedItem, itemForm, t]);

  const handleClosePreset = useCallback(async () => {
    if (isPresetFlow && presetListId) await cleanupPresetList();
    setIsPresetModalOpen(false);
    router.replace(selectedList ? `/reminders?listId=${selectedList.id}` : '/reminders');
  }, [cleanupPresetList, isPresetFlow, presetListId, router, selectedList]);

  const handleSavePreset = useCallback(async () => {
    const values = presetItems.map((v) => v.trim()).filter(Boolean);
    if (!values.length) { setPresetError(t.reminders.presetError); return; }
    setPresetSaving(true);
    setPresetError(null);
    try {
      if (presetListId && selectedList) {
        const created = await Promise.all(values.map((v) => createReminderItem({ listId: selectedList.id, title: v })));
        setItemsByList((prev) => ({ ...prev, [selectedList.id]: [...(prev[selectedList.id] ?? []), ...created] }));
        presetHasItemsRef.current = true;
        setPresetItems([]);
        setIsPresetModalOpen(false);
        router.replace(`/reminders?listId=${selectedList.id}`);
        return;
      }
      const listTitle = presetLabel?.trim() || t.reminders.presetListFallback;
      const newList = await createReminderList({ title: listTitle });
      const created = await Promise.all(values.map((v) => createReminderItem({ listId: newList.id, title: v })));
      setLists((prev) => [newList, ...prev]);
      setItemsByList((prev) => ({ ...prev, [newList.id]: created }));
      setSelectedId(newList.id);
      setPresetItems([]);
      setIsPresetModalOpen(false);
      router.replace(`/reminders?listId=${newList.id}`);
    } catch (err) {
      setPresetError(err instanceof ApiError ? err.message : t.reminders.saveError);
    } finally {
      setPresetSaving(false);
    }
  }, [presetItems, presetLabel, presetListId, router, selectedList, t]);

  return {
    t,
    lists,
    itemsByList,
    selectedId,
    selectedList,
    selectedItems,
    selectedItem,
    selectedItemId,
    setSelectedItemId,
    error,
    setError,
    colorMap,
    newItemTitle,
    setNewItemTitle,
    isCreatingList,
    setIsCreatingList,
    isSavingList,
    listForm,
    setListForm,
    isUpdatingList,
    editingList,
    setEditingList,
    isUpdatingItem,
    members,
    isPresetModalOpen,
    presetItems,
    setPresetItems,
    presetSaving,
    presetError,
    setPresetError,
    presetLabel,
    presetListId,
    isPresetFlow,
    itemForm,
    setItemForm,
    handleSelectList,
    handleCreateList,
    handleDeleteList,
    handleRenameList,
    updateListFlag,
    updateListMembers,
    toggleItem,
    addItem,
    handleDeleteItem,
    handleSaveItemDetails,
    handleClosePreset,
    handleSavePreset,
    handleAddPresetField: () => setPresetItems((prev) => [...prev, '']),
    handleColorChange,
    listColorFor,
  };
}
