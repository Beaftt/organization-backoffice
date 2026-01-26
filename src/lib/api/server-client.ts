import { cookies } from "next/headers";
import type { ErrorEnvelope, SuccessEnvelope } from "@/lib/api/client";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

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

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as SuccessEnvelope<T> | ErrorEnvelope;

  if (!response.ok) {
    const message = payload.message ?? "Request failed";
    throw new Error(message);
  }

  return (payload as SuccessEnvelope<T>).data;
};
