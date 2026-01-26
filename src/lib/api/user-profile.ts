import { apiFetch } from "@/lib/api/client";

export type UserProfile = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export const getMyProfile = () => apiFetch<UserProfile>("/user/profiles/me");

export const updateMyProfile = (input: {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
}) =>
  apiFetch<UserProfile>("/user/profiles/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const uploadMyProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UserProfile>("/user/profiles/me/photo", {
    method: "PUT",
    body: formData,
  });
};

export const listUserProfiles = (input?: { page?: number; pageSize?: number }) =>
  apiFetch<PaginatedResponse<UserProfile>>(
    `/user/profiles?page=${input?.page ?? 1}&pageSize=${input?.pageSize ?? 200}`,
  );
