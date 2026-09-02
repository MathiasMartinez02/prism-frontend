import Link from "next/link";

// Sidebar de navegacion: solo lista "Dashboard" para no linkear secciones que no existen.
export function Sidebar() {
  return (
    <div className="flex w-[220px] flex-shrink-0 flex-col gap-8 border-r border-border bg-background-sidebar px-4 py-6">
      <Link href="/" className="flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L21 8V16L12 22L3 16V8L12 2Z" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 2V22M3 8L21 16M21 8L3 16" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
        </svg>
        <span className="font-mono text-base font-semibold tracking-wide text-foreground">PRISM</span>
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5 rounded-md bg-card px-2.5 py-2 text-sm font-medium text-foreground">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Dashboard
        </div>
      </div>

      <a
        href="https://github.com/MathiasMartinez02/prism-backend"
        target="_blank"
        rel="noreferrer"
        className="mt-auto flex items-center gap-2 border-t border-border pt-4 text-xs text-muted hover:text-accent"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.42.36.78 1.08.78 2.17v3.22c0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        Ver en GitHub
      </a>
    </div>
  );
}
