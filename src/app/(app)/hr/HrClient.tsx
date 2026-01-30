"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { getWorkspaceId } from "@/lib/storage/workspace";
import { listHrJobs, listHrPeople } from "@/lib/api/hr";
import { ApiError } from "@/lib/api/client";

export default function HrClient() {
  const { t } = useLanguage();
  const [peopleCount, setPeopleCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSummary = useCallback(async () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    setError(null);
    setIsLoading(true);

    try {
      const [peopleResponse, jobsResponse] = await Promise.all([
        listHrPeople({ workspaceId, pageSize: 1 }),
        listHrJobs({ workspaceId, pageSize: 1 }),
      ]);
      setPeopleCount(peopleResponse.total);
      setJobsCount(jobsResponse.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.hr.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t.hr.loadError]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t.hr.title}</h2>
        <p className="text-sm text-zinc-500">{t.hr.subtitle}</p>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex h-full flex-col justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">{t.hr.peopleTitle}</h3>
            <p className="text-sm text-zinc-500">{t.hr.cards.peopleDescription}</p>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                {t.hr.cards.totalLabel}
              </p>
              <p className="text-3xl font-semibold">
                {isLoading ? "—" : peopleCount}
              </p>
            </div>
            <Link href="/hr/people">
              <Button>{t.hr.cards.viewPeople}</Button>
            </Link>
          </div>
        </Card>

        <Card className="flex h-full flex-col justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">{t.hr.jobsTitle}</h3>
            <p className="text-sm text-zinc-500">{t.hr.cards.jobsDescription}</p>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                {t.hr.cards.totalLabel}
              </p>
              <p className="text-3xl font-semibold">
                {isLoading ? "—" : jobsCount}
              </p>
            </div>
            <Link href="/hr/jobs">
              <Button>{t.hr.cards.viewJobs}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
