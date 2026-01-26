import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, register, googleLogin, logout } from "@/lib/api/auth";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("auth api", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("calls login endpoint", async () => {
    apiFetchMock.mockResolvedValueOnce({ accessToken: "a", refreshToken: "r" });

    await login({ email: "user@example.com", password: "pass" });

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "pass" }),
      skipAuth: true,
    });
  });

  it("calls register endpoint", async () => {
    apiFetchMock.mockResolvedValueOnce({ accessToken: "a", refreshToken: "r" });

    await register({ email: "user@example.com", password: "pass" });

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "pass",
        inviteToken: null,
      }),
      skipAuth: true,
    });
  });

  it("calls google endpoint", async () => {
    apiFetchMock.mockResolvedValueOnce({ accessToken: "a", refreshToken: "r" });

    await googleLogin({ idToken: "token" });

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken: "token" }),
      skipAuth: true,
    });
  });

  it("calls logout endpoint", async () => {
    apiFetchMock.mockResolvedValueOnce(undefined);

    await logout();

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
    });
  });
});
