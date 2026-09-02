// Umbrales de score y su color, documentados en design-system/prism/MASTER.md.
export function scoreColor(score: number): string {
  if (score >= 80) return "var(--accent)";
  if (score >= 50) return "var(--amber)";
  return "var(--destructive)";
}
