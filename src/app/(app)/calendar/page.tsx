import CalendarClient from "./CalendarClient";

type SearchParams = {
  owners?: string;
  from?: string;
  to?: string;
  tag?: string;
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const owners = resolved?.owners
    ? resolved.owners.split(",").map((owner) => owner.trim()).filter(Boolean)
    : [];

  return (
    <CalendarClient
      initialOwners={owners}
      initialFrom={resolved?.from}
      initialTo={resolved?.to}
      initialTag={resolved?.tag ?? ""}
    />
  );
}
