import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`soft-transition rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
