'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { ListColorPicker } from '@/components/reminders/shared/ListColorPicker';
import { ListOptionsToggle } from '@/components/reminders/shared/ListOptionsToggle';
import { ListMembersSection } from '@/components/reminders/shared/ListMembersSection';
import type { ReminderList, MemberOption } from '@/components/reminders/types';
import { getListColor } from '@/components/reminders/types';

type OptionKey = 'monthlyReset' | 'linkFinance' | 'linkCalendar' | 'isPrivate';

type Props = {
  list: ReminderList | null;
  colorMap: Record<string, string>;
  members: MemberOption[];
  isUpdating: boolean;
  error: string | null;
  onUpdateFlag: (key: OptionKey, value: boolean) => void;
  onUpdateMembers: (ids: string[]) => void;
  onRename: (title: string, description?: string) => Promise<void>;
  onColorChange: (listId: string, color: string) => void;
  onClose: () => void;
  labels: {
    editList: string;
    save: string;
    cancel: string;
    listTitleLabel: string;
    listDescriptionLabel: string;
    colorLabel: string;
    optionsLabel: string;
    monthlyResetLabel: string;
    financeLinkLabel: string;
    calendarLinkLabel: string;
    privateListLabel: string;
    members: string;
    noMembers: string;
    renaming: string;
  };
};

export function EditListDrawer({
  list,
  colorMap,
  members,
  isUpdating,
  error,
  onUpdateFlag,
  onUpdateMembers,
  onRename,
  onColorChange,
  onClose,
  labels,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (list) {
      setTitle(list.title);
      setDescription(list.description ?? '');
    }
  }, [list]);

  const handleSave = async () => {
    if (!title.trim() || !list) return;
    setIsSaving(true);
    await onRename(title.trim(), description.trim() || undefined);
    setIsSaving(false);
  };

  if (!list) return null;

  const color = getListColor(list.id, colorMap);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--surface)] shadow-2xl">

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {labels.editList}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            aria-label={labels.cancel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {labels.listTitleLabel}
            </label>
            <input
              type="text"
              placeholder={labels.listTitleLabel}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSave(); }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {labels.listDescriptionLabel}
            </label>
            <textarea
              placeholder={labels.listDescriptionLabel}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
            />
          </div>

          {/* Color */}
          <ListColorPicker
            value={color}
            onChange={(c) => onColorChange(list.id, c)}
            label={labels.colorLabel}
          />

          {/* Options */}
          <ListOptionsToggle
            monthlyReset={list.recurrence === 'MONTHLY'}
            linkFinance={list.linkToFinance}
            linkCalendar={list.linkToCalendar}
            isPrivate={list.isPrivate}
            disabled={isUpdating}
            onChange={onUpdateFlag}
            labels={{
              sectionLabel: labels.optionsLabel,
              monthlyReset: labels.monthlyResetLabel,
              linkFinance: labels.financeLinkLabel,
              linkCalendar: labels.calendarLinkLabel,
              isPrivate: labels.privateListLabel,
            }}
          />

          {/* Members */}
          <ListMembersSection
            members={members}
            allowedUserIds={list.allowedUserIds ?? []}
            onChange={onUpdateMembers}
            labels={{ sectionLabel: labels.members, noMembers: labels.noMembers }}
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        {/* Sticky footer */}
        <div className="flex flex-shrink-0 gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !title.trim()}
            className="flex-[2] rounded-xl bg-[var(--sidebar)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isSaving ? labels.renaming : labels.save}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
