'use client';

type OptionKey = 'monthlyReset' | 'linkFinance' | 'linkCalendar' | 'isPrivate';

type Props = {
  monthlyReset: boolean;
  linkFinance: boolean;
  linkCalendar: boolean;
  isPrivate: boolean;
  disabled?: boolean;
  onChange: (key: OptionKey, value: boolean) => void;
  labels: {
    sectionLabel: string;
    monthlyReset: string;
    linkFinance: string;
    linkCalendar: string;
    isPrivate: string;
  };
};

export function ListOptionsToggle({
  monthlyReset,
  linkFinance,
  linkCalendar,
  isPrivate,
  disabled,
  onChange,
  labels,
}: Props) {
  const options: { key: OptionKey; label: string; checked: boolean }[] = [
    { key: 'monthlyReset', label: labels.monthlyReset, checked: monthlyReset },
    { key: 'linkFinance', label: labels.linkFinance, checked: linkFinance },
    { key: 'linkCalendar', label: labels.linkCalendar, checked: linkCalendar },
    { key: 'isPrivate', label: labels.isPrivate, checked: isPrivate },
  ];

  return (
    <div className="flex flex-col gap-2">
      {labels.sectionLabel ? (
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {labels.sectionLabel}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map(({ key, label, checked }) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange(key, e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] accent-[var(--sidebar)]"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
