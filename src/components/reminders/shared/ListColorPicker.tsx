'use client';

import { LIST_COLORS } from '@/components/reminders/types';

type Props = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
};

export function ListColorPicker({ value, onChange, label }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {label}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {LIST_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label={color}
            aria-pressed={value === color}
          >
            {value === color ? (
              <span className="flex h-full w-full items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
