# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Samatva CRM** is a Next.js 16 customer relationship management system for managing campaigns, leads, recipients, and messaging channels (WhatsApp, Instagram, Email). The application uses a microservices architecture.

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.1 (App Router) with React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui components |
| **Linting** | Biome 2.3.11 |
| **Compiler** | React Compiler (babel-plugin-react-compiler) |
| **Server State** | TanStack Query v5 with persistence |
| **Client State** | Zustand (e.g., `useFileFilterStore`) |
| **Forms** | TanStack Form with Zod validation |
| **Tables** | TanStack Table |
| **UI Components** | Radix UI primitives |
| **HTTP Client** | Axios with credentials support |
| **Date Handling** | Day.js |

## Commands

**Package Manager**: `pnpm`

```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Check code with Biome
pnpm lint:fix     # Auto-fix issues with Biome
pnpm type-check   # Check TypeScript types
pnpm test                    # Run all tests once
pnpm test:watch              # Watch mode
pnpm test:ui                 # Visual UI for tests
pnpm test:coverage           # Generate coverage report
pnpm test -- path/to/file.test.ts  # Run a single test file
```

## Environment Setup

The simplest config is a single base URL that auto-derives all service paths:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

This resolves to `{BASE}/auth`, `{BASE}/users`, `{BASE}/files`, etc. via `src/lib/api-urls.ts`.

Individual services can be overridden:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001/auth
NEXT_PUBLIC_USERS_API_URL=http://localhost:3002/users
NEXT_PUBLIC_FILES_API_URL=http://localhost:3003/files
NEXT_PUBLIC_CAMPAIGNS_API_URL=http://localhost:3004/campaigns
NEXT_PUBLIC_SETTINGS_API_URL=http://localhost:3005/settings
NEXT_PUBLIC_LEADS_API_URL=http://localhost:3006/leads
NEXT_PUBLIC_WHATSAPP_API_URL=http://localhost:3007/business-whatsapp
NEXT_PUBLIC_INSTAGRAM_API_URL=http://localhost:3008/instagram
NEXT_PUBLIC_EMAIL_API_URL=http://localhost:3009/email-business
```

All `NEXT_PUBLIC_` variables are safe to expose to the browser. For production, create `.env.production` (not in repo).

**Optional:** `NEXT_PUBLIC_APP_URL` — used for metadata base URL.

## Architecture

### Route Groups

- `(auth)` — Authentication pages (login)
- `(dashboard)` — Main app pages with sidebar navigation; includes recipients, campaigns, leads, business-leads, settings, email, instagram, phone, overview
- `(leads)` — Public-facing lead capture forms
- `(whatsapp)` — WhatsApp connection and template pages

### Feature-Based Organization

Code is organized in `src/features/`:

| Feature | Purpose |
|---------|---------|
| **auth** | Login, token management, password change |
| **campaigns** | Campaign CRUD and templates |
| **dashboard** | Sidebar navigation and overview |
| **files** | File/recipient list uploads and management |
| **leads** | Lead tracking and follow-up |
| **business-leads** | External business lead search |
| **settings** | Campaign templates, NBFC, financial institutions |
| **whatsapp** | WhatsApp channel integration |
| **instagram** | Instagram account and inbox integration |
| **email** | Email account and inbox integration |
| **phone** | Phone channel service |

Each feature contains: `components/`, `services/`, `types/`, `lib/`.

### API Integration

All service URLs are resolved through `src/lib/api-urls.ts` which exports `API_URLS`. It derives a base URL from `NEXT_PUBLIC_API_BASE_URL` (or falls back to stripping the path from `NEXT_PUBLIC_AUTH_API_URL`), then constructs each service URL as `{BASE}/{service}`.

**Auth flow:** Authentication is cookie-based. All axios clients use `withCredentials: true` so the browser automatically sends the session cookie. Server Actions read cookies via `cookies()` from `next/headers` and forward them as a `Cookie` header to the backend. `src/proxy.ts` is the Next.js middleware file but currently passes all requests through without auth validation.

### Files Feature: Server vs. Client Services

The files feature has **two separate service files**:

- `src/features/files/services/index.ts` — **Server Actions** (`'use server'`). Used in Server Components. Reads cookies via `next/headers` and passes them as `Cookie` header to the backend.
- `src/features/files/services/client.ts` — **Client-side service**. Used in React Query hooks and Client Components. Uses `getAuthHeaders()` (localStorage JWT).

Choose the right one based on where the call is made. Never import the server-action file from a Client Component.

### State Management

- **TanStack Query** — all server state; persistent cache via localStorage; stale time 60s; configured in `src/app/providers.tsx`
- **Auth Context** (`src/context/auth-context.tsx`) — global current user state
- **Zustand** — lightweight UI state (e.g., `useFileFilterStore` for recipient list filters)

### Sheet/Modal Pattern

When displaying detail views from table row clicks, use the shadcn `Sheet` component:

```typescript
const [selectedRecord, setSelectedRecord] = React.useState<RecordType | null>(null);

<TableRow className="cursor-pointer" onClick={() => setSelectedRecord(row.original)}>

<Sheet open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
  <SheetContent className="flex flex-col sm:max-w-md">
    <SheetHeader>...</SheetHeader>
    {selectedRecord && (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
        {/* Content */}
      </div>
    )}
  </SheetContent>
</Sheet>
```

### Key Linting Rules

- **No `console.log`** (error) — only `console.error`, `console.warn`, `console.info`, `console.assert` allowed
- **No array index keys** in React (error)
- Arrow functions enforced over function expressions
- 2-space indent, 100-char line width, single quotes in TS, double quotes in JSX, semicolons always, trailing commas required
- Biome auto-organizes imports on save

### Component Library

shadcn/ui (New York style) with components in `src/components/ui/` (excluded from Biome linting). Shared components in `src/components/shared/`. Path alias: `@/` → `src/`.

## Testing

Uses **Vitest** + **Testing Library** + **jsdom**. Setup in `vitest.config.mts` and `vitest.setup.ts`.

```typescript
// Mocking axios
vi.mock('axios', () => ({
  default: Object.assign(vi.fn(), { create: vi.fn(() => vi.fn()) }),
}));

// Async test pattern
it('should fetch user data', async () => {
  vi.mocked(axios).mockResolvedValueOnce({ data: mockUser });
  const result = await getCurrentUser();
  expect(result).toEqual(mockUser);
});
```

Current coverage: `src/features/auth/lib/validation.ts` and `src/features/auth/services/index.ts`. Tests are co-located with source files (`.test.ts` next to the file).

## Known Tech Debt (Fix These)

- [ ] **`src/proxy.ts` is a no-op** — middleware just calls `NextResponse.next()`, no auth validation. Should enforce authentication and redirect unauthenticated users. Also rename to `src/middleware.ts` per Next.js conventions.

- [ ] **localStorage token storage must be removed** — `src/features/auth/services/index.ts` saves access/refresh tokens to localStorage on login. `src/lib/auth-headers.ts` reads them back. Auth should be purely cookie-based (`withCredentials: true`). Removing requires fixing the two issues below first.

- [ ] **`src/features/whatsapp/services/index.ts` requires localStorage token** — uses raw `fetch` and throws `'App auth token missing'` if `localStorage.getItem('crm_access_token')` is empty. Must be migrated to cookie auth (`credentials: 'include'` only, remove the guard) or switched to axios.

- [ ] **`src/features/email/services/index.ts` requires localStorage token** — same problem as whatsapp: raw `fetch`, reads token from localStorage, sends `Authorization: Bearer <token>`. Needs migration to cookie auth.

- [ ] **`ACCESS_TOKEN_KEY = 'crm_access_token'` duplicated in 4 files** — defined independently in `auth/services/index.ts`, `auth-headers.ts`, `whatsapp/services/index.ts`, `email/services/index.ts`. Should be one shared constant.

- [ ] **`getAuthHeaders()` spread across 50+ call sites** — imported and spread in campaigns, settings, leads, business-leads, dashboard, and files/client services. Since those axios clients already use `withCredentials: true`, this is redundant. Once localStorage is removed, all these spreads become no-ops and the function + all imports should be deleted.

- [ ] **`deleteFile` uses `PATCH`, not `DELETE`** — `src/features/files/services/index.ts` `deleteFile()` sends `PATCH /{id}` with `{ active: false }`. Naming doesn't match HTTP method; either rename the function or use the correct verb.

- [ ] **`extractLoginPayload` handles too many response shapes** — the function in `auth/services/index.ts` has deeply nested fallbacks to cope with many different backend response structures. The backend response shape should be standardised so this complexity can be removed.

- [ ] **Inconsistent HTTP client** — most features use axios, but `whatsapp` and `email` use raw `fetch`. Everything should use axios for consistent error handling, interceptors, and `withCredentials`.

- [ ] **`src/features/files/services/client.ts` comment is stale** — says "uses localStorage token via getAuthHeaders()" which will be wrong once localStorage is removed. Update the comment.

## Deployment

GitLab CI/CD (`.gitlab-ci.yml`): copies `.env.production` from server, installs with pnpm, builds, deploys to `/home/gitlab-runner/frontend/samatva-crm`, managed with PM2.
