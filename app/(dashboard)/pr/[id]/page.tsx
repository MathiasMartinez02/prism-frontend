// Placeholder del detalle de analisis de un PR, con los tokens del design canvas. Se implementa en el bloque 2.5.
export default async function PullRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-full bg-background p-8">
      <h1 className="font-mono text-2xl font-semibold text-foreground">Analisis del PR {id}</h1>
      <p className="text-sm text-muted">Findings y score (pendiente de conectar al backend).</p>
    </main>
  );
}
