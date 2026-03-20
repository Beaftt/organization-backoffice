'use client';

import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListColorPicker } from '@/components/reminders/shared/ListColorPicker';
import { ListOptionsToggle } from '@/components/reminders/shared/ListOptionsToggle';
import { ListMembersSection } from '@/components/reminders/shared/ListMembersSection';
import type { ListForm, MemberOption } from '@/components/reminders/types';

type Props = {
  isOpen: boolean;
  listForm: ListForm;
  onFormChange: (patch: Partial<ListForm>) => void;
  members: MemberOption[];
  isSaving: boolean;
  error: string | null;
  onSave: () => void;
  onClose: () => void;
  labels: {
    createList: string;
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
    creating: string;
  };
};

export function CreateListModal({
  isOpen,
  listForm,
  onFormChange,
  members,
  isSaving,
  error,
  onSave,
  onClose,
  labels,
}: Props) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="modal-content w-full max-w-lg rounded-2xl bg-[var(--surface)] p-6 shadow-xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {labels.createList}
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

        <div className="flex flex-col gap-4">
          <Input
            label={labels.listTitleLabel}
            placeholder={labels.listTitleLabel}
            value={listForm.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
          />
          <Input
            label={labels.listDescriptionLabel}
            placeholder={labels.listDescriptionLabel}
            value={listForm.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
          />
          <ListColorPicker
            value={listForm.color}
            onChange={(color) => onFormChange({ color })}
            label={labels.colorLabel}
          />
          <ListOptionsToggle
            monthlyReset={listForm.monthlyReset}
            linkFinance={listForm.linkFinance}
            linkCalendar={listForm.linkCalendar}
            isPrivate={listForm.isPrivate}
            disabled={isSaving}
            onChange={(key, value) => onFormChange({ [key]: value })}
            labels={{
              sectionLabel: labels.optionsLabel,
              monthlyReset: labels.monthlyResetLabel,
              linkFinance: labels.financeLinkLabel,
              linkCalendar: labels.calendarLinkLabel,
              isPrivate: labels.privateListLabel,
            }}
          />
          {listForm.isPrivate ? (
            <ListMembersSection
              members={members}
              allowedUserIds={listForm.allowedUserIds}
              onChange={(ids) => onFormChange({ allowedUserIds: ids })}
              labels={{ sectionLabel: labels.members, noMembers: labels.noMembers }}
            />
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex gap-2 pt-2">
            <Button onClick={onSave} disabled={isSaving || !listForm.title.trim()}>
              {isSaving ? labels.creating : labels.createList}
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              {labels.cancel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
