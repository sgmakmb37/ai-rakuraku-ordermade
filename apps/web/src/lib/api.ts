const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI(path: string, options: RequestInit = {}) {
  // Supabaseのセッショントークンを取得してAuthorizationヘッダーに付ける
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Projects
  listProjects: () => fetchAPI("/projects"),
  createProject: (data: { name: string; model_type: string; genre: string; description: string }) =>
    fetchAPI("/projects", { method: "POST", body: JSON.stringify(data) }),
  getProject: (id: string) => fetchAPI(`/projects/${id}`),
  deleteProject: (id: string) => fetchAPI(`/projects/${id}`, { method: "DELETE" }),

  // Sources
  addSource: (projectId: string, data: { type: string; name: string; content: string }) =>
    fetchAPI(`/projects/${projectId}/sources`, { method: "POST", body: JSON.stringify(data) }),
  deleteSource: (projectId: string, sourceId: string) =>
    fetchAPI(`/projects/${projectId}/sources/${sourceId}`, { method: "DELETE" }),

  // Training
  startTraining: (projectId: string) =>
    fetchAPI(`/projects/${projectId}/train`, { method: "POST" }),
  resetProject: (projectId: string) =>
    fetchAPI(`/projects/${projectId}/reset`, { method: "POST" }),
  downloadModel: (projectId: string) => fetchAPI(`/projects/${projectId}/download`),

  // Payments
  createCheckout: (projectId: string) =>
    fetchAPI("/payments/checkout", { method: "POST", body: JSON.stringify({ project_id: projectId }) }),
};
