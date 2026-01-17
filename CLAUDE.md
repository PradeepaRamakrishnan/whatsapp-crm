# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Samatva CRM** is a Next.js 16 customer relationship management system for managing campaigns, leads, and file records. The application uses a microservices architecture with separate backend services for authentication, users, files, and campaigns.

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.1 (App Router) with React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui components |
| **Linting** | Biome 2.3.11 |
| **State Management** | TanStack Query v5 with persistence |
| **Forms** | TanStack Form with Zod validation |
| **Tables** | TanStack Table |
| **UI Components** | Radix UI primitives |
| **HTTP Client** | Axios with credentials support |
| **Date Handling** | Day.js |

## Commands

### Development
```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
```

### Code Quality
```bash
pnpm lint         # Check code with Biome
pnpm lint:fix     # Auto-fix issues with Biome
```

### Git Hooks
Pre-commit hook runs `lint-staged` which automatically formats and checks staged files with Biome.

## Architecture

### Route Groups

The application uses Next.js App Router with the following route group structure:

- `(auth)` - Authentication pages (login) - minimal layout
- `(dashboard)` - Main application pages with sidebar navigation
- `(leads)` - Public-facing lead capture forms

### Feature-Based Organization

Code is organized by feature modules in `src/features/`:

| Feature | Purpose |
|---------|---------|
| **auth** | Authentication, login, password management |
| **campaigns** | Campaign management and templates |
| **dashboard** | Sidebar navigation and dashboard layout |
| **files** | File uploads, records management, pending files |
| **leads** | Lead tracking and interested contacts |
| **settings** | Campaign templates, NBFC, financial institutions |

Each feature typically contains:
- `components/` - React components specific to the feature
- `services/` - API calls and data fetching (server actions for files)
- `types/` - TypeScript type definitions
- `lib/` - Utility functions and helpers

### API Integration

The app connects to **4 microservices** defined in `.env`:

```
NEXT_PUBLIC_AUTH_API_URL       # Authentication service
NEXT_PUBLIC_USERS_API_URL      # User management service
NEXT_PUBLIC_FILES_API_URL      # File upload/management service
NEXT_PUBLIC_CAMPAIGNS_API_URL  # Campaign management service
```

**Authentication Flow:**
- Middleware (`src/proxy.ts`) intercepts all routes
- Validates session via `/me` endpoint on users service
- Uses cookie-based authentication (`withCredentials: true`)
- Public routes: `/interested`, `/interested-form`
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` to `/dashboard`

### State Management

**TanStack Query** handles all server state with:
- Persistent cache using localStorage
- Default stale time: 60 seconds
- DevTools enabled in development
- Client configured in `src/app/providers.tsx`

**Auth Context** (`src/context/auth-context.tsx`) manages user authentication state globally.

### Component Library

Uses **shadcn/ui** (New York style) with:
- Components in `src/components/ui/` (ignored by Biome linting)
- Custom shared components in `src/components/shared/`
- Theme provider with light/dark mode support
- Path alias: `@/` maps to `src/`

### Styling Guidelines

From `biome.json`:
- 2-space indentation
- 100 character line width
- Single quotes for JS/TS, double quotes for JSX
- Semicolons always required
- Trailing commas required
- Arrow functions enforced over function expressions
- Naming conventions: camelCase, PascalCase, CONSTANT_CASE, snake_case allowed

### Key Linting Rules

- **No console.log** (error) - only allow `console.error`, `console.warn`, `console.info`, `console.assert`
- **No array index keys** in React (error)
- **No unused imports/variables** (error)
- **Exhaustive dependencies** in hooks (error)
- Auto-organize imports on save

### File Services Pattern

Files feature uses **Next.js Server Actions** (marked with `'use server'`) instead of client-side API calls. This pattern passes cookies from server context.

Example from `src/features/files/services/index.ts`:
```typescript
'use server';
import { cookies } from 'next/headers';

export async function getAllFiles(page: number, limit: number) {
  const cookieStore = await cookies();
  const response = await axiosClient({
    headers: { Cookie: cookieStore.toString() }
  });
  return response.data;
}
```

### Middleware

`src/proxy.ts` (should be `middleware.ts` per Next.js conventions) handles:
- Authentication validation on every request
- Public route exceptions
- Auto-redirect logic for authenticated/unauthenticated users
- TODO comment indicates future role-based access control planned

## Deployment

GitLab CI/CD pipeline (`.gitlab-ci.yml`):
1. **Build stage**: Copies production env, installs deps with pnpm, builds app
2. **Deploy stage**: Copies artifacts to `/home/gitlab-runner/frontend/samatva-crm`, manages with PM2

**Important**: Uses `.env.production` file copied from server during build (not in repo).
