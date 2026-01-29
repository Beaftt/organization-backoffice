"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { ObservabilityProvider } from "@/components/providers/ObservabilityProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ObservabilityProvider>{children}</ObservabilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
