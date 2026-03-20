'use client';

import type { ReminderList, ReminderItem } from '@/components/reminders/types';
import { ListHeader } from '@/components/reminders/main-panel/ListHeader';
import { ListProgressBar } from '@/components/reminders/main-panel/ListProgressBar';
import { ListItemsView } from '@/components/reminders/main-panel/ListItemsView';
import { ListAddItemInline } from '@/components/reminders/main-panel/ListAddItemInline';

type Props = {
  list: ReminderList;
  items: ReminderItem[];
  color: string;
  newItemTitle: string;
  isUpdatingItem: boolean;
  onNewItemChange: (v: string) => void;
  onAddItem: () => void;
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenItemDetails: (itemId: string) => void;
  onEditList: () => void;
  onDeleteList: () => void;
  labels: {
    editList: string;
    deleteList: string;
    itemPlaceholder: string;
    emptyListTitle: string;
    emptyListSubtitle: string;
    deleteItem: string;
    itemDetailsTitle: string;
    ofLabel: string;
    completedLabel: string;
    itemsLabel: string;
    badges: { monthly: string; financeLinked: string; calendarLinked: string; isPrivate: string };
  };
};

export function ListMainPanel({
  list,
  items,
  color,
  newItemTitle,
  isUpdatingItem,
  onNewItemChange,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onOpenItemDetails,
  onEditList,
  onDeleteList,
  labels,
}: Props) {
  const doneCount = items.filter((i) => i.status === 'DONE').length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListHeader
        list={list}
        color={color}
        totalCount={items.length}
        onEdit={onEditList}
        onDelete={onDeleteList}
        labels={{
          editList: labels.editList,
          deleteList: labels.deleteList,
          monthly: labels.badges.monthly,
          financeLinked: labels.badges.financeLinked,
          calendarLinked: labels.badges.calendarLinked,
          isPrivate: labels.badges.isPrivate,
          items: labels.itemsLabel,
        }}
      />
      <ListProgressBar
        doneCount={doneCount}
        totalCount={items.length}
        ofLabel={labels.ofLabel}
        completedLabel={labels.completedLabel}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ListItemsView
          items={items}
          isUpdatingItem={isUpdatingItem}
          onToggle={onToggleItem}
          onDelete={onDeleteItem}
          onOpenDetails={onOpenItemDetails}
          labels={{
            emptyListTitle: labels.emptyListTitle,
            emptyListSubtitle: labels.emptyListSubtitle,
            deleteItem: labels.deleteItem,
            itemDetailsTitle: labels.itemDetailsTitle,
          }}
        />
      </div>
      <ListAddItemInline
        value={newItemTitle}
        onChange={onNewItemChange}
        onAdd={onAddItem}
        disabled={isUpdatingItem}
        placeholder={labels.itemPlaceholder}
      />
    </div>
  );
}
