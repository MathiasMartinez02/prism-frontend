import { scoreColor } from "@/lib/score";

// Anillo de score (SVG), reutilizado en la lista de PRs y en el detalle de analisis.
export function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size / 2) * 0.75;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);
  const strokeWidth = size >= 60 ? 6 : 3;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute font-mono font-semibold text-foreground"
        style={{ fontSize: size >= 60 ? 20 : 11 }}
      >
        {score}
      </span>
    </div>
  );
}
