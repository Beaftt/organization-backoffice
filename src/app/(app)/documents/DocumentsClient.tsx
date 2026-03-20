'use client';

import { DocumentsPage } from '@/components/documents/DocumentsPage';

type DocumentsClientProps = {
  initialQuery?: string;
  initialFolder?: string;
  initialType?: string;
  initialSort?: string;
  initialPage?: number;
};

export default function DocumentsClient({
  initialQuery = '',
  initialFolder = 'all',
  initialType = 'all',
  initialSort = 'updatedAt',
  initialPage = 1,
}: DocumentsClientProps) {
  return (
    <div className="page-transition p-6">
      <DocumentsPage
        initialQuery={initialQuery}
        initialFolder={initialFolder}
        initialType={initialType}
        initialSort={initialSort}
        initialPage={initialPage}
      />
    </div>
  );
}
