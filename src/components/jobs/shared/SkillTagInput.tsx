'use client';

import { useState } from 'react';

type Props = {
  skills: string[];
  placeholder: string;
  hint: string;
  onChange: (skills: string[]) => void;
};

export function SkillTagInput({ skills, placeholder, hint, onChange }: Props) {
  const [input, setInput] = useState('');

  const addSkill = (rawValue: string) => {
    const trimmed = rawValue.trim().replace(/,$/, '');
    if (!trimmed || skills.includes(trimmed)) {
      setInput('');
      return;
    }
    onChange([...skills, trimmed]);
    setInput('');
  };

  return (
    <div>
      <input
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
        placeholder={placeholder}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addSkill(input);
          }

          if (event.key === 'Backspace' && !input && skills.length > 0) {
            onChange(skills.slice(0, -1));
          }
        }}
        onBlur={() => {
          if (input) {
            addSkill(input);
          }
        }}
      />
      <p className="mt-1 text-[10px] text-[var(--foreground)]/45">{hint}</p>

      {skills.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs font-medium text-[var(--foreground)]/75"
            >
              {skill}
              <button
                type="button"
                className="text-[var(--foreground)]/40 transition hover:text-[var(--danger-text)]"
                onClick={() => onChange(skills.filter((item) => item !== skill))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}