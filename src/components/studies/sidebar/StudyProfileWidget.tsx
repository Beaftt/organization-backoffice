'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { StudyProfileView } from '../types';

type Props = {
  profile: StudyProfileView;
  labels: {
    section: string;
    profileName: string;
    level: string;
    nextLevel: string;
    edit: string;
  };
};

export function StudyProfileWidget({ profile, labels }: Props) {
  const progress = Math.max(0, Math.min(100, (profile.xp / profile.xpForNextLevel) * 100));

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/45">
        {labels.section}
      </p>
      <div className="mb-3 flex items-center gap-3">
        <Avatar src={profile.photoUrl} name={profile.name} size={40} />
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">{labels.profileName}</p>
          <p className="text-xs text-[var(--foreground)]/60">
            {labels.level}: {profile.level}
          </p>
        </div>
      </div>
      <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
        <div className="h-full rounded-full bg-[var(--sidebar)]" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[10px] text-[var(--foreground)]/50">
        {profile.xp} / {profile.xpForNextLevel} XP {labels.nextLevel}
      </p>
      <button
        type="button"
        disabled
        className="mt-3 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]/55"
      >
        {labels.edit}
      </button>
    </div>
  );
}
