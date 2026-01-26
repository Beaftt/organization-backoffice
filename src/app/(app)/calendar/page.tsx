import CalendarClient from "./CalendarClient";

type SearchParams = {
  module?: string;
  status?: string;
};

export default function CalendarPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <CalendarClient
      initialModule={searchParams?.module ?? "all"}
      initialStatus={searchParams?.status ?? "all"}
    />
  );
}
