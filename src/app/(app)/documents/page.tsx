import DocumentsClient from "./DocumentsClient";

type SearchParams = {
  q?: string;
  folder?: string;
  type?: string;
  sort?: string;
  page?: string;
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <DocumentsClient
      initialQuery={params?.q ?? ""}
      initialFolder={params?.folder ?? "all"}
      initialType={params?.type ?? "all"}
      initialSort={params?.sort ?? "updatedAt"}
      initialPage={Number(params?.page ?? 1)}
    />
  );
}
