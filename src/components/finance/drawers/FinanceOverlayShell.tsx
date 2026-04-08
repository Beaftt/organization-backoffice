'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useLanguage } from '@/lib/i18n/language-context';

const subscribeToClient = () => () => undefined;

type FinanceOverlayShellProps = {
  open: boolean;
  title: string;
  description?: string;
  ariaLabel?: string;
  variant?: 'modal' | 'drawer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

const modalSizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-5xl',
};

const drawerSizeClass = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function FinanceOverlayShell({
  open,
  title,
  description,
  ariaLabel,
  variant = 'modal',
  size = 'md',
  footer,
  children,
  onClose,
}: FinanceOverlayShellProps) {
  const { t } = useLanguage();
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const closeLabel = t.finance.close ?? 'Close';

  if (!open || !isClient) {
    return null;
  }

  const isDrawer = variant === 'drawer';
  const panelClassName = isDrawer
    ? `h-full w-full ${drawerSizeClass[size]} border-l [border-color:var(--border)]`
    : `w-full ${modalSizeClass[size]} rounded-2xl`;
  const viewportClassName = isDrawer
    ? 'fixed inset-0 z-[82] flex justify-end pointer-events-none'
    : 'fixed inset-0 z-[82] flex items-center justify-center p-4 pointer-events-none';

  return createPortal(
    <>
      <button
        type="button"
        aria-label={closeLabel}
        className="modal-overlay fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      <div
        className={viewportClassName}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? title}
          className={`modal-content pointer-events-auto flex flex-col bg-[var(--surface)] shadow-2xl ${panelClassName}`}
          style={{ maxHeight: isDrawer ? '100vh' : '90vh', overflow: 'hidden' }}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b [border-color:var(--border)] px-5 py-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
              {description ? (
                <p className="text-sm text-[var(--foreground)]/60">{description}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/50 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer ? (
            <div className="shrink-0 border-t [border-color:var(--border)] px-5 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
}