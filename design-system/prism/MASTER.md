# Design System Master File — PRISM

> **LOGICA:** al construir una pagina especifica, revisar primero
> `design-system/prism/pages/[page-name].md`. Si existe, sus reglas
> **sobrescriben** este Master. Si no, seguir lo de aca.

Origen: design canvas "PRISM Dashboard" (Artifact), direccion **A — Terminal Dark**,
elegida sobre otras dos alternativas (Clean SaaS Light, Bento Editorial — descartadas,
quedaron guardadas en el canvas por si se quiere retomar algo de ahi).
Link del canvas: https://claude.ai/code/artifact/d59d46b9-e3dc-4cb1-bc40-6439047b16ce

**Categoria:** Developer Tool / dashboard denso
**Dials:** Variance 6/10 (Balanced/Modern) | Density 8/10 (Dense/Dashboard)

---

## Global Rules

### Paleta de color

Ya cargada como CSS variables en `app/globals.css`. Tema oscuro fijo — PRISM
no sigue el esquema claro/oscuro del sistema, es developer tool con identidad propia.

| Rol | Hex | CSS Variable | Uso |
|---|---|---|---|
| Background | `#0F172A` | `--background` | Fondo principal |
| Background sidebar | `#0B1220` | `--background-sidebar` | Sidebar de navegacion |
| Card | `#1B2336` | `--card` | Cards, filas de tabla alternadas |
| Card hover | `#202A42` | `--card-hover` | Hover de filas/cards |
| Border | `#2A3450` | `--border` | Bordes de cards, separadores |
| Foreground | `#F8FAFC` | `--foreground` | Texto principal |
| Muted | `#94A3B8` | `--muted` | Texto secundario |
| Muted dim | `#64748B` | `--muted-dim` | Texto terciario (ids, timestamps) |
| Accent (verde) | `#22C55E` | `--accent` | Score alto, estado "completado", CTA principal |
| Accent dim | `#14532D` | `--accent-dim` | Selection, fondos sutiles de accent |
| Amber | `#F59E0B` | `--amber` | Score medio, estado "ejecutando" |
| Amber dim | `#78350F` | `--amber-dim` | Fondos sutiles de amber |
| Destructive | `#EF4444` | `--destructive` | Score bajo, findings de severidad alta/security |
| Destructive dim | `#7F1D1D` | `--destructive-dim` | Fondos sutiles de destructive |

**Semantica de color por score:** >=80 verde (`--accent`), 50-79 amber (`--amber`), <50 destructive (`--destructive`). Misma logica para el color del anillo/barra de score y de los badges de severidad.

### Tipografia

- **Mono (headings, scores, ids, nombres de repo/PR):** JetBrains Mono — pesos 400/500/600/700
- **Sans (UI, labels, texto de findings):** IBM Plex Sans — pesos 400/500/600/700
- Ya configuradas en `app/layout.tsx` via `next/font/google` como `--font-mono` y `--font-sans`, expuestas en Tailwind (`font-mono`, `font-sans`).
- Google Fonts (referencia, no hace falta linkearlas aparte — Next las sirve self-hosted):
  `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap`

### Spacing (density 8/10 — dashboard denso)

| Token | Valor | Uso |
|---|---|---|
| `--space-xs` | 4px | Gaps entre icono y texto |
| `--space-sm` | 8px | Padding interno chico, gaps de badges |
| `--space-md` | 12px | Padding de filas de tabla |
| `--space-lg` | 16px | Padding de cards, gaps de grid |
| `--space-xl` | 24px | Padding de secciones |
| `--space-2xl` | 32px | Padding del layout (topbar, sidebar) |

### Bordes y radios

- Radio estandar: `6px` (chips, botones, filas de tabla)
- Radio de cards: `8px`
- Grosor de borde: `1px`, color `--border`

---

## Layout de referencia (pantalla "Dashboard" — lista de PRs)

Definido en el artboard `Main.dc.html` del canvas. Estructura:

```
┌──────────┬──────────────────────────────────────────┐
│          │  Topbar: selector de repo + buscar + CTA  │
│ Sidebar  ├──────────────────────────────────────────┤
│ 220px    │  4 stat cards (PRs analizados, score      │
│ fixed    │  promedio, findings criticos, provider)   │
│          ├──────────────────────────────────────────┤
│          │  Tabla densa de PRs:                      │
│          │  titulo+id | autor | score (anillo) |     │
│          │  findings (chips por categoria) | estado  │
└──────────┴──────────────────────────────────────────┘
```

- Sidebar: logo (icono prisma + wordmark mono), nav items (Dashboard/Repositorios/Configuracion), usuario abajo.
- Score se muestra como anillo SVG (`stroke-dasharray`/`stroke-dashoffset`) coloreado segun semantica de score, con el numero en `font-mono` al lado.
- Findings se muestran como texto chico por categoria (`1 bug`, `2 perf`, `3 quality`), coloreando solo la categoria mas severa presente.
- Estados de una fila: `Completado` (check verde), `Ejecutando` (spinner amber), `Sin analizar` (boton outline "Analizar" en accent).

## Component Specs

### Boton primario (CTA)

```css
.btn-primary {
  background: var(--accent);
  color: var(--background);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 200ms ease;
}
.btn-primary:hover { opacity: 0.9; }
```

### Boton secundario / outline (ej. "Analizar")

```css
.btn-outline {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
```

### Card / stat tile

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
```

### Fila de tabla

```css
.table-row {
  display: grid;
  grid-template-columns: 2.2fr 1fr 0.9fr 1.4fr 0.8fr;
  align-items: center;
  padding: 14px 16px;
  border-top: 1px solid var(--border);
  transition: background 150ms ease;
}
.table-row:nth-child(even) { background: var(--card); }
.table-row:hover { background: var(--card-hover); cursor: pointer; }
```

### Badge de severidad/categoria

```css
.badge {
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
/* color de fondo/texto segun categoria: destructive-dim/destructive para bug o security,
   transparente/muted para performance y quality */
```

---

## Anti-patrones (no usar en PRISM)

- Emojis como iconos — siempre SVG inline, stroke-based, grid 16/20/24px.
- Gradientes decorativos sin proposito — la identidad de PRISM es plana y tecnica, no "AI slop".
- Cards con borde-acento a la izquierda — no forma parte de esta identidad.
- Texto below 12px en body copy.
- Confiar solo en el color para transmitir severidad — siempre acompañar con texto (`1 bug`, `Completado`, etc).

## Pre-Delivery Checklist

- [ ] Sin emojis como iconos (SVG propio, no libreria externa)
- [ ] `cursor-pointer` en todo elemento clickeable (filas de tabla, botones, tabs)
- [ ] Hover states con transicion 150-300ms
- [ ] Contraste de texto >= 4.5:1 sobre `--background` y `--card`
- [ ] Focus visible para navegacion por teclado
- [ ] `prefers-reduced-motion` respetado en cualquier animacion (ej. spinner de "ejecutando")
- [ ] Responsive: al menos verificar 1024px y 1440px (dashboard, no prioriza mobile)
- [ ] Semantica de score/severidad consistente en toda la app (ver "Global Rules" arriba)
