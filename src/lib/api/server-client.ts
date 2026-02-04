import { cookies } from "next/headers";
import type { ErrorEnvelope, SuccessEnvelope } from "@/lib/api/client";
import { logServerEvent } from "@/lib/observability/server-logger";

const getBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  return raw.replace(/\/$/, "");
};

const buildCookieHeader = async () => {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  if (!all.length) return "";
  return all.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
};

export const serverFetch = async <T>(
  path: string,
  options: RequestInit & { workspaceId?: string } = {},
): Promise<T> => {
  const cookieHeader = await buildCookieHeader();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const cookieStore = await cookies();
  const workspaceId = options.workspaceId ?? cookieStore.get("workspace_id")?.value;
  if (workspaceId) {
    headers.set("x-workspace-id", workspaceId);
  }

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    logServerEvent("error", "api_request_failed", "Server fetch failed", {
      path,
      method: options.method ?? "GET",
    });
    throw new Error("Failed to reach backend");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as SuccessEnvelope<T> | ErrorEnvelope;

  if (!response.ok) {
    logServerEvent("warn", "api_request_failed", "Server API request failed", {
      path,
      method: options.method ?? "GET",
      statusCode: response.status,
    });
    const message = payload.message ?? "Request failed";
    throw new Error(message);
  }

  return (payload as SuccessEnvelope<T>).data;
};
