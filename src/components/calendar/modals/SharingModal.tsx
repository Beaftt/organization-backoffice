'use client';

import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import type { CalendarShare, MemberOption } from '../types';

interface SharingModalProps {
  open: boolean;
  shareForm: { shareWithAll: boolean; allowedUserIds: string[] };
  share: CalendarShare | null;
  isShareSaving: boolean;
  shareError: string | null;
  members: MemberOption[];
  onShareFormChange: (form: { shareWithAll: boolean; allowedUserIds: string[] }) => void;
  onSave: () => void;
  onClose: () => void;
  formatDateTime: (v: string) => string;
}

export function SharingModal({
  open,
  shareForm,
  share,
  isShareSaving,
  shareError,
  members,
  onShareFormChange,
  onSave,
  onClose,
  formatDateTime,
}: SharingModalProps) {
  const { t } = useLanguage();

  if (!open) return null;

  const toggleUser = (userId: string) => {
    const next = shareForm.allowedUserIds.includes(userId)
      ? shareForm.allowedUserIds.filter((id) => id !== userId)
      : [...shareForm.allowedUserIds, userId];
    onShareFormChange({ ...shareForm, allowedUserIds: next });
  };

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">{t.calendar.shareTitle}</h2>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{t.calendar.shareSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Share with all */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition hover:bg-[var(--surface-muted)]">
            <input
              type="checkbox"
              checked={shareForm.shareWithAll}
              onChange={(e) => onShareFormChange({ ...shareForm, shareWithAll: e.target.checked })}
              className="accent-[var(--sidebar)]"
            />
            <span className="text-sm text-[var(--foreground)]/70">{t.calendar.shareWithAllLabel}</span>
          </label>

          {/* Per-user allowlist */}
          <div>
            <p className="mb-3 text-xs font-semibold text-[var(--foreground)]/60">
              {t.calendar.shareAllowedUsersLabel}
            </p>
            {members.length === 0 ? (
              <p className="text-xs text-[var(--foreground)]/40">{t.calendar.shareNoMembers}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <label
                    key={member.userId}
                    className={[
                      'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition',
                      shareForm.shareWithAll
                        ? 'cursor-not-allowed border-[var(--border)] opacity-40'
                        : 'border-[var(--border)] hover:bg-[var(--surface-muted)]',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      disabled={shareForm.shareWithAll}
                      checked={shareForm.allowedUserIds.includes(member.userId)}
                      onChange={() => toggleUser(member.userId)}
                      className="accent-[var(--sidebar)]"
                    />
                    {member.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {shareError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {shareError}
            </p>
          )}

          {share && (
            <p className="text-xs text-[var(--foreground)]/40">
              {t.calendar.shareLastUpdated} {formatDateTime(share.updatedAt)}
            </p>
          )}

          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={onSave}
              disabled={isShareSaving}
              className="rounded-xl bg-[var(--sidebar)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isShareSaving ? t.calendar.shareSaving : t.calendar.shareSave}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
