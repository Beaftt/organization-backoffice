import SecretsClient from "./SecretsClient";
import type { SecretType } from "@/lib/api/secrets";

type SearchParams = {
  q?: string;
  type?: string;
  sort?: string;
  direction?: string;
  page?: string;
};

export default async function SecretsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <SecretsClient
      initialQuery={params?.q ?? ""}
      initialType={(params?.type as "all" | SecretType) ?? "all"}
      initialSort={(params?.sort as "updatedAt" | "title") ?? "updatedAt"}
      initialDirection={(params?.direction as "asc" | "desc") ?? "desc"}
      initialPage={Number(params?.page ?? 1)}
    />
  );
}
