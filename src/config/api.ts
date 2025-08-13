export const API_BASE_URL = "https://govt-scheme-guide-api.onrender.com/api";

export const API_PATHS = {
  registerUser: "/registerUser",
  loginUser: "/loginUser",
  allUsers: "/allUsers",
  categoriesWithSchemeCount: "/categoriesWithSchemeCount",
  getAllSchemes: "/getAllSchemes",
  registerCategory: "/registerCategory",
  registerScheme: "/registerScheme",
};

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    return {};
  }
  const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { Authorization: value };
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  // Build headers in a type-safe way to satisfy HeadersInit
  let headers: HeadersInit;
  const authHeaders = getAuthHeaders();
  if (init?.headers instanceof Headers) {
    const h = new Headers(init.headers);
    Object.entries(authHeaders).forEach(([k, v]) => h.set(k, v));
    headers = h;
  } else if (Array.isArray(init?.headers)) {
    headers = [...init!.headers, ...Object.entries(authHeaders)];
  } else {
    headers = { ...(init?.headers as Record<string, string> | undefined), ...authHeaders };
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return fetchJson<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...(init || {}),
  });
}

export async function postFormData<T>(path: string, formData: FormData, init?: RequestInit): Promise<T> {
  return fetchJson<T>(path, {
    method: "POST",
    body: formData,
    ...(init || {}),
  });
}
