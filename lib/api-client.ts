// Cliente HTTP tipado hacia el backend de PRISM.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type AnalysisStatus = "pending" | "running" | "completed" | "failed";

// Resumen del ultimo analisis de un PR, embebido en la lista.
export interface LatestAnalysisSummary {
  id: string;
  status: AnalysisStatus;
  overall_score: number | null;
  findings_count: number;
  high_severity_count: number;
  category_counts: Record<FindingCategory, number>;
}

export interface PullRequest {
  id: string;
  github_pr_number: number;
  title: string;
  author: string | null;
  diff_url: string | null;
  created_at: string;
  latest_analysis: LatestAnalysisSummary | null;
}

export interface RepositoryStats {
  total_analyzed: number;
  average_score: number | null;
  critical_findings: number;
  ai_provider: string;
}

export type FindingCategory = "bug" | "security" | "performance" | "quality" | "tests";
export type FindingSeverity = "low" | "medium" | "high";

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  file_path: string;
  line_number: number | null;
  description: string;
  recommendation: string | null;
}

export interface Analysis {
  id: string;
  status: AnalysisStatus;
  overall_score: number | null;
  ai_provider: string | null;
  started_at: string | null;
  finished_at: string | null;
  findings: Finding[];
}

// Error tipado con el mensaje real del backend.
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.detail ?? `API respondio ${res.status}`, res.status);
  }
  return res.json();
}

export async function getHealth(): Promise<{ service: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/`);
  return handleResponse(res);
}

// Trae (y sincroniza en el backend) los PRs abiertos de un repo publico de GitHub.
export async function getPullRequests(fullName: string): Promise<PullRequest[]> {
  const res = await fetch(`${API_BASE_URL}/repositories/${fullName}/pull-requests`);
  return handleResponse(res);
}

// Trae un PR puntual ya sincronizado, para la pantalla de detalle.
export async function getPullRequest(id: string): Promise<PullRequest> {
  const res = await fetch(`${API_BASE_URL}/pull-requests/${id}`);
  return handleResponse(res);
}

// Dispara el analisis de AI sobre un PR. Puede tardar unos segundos (sincronico, sin cola todavia).
export async function analyzePullRequest(id: string): Promise<Analysis> {
  const res = await fetch(`${API_BASE_URL}/pull-requests/${id}/analyze`, { method: "POST" });
  return handleResponse(res);
}

// Historial de analisis previos de un PR, mas recientes primero.
export async function getAnalyses(pullRequestId: string): Promise<Analysis[]> {
  const res = await fetch(`${API_BASE_URL}/pull-requests/${pullRequestId}/analyses`);
  return handleResponse(res);
}

// Stats agregadas de un repo ya sincronizado (para las stat cards del dashboard).
export async function getRepositoryStats(fullName: string): Promise<RepositoryStats> {
  const res = await fetch(`${API_BASE_URL}/repositories/${fullName}/stats`);
  return handleResponse(res);
}
