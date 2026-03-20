'use client';

import { SecretsPage } from '@/components/secrets/SecretsPage';
import type { SecretType } from '@/lib/api/secrets';

type SecretsClientProps = {
  initialQuery?: string;
  initialType?: 'all' | SecretType;
  initialSort?: 'updatedAt' | 'title';
  initialDirection?: 'asc' | 'desc';
  initialPage?: number;
};

export default function SecretsClient({
  initialQuery = '',
  initialType = 'all',
  initialSort = 'updatedAt',
  initialDirection = 'desc',
  initialPage = 1,
}: SecretsClientProps) {
  return (
    <div className="page-transition p-6">
      <SecretsPage
        initialQuery={initialQuery}
        initialType={initialType}
        initialSort={initialSort}
        initialDirection={initialDirection}
        initialPage={initialPage}
      />
    </div>
  );
}
