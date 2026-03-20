'use client';

import type { ReminderItem } from '@/components/reminders/types';
import { ListItemRow } from '@/components/reminders/main-panel/ListItemRow';
import { ListEmptyState } from '@/components/reminders/main-panel/ListEmptyState';

type Props = {
  items: ReminderItem[];
  isUpdatingItem: boolean;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onOpenDetails: (itemId: string) => void;
  labels: {
    emptyListTitle: string;
    emptyListSubtitle: string;
    deleteItem: string;
    itemDetailsTitle: string;
  };
};

export function ListItemsView({
  items,
  isUpdatingItem,
  onToggle,
  onDelete,
  onOpenDetails,
  labels,
}: Props) {
  if (items.length === 0) {
    return (
      <ListEmptyState
        emptyListTitle={labels.emptyListTitle}
        emptyListSubtitle={labels.emptyListSubtitle}
      />
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-2">
      {items.map((item) => (
        <ListItemRow
          key={item.id}
          item={item}
          disabled={isUpdatingItem}
          onToggle={() => onToggle(item.id)}
          onDelete={() => onDelete(item.id)}
          onOpenDetails={() => onOpenDetails(item.id)}
          labels={{ deleteItem: labels.deleteItem, itemDetailsTitle: labels.itemDetailsTitle }}
        />
      ))}
    </div>
  );
}
