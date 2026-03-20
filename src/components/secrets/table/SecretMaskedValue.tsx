'use client';

import { CopyButton } from '../shared/CopyButton';
import { getSecret } from '@/lib/api/secrets';

interface SecretMaskedValueProps {
  secretId: string;
}

export function SecretMaskedValue({ secretId }: SecretMaskedValueProps) {
  const handleCopy = async () => {
    const details = await getSecret({ id: secretId });
    // Never log the secret value
    await navigator.clipboard.writeText(details.secret);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm tracking-widest text-[var(--foreground)]/40">
        ••••••••
      </span>
      <CopyButton onCopy={handleCopy} size="xs" />
    </div>
  );
}
