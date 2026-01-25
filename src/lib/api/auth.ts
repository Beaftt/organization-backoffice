import { apiFetch } from "@/lib/api/client";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  defaultWorkspaceId: string | null;
  defaultWorkspaceType: string | null;
  defaultWorkspaceDomain: string | null;
  roles: string[];
};

export const login = (input: { email: string; password: string }) =>
  apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuth: true,
  });

export const register = (input: {
  email: string;
  password: string;
  inviteToken?: string;
}) =>
  apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      inviteToken: input.inviteToken ?? null,
    }),
    skipAuth: true,
  });

export const googleLogin = (input: { idToken: string }) =>
  apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuth: true,
  });

export const logout = (input: { refreshToken: string }) =>
  apiFetch<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify(input),
  });
