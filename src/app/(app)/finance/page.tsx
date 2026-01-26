import FinanceClient from "./FinanceClient";

type SearchParams = {
  q?: string;
  group?: string;
  type?: string;
  status?: string;
  sort?: string;
  page?: string;
};

export default function FinancePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <FinanceClient
      initialQuery={searchParams?.q ?? ""}
      initialGroup={searchParams?.group ?? "all"}
      initialType={searchParams?.type ?? "all"}
      initialStatus={searchParams?.status ?? "all"}
      initialSort={searchParams?.sort ?? "date"}
      initialPage={Number(searchParams?.page ?? 1)}
    />
  );
}
