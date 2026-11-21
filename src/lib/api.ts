import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

/** For public endpoints (no auth header). */
export const publicApi = axios.create({ baseURL: API_URL, timeout: 20000 });

/** For protected endpoints: attaches a short-lived JWT obtained from /api/token. */
export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

let cachedToken: { token: string; expiresAt: number } | null = null;
let inflight: Promise<string | null> | null = null;

async function fetchToken(): Promise<string | null> {
  const res = await fetch("/api/token", { credentials: "include", cache: "no-store" });
  if (!res.ok) {
    cachedToken = null;
    return null;
  }
  const data = (await res.json()) as { token: string; expiresAt: number };
  cachedToken = data;
  return data.token;
}

export async function getAccessToken(force = false): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!force && cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) return cachedToken.token;
  if (!inflight) inflight = fetchToken().finally(() => (inflight = null));
  return inflight;
}

export function clearAccessToken() {
  cachedToken = null;
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    // Token expired/rotated: fetch a fresh one and retry once
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const token = await getAccessToken(true);
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

type ApiErrorBody = { message?: string; details?: Record<string, string> };

/** Extracts a user-friendly message from any thrown error. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Cannot reach the server. Please check your connection and try again.";
    const body = err.response.data as ApiErrorBody | undefined;
    if (body?.message) return body.message;
    if (err.response.status === 401) return "Please sign in to continue.";
    if (err.response.status === 403) return "You don't have permission to do that.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function getFieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err)) return ((err.response?.data as ApiErrorBody | undefined)?.details) ?? {};
  return {};
}

/** Server-side (RSC) fetch helper for public data. Returns null on failure. */
export async function serverGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: T };
    return json.data;
  } catch {
    return null;
  }
}
