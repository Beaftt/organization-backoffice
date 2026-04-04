import { Suspense, type ReactNode } from 'react';

import { FinanceShell } from '@/components/finance/shell/FinanceShell';

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={children}><FinanceShell>{children}</FinanceShell></Suspense>;
}