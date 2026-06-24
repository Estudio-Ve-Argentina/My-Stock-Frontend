import { appConfig } from "@/config/app.config";
import {
  readRefreshCookie,
  readTokenCookie,
  writeTokenCookie,
} from "@/lib/auth/session";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

let onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = readRefreshCookie();
    if (!refreshToken) return null;

    try {
      const res = await fetch(
        `${appConfig.apiBaseUrl}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
        { method: "POST" },
      );
      if (!res.ok) return null;
      const data = await res.json();
      writeTokenCookie(data.jwtToken);
      return data.jwtToken as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message ?? data.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const url = `${appConfig.apiBaseUrl}${path}`;
  const headers: Record<string, string> = {};
  const jsonBody = body !== undefined ? JSON.stringify(body) : undefined;

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = readTokenCookie();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { method, headers, body: jsonBody });

  if (response.status === 401 && auth) {
    const newToken = await tryRefresh();
    if (!newToken) {
      onSessionExpired?.();
      throw new ApiError(401, await parseError(response));
    }
    headers.Authorization = `Bearer ${newToken}`;
    const retry = await fetch(url, { method, headers, body: jsonBody });
    if (retry.status === 401) {
      onSessionExpired?.();
    }
    return handleResponse<T>(retry);
  }

  return handleResponse<T>(response);
}
