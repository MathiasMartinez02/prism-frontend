"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiError, getPullRequests, type PullRequest } from "@/lib/api-client";

// Pantalla principal: conecta un repo publico de GitHub y lista sus PRs abiertos (sin analisis todavia, bloque 2.5 lo agrega).
export default function DashboardPage() {
  const [fullName, setFullName] = useState("octocat/Spoon-Knife");
  const [pullRequests, setPullRequests] = useState<PullRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const prs = await getPullRequests(fullName.trim());
      setPullRequests(prs);
    } catch (err) {
      setPullRequests(null);
      setError(err instanceof ApiError ? err.message : "Error inesperado al conectar con el backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-background p-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-foreground">PRISM</h1>
          <p className="text-sm text-muted">Conecta un repositorio publico de GitHub y trae sus PRs abiertos.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="owner/repo"
            className="flex-1 rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-dim focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={loading || fullName.trim().length === 0}
            className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Conectando..." : "Conectar repositorio"}
          </button>
        </form>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive-dim/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {pullRequests && (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[2.5fr_1fr_1fr] bg-background-sidebar px-4 py-2.5 text-xs uppercase tracking-wide text-muted-dim">
              <div>Pull request</div>
              <div>Autor</div>
              <div>Creado</div>
            </div>
            {pullRequests.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted">Este repositorio no tiene PRs abiertos.</div>
            )}
            {pullRequests.map((pr, i) => (
              <Link
                key={pr.id}
                href={`/pr/${pr.id}`}
                className={`grid cursor-pointer grid-cols-[2.5fr_1fr_1fr] items-center border-t border-border px-4 py-3.5 transition-colors hover:bg-card-hover ${i % 2 === 0 ? "bg-card" : ""}`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="truncate text-sm font-medium text-foreground">{pr.title}</span>
                  <span className="font-mono text-xs text-muted-dim">#{pr.github_pr_number}</span>
                </div>
                <span className="text-xs text-muted">{pr.author ?? "—"}</span>
                <span className="font-mono text-xs text-muted-dim">
                  {new Date(pr.created_at).toLocaleDateString("es-AR")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
