'use client';

import Image from 'next/image';
import type { MemberOption } from '@/components/reminders/types';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

type Props = {
  members: MemberOption[];
  allowedUserIds: string[];
  onChange: (ids: string[]) => void;
  labels: {
    sectionLabel: string;
    noMembers: string;
  };
};

export function ListMembersSection({ members, allowedUserIds, onChange, labels }: Props) {
  if (!members.length) {
    return <p className="text-xs text-zinc-400">{labels.noMembers}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        {labels.sectionLabel}
      </span>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
        {members.map((member) => {
          const isSelected = allowedUserIds.includes(member.userId);
          return (
            <label
              key={member.userId}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[var(--surface-muted)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold text-zinc-600">
                {member.photoUrl ? (
                  <Image
                    src={member.photoUrl}
                    alt={member.label}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  getInitials(member.label)
                )}
              </div>
              <span className="flex-1 text-sm text-[var(--foreground)]">{member.label}</span>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  const next = e.target.checked
                    ? Array.from(new Set([...allowedUserIds, member.userId]))
                    : allowedUserIds.filter((id) => id !== member.userId);
                  onChange(next);
                }}
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--sidebar)]"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
