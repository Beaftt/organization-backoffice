import { apiFetch } from "@/lib/api/client";

export type UserLookup = {
  id: string;
  email: string;
  name: string | null;
  pictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const lookupUserByEmail = (email: string) =>
  apiFetch<UserLookup>(`/users/lookup?email=${encodeURIComponent(email)}`);

export const getUserById = (id: string) => apiFetch<UserLookup>(`/users/${id}`);

export const getMyUser = () => apiFetch<UserLookup>("/users/me");

export const listUsers = (input?: {
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "updatedAt";
  orderDirection?: "asc" | "desc";
}) =>
  apiFetch<PaginatedResponse<UserLookup>>(
    `/users?page=${input?.page ?? 1}&pageSize=${input?.pageSize ?? 100}` +
      `${input?.orderBy ? `&orderBy=${input.orderBy}` : ""}` +
      `${input?.orderDirection ? `&orderDirection=${input.orderDirection}` : ""}`,
  );
