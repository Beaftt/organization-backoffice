import SecretsClient from "./SecretsClient";
import type { SecretType } from "@/lib/api/secrets";

type SearchParams = {
  q?: string;
  type?: string;
  sort?: string;
  direction?: string;
  page?: string;
};

export default function SecretsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <SecretsClient
      initialQuery={searchParams?.q ?? ""}
      initialType={(searchParams?.type as "all" | SecretType) ?? "all"}
      initialSort={(searchParams?.sort as "updatedAt" | "title") ?? "updatedAt"}
      initialDirection={(searchParams?.direction as "asc" | "desc") ?? "desc"}
      initialPage={Number(searchParams?.page ?? 1)}
    />
  );
}
