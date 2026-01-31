import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Card({ children, className = "", id }: CardProps) {
  return (
    <div
      id={id}
      className={`soft-transition rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
