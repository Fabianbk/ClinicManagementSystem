import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./auth-cookies";

// Thrown for any non-2xx response. Carries the parsed ApiResponse.errors
// array (if the backend sent field-level validation messages) so callers
// can decide how much detail to surface to the user.
export class ApiError extends Error {
  readonly status: number;
  readonly errors: string[] | null;

  constructor(status: number, message: string, errors: string[] | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// Placeholder until the auth cookie route handlers exist. Reads the JWT
// this request should authenticate with, or null for anonymous calls.
async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

interface RequestOptions {
  /** Query params appended to the URL, e.g. { page: 0, size: 20 } */
  params?: Record<string, string | number | boolean | undefined>;
  /** Skip attaching the Authorization header even if a token exists (rarely needed). */
  anonymous?: boolean;
  /** Next.js fetch cache/revalidate controls, passed through as-is. */
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const base = process.env.API_BASE_URL;
  if (!base) {
    throw new Error("API_BASE_URL is not set");
  }
  const url = new URL(path.startsWith("/") ? path.slice(1) : path, `${base}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function apiFetch<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(path, options.params);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (!options.anonymous) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: options.cache,
    next: options.next,
  });

  // 204 No Content — nothing to parse (used by DELETE endpoints).
  if (res.status === 204) {
    return undefined as T;
  }

  // GlobalExceptionHandler always returns a JSON ApiResponse body, even
  // on error, so we can parse first and use its message/errors either way.
  const body_ = (await res.json()) as { success: boolean; message: string | null; data: T; errors: string[] | null };

  if (!res.ok || !body_.success) {
    throw new ApiError(res.status, body_.message ?? `Request failed with status ${res.status}`, body_.errors);
  }

  return body_.data;
}

export const apiGet = <T>(path: string, options?: RequestOptions) =>
  apiFetch<T>(path, "GET", undefined, options);

export const apiPost = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, "POST", body, options);

export const apiPut = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, "PUT", body, options);

export const apiPatch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, "PATCH", body, options);

export const apiDelete = (path: string, options?: RequestOptions) =>
  apiFetch<void>(path, "DELETE", undefined, options);