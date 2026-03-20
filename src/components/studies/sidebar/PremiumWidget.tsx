'use client';

import Link from 'next/link';

type Props = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

export function PremiumWidget({ title, subtitle, cta, href }: Props) {
  return (
    <div className="rounded-2xl bg-[var(--sidebar)] p-4 shadow-sm">
      <p className="text-xs font-bold text-white">{title}</p>
      <p className="mt-1 text-[11px] text-white/75">{subtitle}</p>
      <Link
        href={href}
        className="mt-3 flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--sidebar)] transition-colors hover:bg-white/90"
      >
        {cta}
      </Link>
    </div>
  );
}
