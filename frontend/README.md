# Frontend (React + Vite)

The website users see. Runs on `http://localhost:5173` in dev.

## Commands

```bash
pnpm dev:frontend    # start dev server (from repo root)
pnpm --filter @workspace/frontend run build    # production build
```

## What's inside `src/`

| Folder | Purpose |
|---|---|
| `pages/` | Full-screen views (Home, Login, Signup, Dashboard, Admin, MapPage). One file per page. |
| `components/landing/` | Sections that compose the homepage (Hero, Features, FAQ, etc.). |
| `components/layout/` | Shared shells like the app header. |
| `components/ui/` | Generic reusable widgets from **shadcn/ui** (Button, Dialog, Input...). Don't put app-specific logic here. |
| `hooks/` | Custom React hooks (e.g. `useAuth`). |
| `contexts/` | Global context providers (Language, Theme). |
| `lib/` | Plain helper functions, translations, etc. |
| `index.css` | Tailwind imports + global CSS variables. |
| `main.tsx` | Entry point — mounts `<App />` to the DOM. |
| `App.tsx` | Top-level routing and providers. |

## Adding things

- New page → see `docs/HOW_TO/add-a-page.md`
- Need data from the API → import a hook from `@workspace/api-client-react`

## Key libraries

`React 19` · `Vite 7` · `TailwindCSS 4` · `Wouter` (routing) · `TanStack React Query` (data) · `shadcn/ui` + `Radix UI` (components) · `Leaflet` (maps) · `react-hook-form` + `Zod` (forms).

## Notes

- The Vite dev server proxies `/api/*` to the backend at port 8080 — see `vite.config.ts`.
- The `@/` import prefix points to `src/`. So `import Foo from "@/components/Foo"` means `src/components/Foo`.
