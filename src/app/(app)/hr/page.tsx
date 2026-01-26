"use client";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
import { useLanguage } from "@/lib/i18n/language-context";

export default function HrPage() {
  const { t } = useLanguage();
  return <ModulePlaceholder title={t.modules.hr} />;
}
