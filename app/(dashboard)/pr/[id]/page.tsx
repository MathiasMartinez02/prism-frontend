// Placeholder del detalle de analisis de un PR. Se implementa en el bloque 2.5.
export default async function PullRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Analisis del PR {id}</h1>
      <p className="text-sm text-gray-500">Findings y score (pendiente de conectar al backend).</p>
    </main>
  );
}
