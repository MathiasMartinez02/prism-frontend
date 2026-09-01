# PRISM — Frontend

Dashboard de [PRISM](https://github.com/MathiasMartinez02/prism-backend) (AI Code Reviewer): conectar un repositorio de GitHub, ver sus Pull Requests, y disparar/revisar el análisis de AI sobre cada uno. El backend (FastAPI, la lógica del producto) vive en el repo separado linkeado arriba — este repo es solo la interfaz.

## Problema y solución

Ver el detalle completo en el [README del backend](https://github.com/MathiasMartinez02/prism-backend#problema). En resumen: este frontend es la superficie donde un desarrollador conecta un repo, ve la lista de PRs abiertos, y consulta findings + score de un análisis sin tocar la API directamente.

## Arquitectura

```text
Next.js 16 (App Router)
  │
  ├── app/(dashboard)/page.tsx       lista de PRs (conecta repo, sincroniza)
  ├── app/(dashboard)/pr/[id]/       detalle: score + findings por severidad
  ├── lib/api-client.ts              cliente tipado hacia el backend
  └── design-system/prism/           tokens de color/tipografia/spacing
              │
              ▼
      Backend FastAPI (localhost:8000)
```

Client components con `fetch` directo al backend (CORS habilitado del lado del backend) — sin capa de estado global todavía, el scope actual no la necesita.

## Features

- Conectar un repo público de GitHub por `owner/repo` y ver sus PRs abiertos.
- Detalle de PR: dispara el análisis (`POST /pull-requests/{id}/analyze`) y muestra score (anillo de color por umbral) + findings agrupados por severidad.
- Carga el último análisis guardado al entrar a un PR — no obliga a re-analizar solo para ver un resultado anterior.
- Manejo de errores visible (repo inexistente, rate limit de GitHub, etc.) con el mensaje real del backend, no un genérico.

## Tech Stack

```text
Next.js 16 (App Router, Turbopack)
TypeScript
Tailwind CSS v4
next/font (IBM Plex Sans + JetBrains Mono, self-hosted)
```

## Getting Started

Necesita el backend corriendo (ver su README) en `http://localhost:8000`, o la variable `NEXT_PUBLIC_API_BASE_URL` apuntando a donde esté.

```bash
npm install
cp .env.example .env
npm run dev
```

## Docker

```bash
docker build -t prism-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 prism-frontend
```

O usar el `docker-compose.yml` de la carpeta raíz del proyecto (junto al repo del backend), que levanta ambos servicios con un solo comando.

## Testing

Sin suite de tests de UI todavía (Playwright/Vitest quedan para cuando el frontend crezca más allá de dos pantallas) — la lógica de negocio real vive en el backend, que sí tiene cobertura. Verificación manual hecha con `npm run build` (compila sin errores de TypeScript) y `npm run lint` en cada cambio.

## Design system

Los tokens (paleta, tipografía, spacing, component specs) están documentados en [`design-system/prism/MASTER.md`](design-system/prism/MASTER.md) — cualquier pantalla nueva debería seguir esas reglas en vez de inventar valores nuevos.

## Demo

Ver capturas y ejemplo de salida en el [README del backend](https://github.com/MathiasMartinez02/prism-backend#demo).

## License

MIT — ver [LICENSE](LICENSE).
