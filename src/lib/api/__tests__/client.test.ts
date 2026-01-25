import { describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "@/lib/api/client";

vi.mock("@/lib/storage/auth", () => ({
  getAuthTokens: () => ({ accessToken: "token", refreshToken: "refresh" }),
  setAuthTokens: vi.fn(),
  clearAuthTokens: vi.fn(),
}));

vi.mock("@/lib/storage/workspace", () => ({
  getWorkspaceId: () => "workspace-1",
}));

describe("apiFetch", () => {
  it("sends auth and workspace headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          statusCode: 200,
          data: { ok: true },
        }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = await apiFetch<{ ok: boolean }>("/health");

    expect(data.ok).toBe(true);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("x-workspace-id")).toBe("workspace-1");
  });

  it("throws ApiError on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network")) as unknown as typeof fetch;

    await expect(apiFetch("/health")).rejects.toBeInstanceOf(ApiError);
  });
});
