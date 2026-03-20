'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import type { MemberOption } from '../types';

interface EventParticipantsSectionProps {
  participantIds: string[];
  members: MemberOption[];
  onToggle: (userId: string) => void;
}

export function EventParticipantsSection({
  participantIds,
  members,
  onToggle,
}: EventParticipantsSectionProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition"
      >
        <span>{t.calendar.sectionParticipants}</span>
        <span className="text-[var(--foreground)]/30 text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="pb-3">
          {members.length === 0 ? (
            <p className="text-xs text-[var(--foreground)]/40">{t.calendar.shareNoMembers}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <label
                  key={member.userId}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs transition hover:bg-[var(--surface-muted)]"
                >
                  <input
                    type="checkbox"
                    checked={participantIds.includes(member.userId)}
                    onChange={() => onToggle(member.userId)}
                    className="accent-[var(--sidebar)]"
                  />
                  <span className="text-[var(--foreground)]/70">{member.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
