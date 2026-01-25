import { clearAuthTokens, getAuthTokens, setAuthTokens } from "@/lib/storage/auth";
import { getWorkspaceId } from "@/lib/storage/workspace";

export type SuccessEnvelope<T> = {
  statusCode: number;
  data: T;
  message?: string;
  message_i18n?: {
    en: string;
    pt?: string;
  };
};

export type ErrorEnvelope = {
  statusCode: number;
  code: string;
  message?: string;
  message_i18n?: {
    en: string;
    pt?: string;
  };
  details?: unknown;
};

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  messageI18n?: { en: string; pt?: string };

  constructor(input: { message: string; statusCode: number; code?: string; messageI18n?: { en: string; pt?: string } }) {
    super(input.message);
    this.statusCode = input.statusCode;
    this.code = input.code;
    this.messageI18n = input.messageI18n;
  }
}

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const refreshAuthSession = async (refreshToken: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuthTokens();
    throw new ApiError({
      message: "Unauthorized",
      statusCode: response.status,
    });
  }

  const body = (await response.json()) as SuccessEnvelope<{
    accessToken: string;
    refreshToken: string;
  }>;

  setAuthTokens({
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
  });

  return body.data;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit & { workspaceId?: string; skipAuth?: boolean } = {},
  hasRetried = false,
): Promise<T> => {
  const tokens = getAuthTokens();
  const workspaceId = options.workspaceId ?? getWorkspaceId();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && tokens?.accessToken) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  if (workspaceId) {
    headers.set("x-workspace-id", workspaceId);
  }

  let response: Response;

  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError({
      message: "Failed to reach backend",
      statusCode: 0,
      code: "network_error",
    });
  }

  if (response.status === 401 && tokens?.refreshToken && !hasRetried) {
    await refreshAuthSession(tokens.refreshToken);
    return apiFetch<T>(path, options, true);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as SuccessEnvelope<T> | ErrorEnvelope;

  if (!response.ok) {
    throw new ApiError({
      message: payload.message ?? "Request failed",
      statusCode: payload.statusCode ?? response.status,
      code: "code" in payload ? payload.code : undefined,
      messageI18n: "message_i18n" in payload ? payload.message_i18n : undefined,
    });
  }

  return (payload as SuccessEnvelope<T>).data;
};
