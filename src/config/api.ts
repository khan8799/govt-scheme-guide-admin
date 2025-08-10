export const API_BASE_URL = "https://govt-scheme-guide-api.onrender.com";

export const API_PATHS = {
  registerUser: "/api/registerUser",
  loginUser: "/api/loginUser",
  allUsers: "/api/allUsers",
  categoriesWithSchemeCount: "/api/categoriesWithSchemeCount",
  getAllSchemes: "/api/getAllSchemes",
  registerCategory: "/api/registerCategory",
  registerScheme: "/api/registerScheme",
};

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...getAuthHeaders(),
    },
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
