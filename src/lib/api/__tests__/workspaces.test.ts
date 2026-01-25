import { describe, expect, it, vi } from "vitest";
import { getWorkspaces } from "@/lib/api/workspaces";
import { getEntitlements } from "@/lib/api/entitlements";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("workspace api", () => {
  it("calls getWorkspaces with pagination", async () => {
    apiFetchMock.mockResolvedValueOnce({ items: [] });

    await getWorkspaces({ page: 2, pageSize: 25 });

    expect(apiFetchMock).toHaveBeenCalledWith("/workspaces?page=2&pageSize=25");
  });

  it("calls getEntitlements with workspace header", async () => {
    apiFetchMock.mockResolvedValueOnce({ items: [] });

    await getEntitlements("workspace-1");

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/workspaces/workspace-1/entitlements?page=1&pageSize=100",
      { workspaceId: "workspace-1" },
    );
  });
});
