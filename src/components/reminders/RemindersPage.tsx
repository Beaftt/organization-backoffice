'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListsSidebar } from '@/components/reminders/sidebar/ListsSidebar';
import { ListMainPanel } from '@/components/reminders/main-panel/ListMainPanel';
import { CreateListModal } from '@/components/reminders/modals/CreateListModal';
import { EditListDrawer } from '@/components/reminders/modals/EditListDrawer';
import { useRemindersState } from '@/components/reminders/hooks/useRemindersState';
import type { ReminderList, ReminderItem } from '@/components/reminders/types';

type Props = {
  initialLists: ReminderList[];
  initialItemsByList: Record<string, ReminderItem[]>;
  initialSelectedId: string | null;
  initialError?: string | null;
};

export default function RemindersPage({ initialLists, initialItemsByList, initialSelectedId, initialError }: Props) {
  const s = useRemindersState({ initialLists, initialItemsByList, initialSelectedId, initialError });
  const { t } = s;
  const r = t.reminders;

  const sidebarLabels = {
    newList: r.newList,
    noListsTitle: r.noListsTitle ?? 'Nenhuma lista',
    noListsSubtitle: r.noListsSubtitle ?? 'Crie sua primeira lista',
    edit: r.editList,
    delete: r.deleteList,
    badges: r.badges,
  };

  const mainPanelLabels = {
    editList: r.editList,
    deleteList: r.deleteList,
    itemPlaceholder: r.itemPlaceholder,
    emptyListTitle: r.emptyListTitle ?? r.emptyItems,
    emptyListSubtitle: r.emptyListSubtitle ?? '',
    deleteItem: r.deleteItem,
    itemDetailsTitle: r.itemDetailsTitle,
    ofLabel: r.progressOf ?? 'de',
    completedLabel: r.progressCompleted ?? 'concluídos',
    itemsLabel: r.itemsTitle,
    badges: { ...r.badges, isPrivate: r.privateListLabel },
  };

  const createModalLabels = {
    createList: r.createList,
    cancel: r.cancel,
    listTitleLabel: r.listTitleLabel,
    listDescriptionLabel: r.listDescriptionLabel,
    colorLabel: r.colorLabel ?? 'Cor',
    optionsLabel: r.optionsLabel ?? 'Opções',
    monthlyResetLabel: r.monthlyResetLabel,
    financeLinkLabel: r.financeLinkLabel,
    calendarLinkLabel: r.calendarLinkLabel,
    privateListLabel: r.privateListLabel,
    members: r.members ?? r.allowedUsersLabel,
    noMembers: r.noMembers,
    creating: r.creating,
  };

  const editDrawerLabels = {
    editList: r.editList,
    save: r.save ?? r.renameList,
    cancel: r.cancel,
    listTitleLabel: r.listTitleLabel,
    listDescriptionLabel: r.listDescriptionLabel,
    colorLabel: r.colorLabel ?? 'Cor',
    optionsLabel: r.optionsLabel ?? 'Opções',
    monthlyResetLabel: r.monthlyResetLabel,
    financeLinkLabel: r.financeLinkLabel,
    calendarLinkLabel: r.calendarLinkLabel,
    privateListLabel: r.privateListLabel,
    members: r.members ?? r.allowedUsersLabel,
    noMembers: r.noMembers,
    renaming: r.renaming,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{r.title}</h2>
          <p className="text-sm text-zinc-500">{r.subtitle}</p>
        </div>
      </div>

      {s.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{s.error}</p>
      ) : null}

      <div className="flex min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <ListsSidebar
          lists={s.lists}
          selectedId={s.selectedId}
          colorMap={s.colorMap}
          itemsByList={s.itemsByList}
          onSelectList={s.handleSelectList}
          onEditList={(list) => s.setEditingList(list)}
          onDeleteList={s.handleDeleteList}
          onCreateList={() => s.setIsCreatingList(true)}
          labels={sidebarLabels}
        />

        <div className="flex min-h-0 flex-1">
          {s.selectedList ? (
            <ListMainPanel
              list={s.selectedList}
              items={s.selectedItems}
              color={s.listColorFor(s.selectedList.id)}
              newItemTitle={s.newItemTitle}
              isUpdatingItem={s.isUpdatingItem}
              onNewItemChange={s.setNewItemTitle}
              onAddItem={s.addItem}
              onToggleItem={s.toggleItem}
              onDeleteItem={s.handleDeleteItem}
              onOpenItemDetails={s.setSelectedItemId}
              onEditList={() => s.setEditingList(s.selectedList)}
              onDeleteList={() => s.selectedList && s.handleDeleteList(s.selectedList)}
              labels={mainPanelLabels}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-zinc-400">{r.noListsSubtitle ?? r.emptyItems}</p>
            </div>
          )}
        </div>
      </div>

      <CreateListModal
        isOpen={s.isCreatingList}
        listForm={s.listForm}
        onFormChange={(patch) => s.setListForm((prev) => ({ ...prev, ...patch }))}
        members={s.members}
        isSaving={s.isSavingList}
        error={s.error}
        onSave={s.handleCreateList}
        onClose={() => s.setIsCreatingList(false)}
        labels={createModalLabels}
      />

      <EditListDrawer
        list={s.editingList}
        colorMap={s.colorMap}
        members={s.members}
        isUpdating={s.isUpdatingList}
        error={s.error}
        onUpdateFlag={s.updateListFlag}
        onUpdateMembers={s.updateListMembers}
        onRename={s.handleRenameList}
        onColorChange={s.handleColorChange}
        onClose={() => s.setEditingList(null)}
        labels={editDrawerLabels}
      />

      {s.selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => s.setSelectedItemId(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{r.itemDetailsTitle}</h4>
                <p className="text-lg font-semibold text-[var(--foreground)]">{s.selectedItem.title}</p>
              </div>
              <Button variant="secondary" onClick={() => s.setSelectedItemId(null)}>{r.cancel}</Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {s.selectedList?.linkToFinance ? (
                <>
                  <Input label={r.financeCategoryLabel} placeholder={r.financeCategoryLabel} value={s.itemForm.financeCategory} onChange={(e) => s.setItemForm((prev) => ({ ...prev, financeCategory: e.target.value }))} />
                  <label className="flex flex-col gap-2 text-sm text-zinc-600">
                    {r.financeTypeLabel}
                    <select value={s.itemForm.financeType} onChange={(e) => s.setItemForm((prev) => ({ ...prev, financeType: e.target.value as '' | 'INCOME' | 'EXPENSE' }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                      <option value="">{r.statusAll}</option>
                      <option value="INCOME">{r.finance.income}</option>
                      <option value="EXPENSE">{r.finance.expense}</option>
                    </select>
                  </label>
                  <Input label={r.financeTagsLabel} placeholder={r.financeTagsPlaceholder} value={s.itemForm.financeTags} onChange={(e) => s.setItemForm((prev) => ({ ...prev, financeTags: e.target.value }))} />
                </>
              ) : null}
              <Input label={r.notesLabel} placeholder={r.notesLabel} value={s.itemForm.notes} onChange={(e) => s.setItemForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <Input label={r.dueDateLabel} placeholder="YYYY-MM-DD" value={s.itemForm.dueDate} onChange={(e) => s.setItemForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
              <label className="flex flex-col gap-2 text-sm text-zinc-600">{r.statusLabel}
                <select value={s.itemForm.status} onChange={(e) => s.setItemForm((prev) => ({ ...prev, status: e.target.value as 'PENDING' | 'DONE' }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  <option value="PENDING">{r.statusPending}</option>
                  <option value="DONE">{r.statusDone}</option>
                </select>
              </label>
            </div>
            {s.members.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-zinc-600">{r.assigneesLabel}</p>
                <div className="flex flex-wrap gap-3">
                  {s.members.map((member) => (
                    <label key={member.userId} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={s.itemForm.assigneeIds.includes(member.userId)} onChange={(e) => s.setItemForm((prev) => ({ ...prev, assigneeIds: e.target.checked ? [...prev.assigneeIds, member.userId] : prev.assigneeIds.filter((id) => id !== member.userId) }))} />
                      {member.photoUrl ? <Image src={member.photoUrl} alt={member.label} width={24} height={24} className="h-6 w-6 rounded-full object-cover" unoptimized /> : null}
                      {member.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={s.handleSaveItemDetails} disabled={s.isUpdatingItem}>{r.saveItem}</Button>
              <Button variant="secondary" onClick={() => s.handleDeleteItem(s.selectedItem!.id)} disabled={s.isUpdatingItem}>{r.deleteItem}</Button>
            </div>
          </div>
        </div>
      ) : null}

      {s.isPresetModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" onClick={() => void s.handleClosePreset()}>
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 shadow-xl" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{r.presetTitle}</h4>
                <p className="text-sm text-zinc-600">{s.selectedList?.title ?? s.presetLabel ?? r.presetListFallback}</p>
              </div>
              <Button variant="secondary" onClick={() => void s.handleClosePreset()}>{r.cancel}</Button>
            </div>
            <div className="mt-4 grid gap-4">
              {s.presetItems.map((value, index) => (
                <Input key={`preset-${index}`} placeholder={r.itemPlaceholder} value={value} onChange={(e) => s.setPresetItems((prev) => prev.map((cur, i) => (i === index ? e.target.value : cur)))} />
              ))}
            </div>
            {s.presetError ? <p className="mt-3 text-sm text-red-500">{s.presetError}</p> : null}
            <div>
              <button type="button" onClick={s.handleAddPresetField} className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--sidebar)] bg-[var(--surface)] text-lg font-semibold text-[var(--sidebar)] shadow-sm transition hover:bg-[var(--surface-muted)]" aria-label={r.addItem}>+</button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={s.handleSavePreset} disabled={s.presetSaving}>{s.presetSaving ? r.creating : r.presetSave}</Button>
              <Button variant="secondary" onClick={() => void s.handleClosePreset()} disabled={s.presetSaving}>{r.cancel}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
