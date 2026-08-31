// Cliente HTTP tipado hacia el backend de PRISM. Los endpoints reales se agregan a medida que existen (bloque 1.3 en adelante).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function getHealth(): Promise<{ service: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/`);
  if (!res.ok) {
    throw new Error(`API respondio ${res.status}`);
  }
  return res.json();
}
