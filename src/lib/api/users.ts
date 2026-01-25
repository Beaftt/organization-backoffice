import { apiFetch } from "@/lib/api/client";

export type UserLookup = {
  id: string;
  email: string;
  name: string | null;
  pictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export const lookupUserByEmail = (email: string) =>
  apiFetch<UserLookup>(`/users/lookup?email=${encodeURIComponent(email)}`);
