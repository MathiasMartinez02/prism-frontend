"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  analyzePullRequest,
  ApiError,
  getAnalyses,
  getPullRequest,
  type Analysis,
  type Finding,
  type FindingSeverity,
  type PullRequest,
} from "@/lib/api-client";

// Umbrales de score y su color, tal como quedaron documentados en design-system/prism/MASTER.md.
function scoreColor(score: number): string {
  if (score >= 80) return "var(--accent)";
  if (score >= 50) return "var(--amber)";
  return "var(--destructive)";
}

const SEVERITY_ORDER: FindingSeverity[] = ["high", "medium", "low"];
const SEVERITY_LABEL: Record<FindingSeverity, string> = { high: "Alta", medium: "Media", low: "Baja" };
const SEVERITY_COLOR: Record<FindingSeverity, string> = {
  high: "text-destructive border-destructive",
  medium: "text-amber border-amber",
  low: "text-muted border-border",
};

// Anillo de score (SVG), mismo patron visual que el diseño elegido para el dashboard.
function ScoreRing({ score }: { score: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-xl font-semibold text-foreground">{score}</span>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[finding.severity]}`}>
          {SEVERITY_LABEL[finding.severity]}
        </span>
        <span className="font-mono text-xs uppercase tracking-wide text-muted-dim">{finding.category}</span>
      </div>
      <div className="font-mono text-xs text-muted-dim">
        {finding.file_path}
        {finding.line_number ? `:${finding.line_number}` : ""}
      </div>
      <p className="text-sm text-foreground">{finding.description}</p>
      {finding.recommendation && (
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">Recomendacion: </span>
          {finding.recommendation}
        </p>
      )}
    </div>
  );
}

// Pantalla de detalle: dispara el analisis de AI sobre el PR y muestra findings agrupados por severidad + score.
export default function PullRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loadingPr, setLoadingPr] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    getPullRequest(id)
      .then(setPullRequest)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el PR."))
      .finally(() => setLoadingPr(false));

    // Si ya se corrio un analisis antes, mostramos el mas reciente sin obligar a re-analizar.
    getAnalyses(id)
      .then((analyses) => {
        const lastCompleted = analyses.find((a) => a.status === "completed");
        if (lastCompleted) setAnalysis(lastCompleted);
      })
      .catch(() => {
        // Sin historial todavia (o el PR es nuevo) no es un error que valga la pena mostrar.
      });
  }, [id]);

  async function handleAnalyze() {
    if (!id) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzePullRequest(id);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error inesperado al analizar el PR.");
    } finally {
      setAnalyzing(false);
    }
  }

  const findingsBySeverity = analysis
    ? SEVERITY_ORDER.map((severity) => ({
        severity,
        findings: analysis.findings.filter((f) => f.severity === severity),
      })).filter((group) => group.findings.length > 0)
    : [];

  return (
    <main className="min-h-full bg-background p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link href="/" className="text-xs text-muted hover:text-accent">
          &larr; Volver al dashboard
        </Link>

        {loadingPr && <p className="text-sm text-muted">Cargando PR...</p>}

        {pullRequest && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{pullRequest.title}</h1>
              <p className="font-mono text-xs text-muted-dim">
                #{pullRequest.github_pr_number} {pullRequest.author ? `· ${pullRequest.author}` : ""}
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? "Analizando..." : "Analizar con AI"}
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive bg-destructive-dim/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {analyzing && (
          <p className="text-sm text-muted">
            Corriendo el pipeline de analisis (parseo del diff + AIProvider por hunk). Puede tardar unos segundos...
          </p>
        )}

        {analysis && analysis.status === "completed" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
              <ScoreRing score={analysis.overall_score ?? 0} />
              <div>
                <p className="text-sm font-semibold text-foreground">Score general</p>
                <p className="text-xs text-muted">
                  {analysis.findings.length === 0
                    ? "Sin findings detectados."
                    : `${analysis.findings.length} finding${analysis.findings.length === 1 ? "" : "s"} detectado${analysis.findings.length === 1 ? "" : "s"}.`}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-dim">
                  provider: {analysis.ai_provider ?? "—"}
                </p>
              </div>
            </div>

            {findingsBySeverity.map((group) => (
              <div key={group.severity} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Severidad {SEVERITY_LABEL[group.severity].toLowerCase()} ({group.findings.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {group.findings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
