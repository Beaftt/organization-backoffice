'use client';

import type { ReminderList, ReminderItem } from '@/components/reminders/types';
import { ListSidebarItem } from '@/components/reminders/sidebar/ListSidebarItem';
import { ListSidebarEmpty } from '@/components/reminders/sidebar/ListSidebarEmpty';

type Props = {
  lists: ReminderList[];
  selectedId: string;
  colorMap: Record<string, string>;
  itemsByList: Record<string, ReminderItem[]>;
  onSelectList: (id: string) => void;
  onEditList: (list: ReminderList) => void;
  onDeleteList: (list: ReminderList) => void;
  onCreateList: () => void;
  labels: {
    newList: string;
    noListsTitle: string;
    noListsSubtitle: string;
    edit: string;
    delete: string;
    badges: { monthly: string; financeLinked: string; calendarLinked: string };
  };
};

export function ListsSidebar({
  lists,
  selectedId,
  colorMap,
  itemsByList,
  onSelectList,
  onEditList,
  onDeleteList,
  onCreateList,
  labels,
}: Props) {
  return (
    <aside
      className="flex w-[220px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-muted)]"
      style={{ minHeight: 0 }}
    >
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {lists.length === 0 ? (
          <ListSidebarEmpty
            noListsTitle={labels.noListsTitle}
            noListsSubtitle={labels.noListsSubtitle}
          />
        ) : (
          <div className="flex flex-col gap-0.5">
            {lists.map((list) => (
              <ListSidebarItem
                key={list.id}
                list={list}
                items={itemsByList[list.id] ?? []}
                isSelected={selectedId === list.id}
                color={colorMap[list.id] ?? '#4347c0'}
                onSelect={() => onSelectList(list.id)}
                onEdit={() => onEditList(list)}
                onDelete={() => onDeleteList(list)}
                labels={{
                  edit: labels.edit,
                  delete: labels.delete,
                  monthly: labels.badges.monthly,
                  financeLinked: labels.badges.financeLinked,
                  calendarLinked: labels.badges.calendarLinked,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-[var(--border)] p-2">
        <button
          type="button"
          onClick={onCreateList}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        >
          {labels.newList}
        </button>
      </div>
    </aside>
  );
}
