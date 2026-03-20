'use client';

import { COURSE_COLORS } from '../types';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function CourseColorPicker({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/55">
        {label}
      </span>
      <div className="grid grid-cols-6 gap-2">
        {COURSE_COLORS.map((color) => {
          const isSelected = value === color.value;
          return (
            <button
              key={color.value}
              type="button"
              className={`h-10 rounded-xl border transition ${
                isSelected ? 'scale-[1.02] shadow-sm' : 'hover:scale-[1.02]'
              }`}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              onClick={() => onChange(color.value)}
              aria-label={color.value}
            />
          );
        })}
      </div>
    </div>
  );
}
