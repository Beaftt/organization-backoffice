import { beforeEach, describe, expect, it, vi } from "vitest";
import { listUsers, lookupUserByEmail } from "@/lib/api/users";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("users api", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("calls lookup user endpoint", async () => {
    apiFetchMock.mockResolvedValueOnce({ id: "u1" });

    await lookupUserByEmail("user@example.com");

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/users/lookup?email=user%40example.com",
    );
  });

  it("calls list users endpoint with defaults", async () => {
    apiFetchMock.mockResolvedValueOnce({ items: [], total: 0 });

    await listUsers();

    expect(apiFetchMock).toHaveBeenCalledWith("/users?page=1&pageSize=100");
  });

  it("calls list users endpoint with params", async () => {
    apiFetchMock.mockResolvedValueOnce({ items: [], total: 0 });

    await listUsers({ page: 2, pageSize: 50, orderBy: "createdAt", orderDirection: "asc" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/users?page=2&pageSize=50&orderBy=createdAt&orderDirection=asc",
    );
  });
});
