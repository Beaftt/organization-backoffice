import FinanceClient from "./FinanceClient";

type SearchParams = {
  q?: string;
  group?: string;
  type?: string;
  status?: string;
  sort?: string;
  page?: string;
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  return (
    <FinanceClient
      initialQuery={resolvedParams?.q ?? ""}
      initialGroup={resolvedParams?.group ?? "all"}
      initialType={resolvedParams?.type ?? "all"}
      initialStatus={resolvedParams?.status ?? "all"}
      initialSort={resolvedParams?.sort ?? "date"}
      initialPage={Number(resolvedParams?.page ?? 1)}
    />
  );
}
