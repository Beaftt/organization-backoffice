'use client';

import type { MemberOption } from '../types';

interface CalendarVisibilityFilterProps {
  members: MemberOption[];
  selectedOwners: string[];
  onToggle: (userId: string) => void;
}

export function CalendarVisibilityFilter({
  members,
  selectedOwners,
  onToggle,
}: CalendarVisibilityFilterProps) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {members.map((member) => {
        const isActive = selectedOwners.length === 0 || selectedOwners.includes(member.userId);
        const initials = member.label
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? '')
          .join('');
        return (
          <button
            key={member.userId}
            type="button"
            title={member.label}
            onClick={() => onToggle(member.userId)}
            className={[
              'flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-all',
              isActive
                ? 'border-[var(--border)] text-[var(--foreground)]/70'
                : 'border-transparent text-[var(--foreground)]/30 opacity-40',
            ].join(' ')}
          >
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={member.label}
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--sidebar)]/20 text-[9px] font-bold text-[var(--sidebar)]">
                {initials}
              </span>
            )}
            <span>{member.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
