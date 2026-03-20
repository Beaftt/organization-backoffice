'use client';

import { Input } from '@/components/ui/Input';

type Props = {
  linkedinUrl: string;
  portfolioUrl: string;
  labels: {
    title: string;
    linkedin: string;
    portfolio: string;
  };
  onChange: (patch: { linkedinUrl?: string; portfolioUrl?: string }) => void;
};

export function ResumeLinksSection({ linkedinUrl, portfolioUrl, labels, onChange }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]/45">{labels.title}</p>
      <div className="space-y-3">
        <Input placeholder={labels.linkedin} value={linkedinUrl} onChange={(event) => onChange({ linkedinUrl: event.target.value })} />
        <Input placeholder={labels.portfolio} value={portfolioUrl} onChange={(event) => onChange({ portfolioUrl: event.target.value })} />
      </div>
    </div>
  );
}