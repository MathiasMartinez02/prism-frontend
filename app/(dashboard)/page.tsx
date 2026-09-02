"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import {
  ApiError,
  getPullRequests,
  getRepositoryStats,
  type FindingCategory,
  type PullRequest,
  type RepositoryStats,
} from "@/lib/api-client";

const LAST_REPO_KEY = "prism:last-repo";
const CATEGORY_LABEL: Record<FindingCategory, string> = {
  bug: "bug",
  security: "security",
  performance: "perf",
  quality: "quality",
  tests: "tests",
};

// Dashboard: conecta un repo, muestra sus stats y la lista de PRs con score/estado.
export default function DashboardPage() {
  const [repoInput, setRepoInput] = useState("octocat/Spoon-Knife");
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[] | null>(null);
  const [stats, setStats] = useState<RepositoryStats | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRepository(name: string) {
    setRepoInput(name);
    setLoading(true);
    setError(null);
    try {
      const prs = await getPullRequests(name);
      setPullRequests(prs);
      setConnectedRepo(name);
      try {
        setStats(await getRepositoryStats(name));
      } catch {
        setStats(null); // no bloquea la lista de PRs si stats falla por algun motivo
      }
      window.localStorage?.setItem(LAST_REPO_KEY, name);
    } catch (err) {
      setPullRequests(null);
      setStats(null);
      setConnectedRepo(null);
      setError(err instanceof ApiError ? err.message : "Error inesperado al conectar con el backend.");
    } finally {
      setLoading(false);
    }
  }

  // Recuerda el ultimo repo consultado en este browser y lo carga solo si ya se conecto antes.
  useEffect(() => {
    let lastRepo: string | null = null;
    try {
      lastRepo = window.localStorage?.getItem(LAST_REPO_KEY) ?? null;
    } catch {
      // localStorage puede no estar disponible (modo privado); seguimos sin recordar nada.
    }
    if (lastRepo) {
      // Bootstrap intencional desde localStorage al montar (no una reaccion a un cambio de estado).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRepository(lastRepo);
    }
  }, []);

  function handleConnect(e: FormEvent) {
    e.preventDefault();
    if (repoInput.trim().length === 0) return;
    loadRepository(repoInput.trim());
  }

  const filteredPullRequests = useMemo(() => {
    if (!pullRequests) return null;
    const q = search.trim().toLowerCase();
    if (!q) return pullRequests;
    return pullRequests.filter(
      (pr) =>
        pr.title.toLowerCase().includes(q) ||
        pr.author?.toLowerCase().includes(q) ||
        String(pr.github_pr_number).includes(q),
    );
  }, [pullRequests, search]);

  const [owner, repoName] = (connectedRepo ?? "").split("/");

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Topbar: breadcrumb del repo activo + buscador de PRs + conectar (separados, como en el diseno aprobado) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted-dim">
              <path d="M4 4h9l2 2h5v14H4V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {connectedRepo ? (
              <span className="font-mono text-sm">
                <span className="text-muted">{owner} /</span> <span className="font-semibold text-foreground">{repoName}</span>
              </span>
            ) : (
              <span className="font-mono text-sm text-muted-dim">Ningun repositorio conectado</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {pullRequests && pullRequests.length > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted-dim">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar PR"
                  className="w-32 bg-transparent text-sm text-foreground placeholder:text-muted-dim focus:outline-none"
                />
              </div>
            )}
            <form onSubmit={handleConnect} className="flex items-center gap-2">
              <input
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="owner/repo"
                className="w-40 rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-dim focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={loading || repoInput.trim().length === 0}
                className="cursor-pointer whitespace-nowrap rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Conectando..." : "+ Conectar repositorio"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive-dim/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-4 gap-3.5">
            <StatCard label="PRs analizados" value={String(stats.total_analyzed)} />
            <StatCard
              label="Score promedio"
              value={stats.average_score !== null ? String(stats.average_score) : "—"}
              accent={stats.average_score !== null}
            />
            <StatCard
              label="Findings criticos"
              value={String(stats.critical_findings)}
              destructive={stats.critical_findings > 0}
            />
            <StatCard label="Provider activo" value={stats.ai_provider} mono />
          </div>
        )}

        {loading && !pullRequests && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-card-hover" style={{ width: `${70 - i * 12}%` }} />
            ))}
          </div>
        )}

        {!loading && !pullRequests && !error && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-dim">
              <path d="M4 4h9l2 2h5v14H4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium text-foreground">Ningun repositorio conectado todavia</p>
            <p className="max-w-sm text-xs text-muted">
              Escribi un repo publico de GitHub arriba (formato owner/repo) y presiona &quot;Conectar
              repositorio&quot; para traer sus PRs abiertos.
            </p>
          </div>
        )}

        {filteredPullRequests && (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[2fr_0.8fr_0.7fr_1.2fr_0.9fr] bg-background-sidebar px-4 py-2.5 text-xs uppercase tracking-wide text-muted-dim">
              <div>Pull request</div>
              <div>Autor</div>
              <div>Score</div>
              <div>Findings</div>
              <div>Estado</div>
            </div>
            {filteredPullRequests.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted">
                {search ? "Ningun PR coincide con la busqueda." : "Este repositorio no tiene PRs abiertos."}
              </div>
            )}
            {filteredPullRequests.map((pr, i) => (
              <Link
                key={pr.id}
                href={`/pr/${pr.id}`}
                className={`grid cursor-pointer grid-cols-[2fr_0.8fr_0.7fr_1.2fr_0.9fr] items-center border-t border-border px-4 py-3 transition-colors hover:bg-card-hover ${i % 2 === 0 ? "bg-card" : ""}`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">{pr.title}</span>
                  <span className="font-mono text-xs text-muted-dim">#{pr.github_pr_number}</span>
                </div>
                <span className="text-xs text-muted">{pr.author ?? "—"}</span>
                <div>
                  {pr.latest_analysis?.status === "completed" && pr.latest_analysis.overall_score !== null ? (
                    <ScoreRing score={pr.latest_analysis.overall_score} size={34} />
                  ) : (
                    <span className="font-mono text-xs text-muted-dim">--</span>
                  )}
                </div>
                <FindingsCell analysis={pr.latest_analysis} />
                <StatusCell analysis={pr.latest_analysis} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
  destructive,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  destructive?: boolean;
  mono?: boolean;
}) {
  const color = destructive ? "text-destructive" : accent ? "text-accent" : "text-foreground";
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <span className="text-[11px] uppercase tracking-wide text-muted-dim">{label}</span>
      <span className={`font-mono text-xl font-semibold ${mono ? "text-base" : ""} ${color}`}>{value}</span>
    </div>
  );
}

// Desglose de findings por categoria, coloreado en rojo si hay severidad alta.
function FindingsCell({ analysis }: { analysis: PullRequest["latest_analysis"] }) {
  if (!analysis || analysis.status === "failed") {
    return <span className="text-xs text-muted-dim">{analysis ? "—" : "sin analizar"}</span>;
  }
  if (analysis.status !== "completed") {
    return <span className="text-xs text-muted-dim">analizando...</span>;
  }
  const entries = Object.entries(analysis.category_counts) as [FindingCategory, number][];
  if (entries.length === 0) {
    return <span className="text-xs text-muted-dim">sin findings</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs">
      {entries.map(([category, count]) => {
        const isCritical = (category === "bug" || category === "security") && analysis.high_severity_count > 0;
        return (
          <span key={category} className={isCritical ? "font-medium text-destructive" : "text-muted"}>
            {count} {CATEGORY_LABEL[category]}
          </span>
        );
      })}
    </div>
  );
}

function StatusCell({ analysis }: { analysis: PullRequest["latest_analysis"] }) {
  if (!analysis) {
    return (
      <span className="w-fit rounded-md border border-accent px-2.5 py-1 text-[11px] font-semibold text-accent">
        Analizar
      </span>
    );
  }
  if (analysis.status === "completed") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Completado
      </span>
    );
  }
  if (analysis.status === "failed") {
    return <span className="text-xs font-medium text-destructive">Fallo</span>;
  }
  return <span className="text-xs font-medium text-amber">Ejecutando</span>;
}
