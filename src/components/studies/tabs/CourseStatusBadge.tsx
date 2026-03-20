'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { COURSE_STATUS_CONFIG } from '../types';
import type { StudyCourse } from '@/lib/api/studies';

type Props = {
  status: StudyCourse['status'];
};

export function CourseStatusBadge({ status }: Props) {
  const { t } = useLanguage();
  const style = COURSE_STATUS_CONFIG[status];
  const label =
    status === 'ACTIVE'
      ? t.studies.status.active
      : status === 'PAUSED'
        ? t.studies.status.paused
        : t.studies.status.completed;

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}
