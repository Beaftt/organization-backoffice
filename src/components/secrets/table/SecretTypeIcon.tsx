'use client';

import type { SecretType } from '../types';
import { TYPE_CONFIG } from '../types';

interface SecretTypeIconProps {
  type: SecretType;
}

export function SecretTypeIcon({ type }: SecretTypeIconProps) {
  const config = TYPE_CONFIG[type];

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${config.bg} ${config.color}`}
    >
      {config.icon}
    </div>
  );
}
