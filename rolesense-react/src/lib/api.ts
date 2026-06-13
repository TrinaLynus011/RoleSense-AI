const BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

async function fetchApi(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("rolesense_token");
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: res.statusText })); throw new Error(err.detail) }
  return res.json();
}

export const api = {
  signup: (b: { name: string; email: string; password: string; company?: string }) => fetchApi("/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) => fetchApi("/login", { method: "POST", body: JSON.stringify(b) }),
  me: () => fetchApi("/me"),
  rankCandidates: (b: { job_description: string; location?: string; skills?: string; min_experience?: number | null; remote?: boolean; top_n?: number }) => fetchApi("/rank-candidates", { method: "POST", body: JSON.stringify(b) }),
  getLocations: () => fetchApi("/locations"),
  getAnalytics: () => fetchApi("/analytics"),
};
