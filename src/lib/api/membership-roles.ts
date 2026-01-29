import { apiFetch } from "@/lib/api/client";

export type MembershipRole = {
  membershipId: string;
  roleId: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const listMembershipRoles = (input: {
  membershipId: string;
  page?: number;
  pageSize?: number;
}) =>
  apiFetch<PaginatedResponse<MembershipRole>>(
    `/memberships/${input.membershipId}/roles?page=${input.page ?? 1}&pageSize=${
      input.pageSize ?? 100
    }`,
  );

export const createMembershipRole = (input: {
  membershipId: string;
  roleId: string;
}) =>
  apiFetch<MembershipRole>(`/memberships/${input.membershipId}/roles`, {
    method: "POST",
    body: JSON.stringify({ roleId: input.roleId }),
  });

export const deleteMembershipRole = (input: {
  membershipId: string;
  roleId: string;
}) =>
  apiFetch<void>(
    `/memberships/${input.membershipId}/roles/${input.roleId}`,
    {
      method: "DELETE",
    },
  );
