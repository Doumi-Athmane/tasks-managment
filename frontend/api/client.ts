const BASE_URL = import.meta.env.VITE_API_BASE_URL; 
import { getAccessToken } from "../auth/token";
import { logoutAndRedirect } from "./auth";


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // only if token exists, add Authorization header
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

    if (res.status === 401) {
    logoutAndRedirect();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = { request };
