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

export const verifyEmail = (token: string) =>
  apiFetch("/auth/verify-email?token=" + encodeURIComponent(token), {
    method: "GET",
    skipAuth: true,
  });

export const requestPasswordReset = (input: { email: string }) =>
  apiFetch<{ sent: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuth: true,
  });

export const resetPassword = (input: { token: string; password: string }) =>
  apiFetch<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuth: true,
  });

export const logout = () =>
  apiFetch<void>("/auth/logout", {
    method: "POST",
  });
