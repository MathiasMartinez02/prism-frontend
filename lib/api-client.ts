// Cliente HTTP tipado hacia el backend de PRISM.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface PullRequest {
  id: string;
  github_pr_number: number;
  title: string;
  author: string | null;
  diff_url: string | null;
  created_at: string;
}

// Error tipado para poder mostrar el mensaje real del backend (repo no encontrado, rate limit, etc).
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getHealth(): Promise<{ service: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/`);
  if (!res.ok) {
    throw new ApiError(`API respondio ${res.status}`, res.status);
  }
  return res.json();
}

// Trae (y sincroniza en el backend) los PRs abiertos de un repo publico de GitHub.
export async function getPullRequests(fullName: string): Promise<PullRequest[]> {
  const res = await fetch(`${API_BASE_URL}/repositories/${fullName}/pull-requests`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.detail ?? `API respondio ${res.status}`, res.status);
  }
  return res.json();
}
