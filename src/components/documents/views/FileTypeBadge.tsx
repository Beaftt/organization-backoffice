'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { FILE_TYPE_STYLE } from '../types';
import type { DocumentType } from '../types';

type Props = {
  type: DocumentType;
};

export function FileTypeBadge({ type }: Props) {
  const { t } = useLanguage();
  const style = FILE_TYPE_STYLE[type];
  const labels: Record<DocumentType, string> = {
    PDF: t.documents.typePdf,
    IMAGE: t.documents.typeImage,
    SPREADSHEET: t.documents.typeSpreadsheet,
    OTHER: t.documents.typeOther,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
    >
      {labels[type]}
    </span>
  );
}
