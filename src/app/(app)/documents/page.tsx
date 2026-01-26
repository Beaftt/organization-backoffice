import DocumentsClient from "./DocumentsClient";

type SearchParams = {
  q?: string;
  folder?: string;
  type?: string;
  sort?: string;
  page?: string;
};

export default function DocumentsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <DocumentsClient
      initialQuery={searchParams?.q ?? ""}
      initialFolder={searchParams?.folder ?? "all"}
      initialType={searchParams?.type ?? "all"}
      initialSort={searchParams?.sort ?? "updatedAt"}
      initialPage={Number(searchParams?.page ?? 1)}
    />
  );
}
