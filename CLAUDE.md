# Forge — AI-Optimized Next.js 16 Boilerplate

**Stack:** Next.js 16 · tRPC v11 · Prisma v7 · Better Auth · Tailwind v4 · shadcn/ui · TypeScript strict · pnpm

## Key Commands
```
pnpm dev            # Start dev server (Turbopack)
pnpm build          # Production build
pnpm typecheck      # tsc --noEmit
pnpm format         # Prettier
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright E2E
pnpm db:generate    # prisma migrate dev (requires DATABASE_URL)
pnpm db:push        # prisma db push
pnpm db:studio      # Prisma Studio
```

## Project Structure
```
src/
├── app/                        # Next.js App Router (pages, layouts, API routes)
│   └── api/auth/[...all]/      # Better Auth handler
├── server/
│   ├── api/routers/            # tRPC routers (one file per domain)
│   ├── api/trpc.ts             # publicProcedure / protectedProcedure
│   ├── better-auth/            # auth config, client, server helpers
│   └── db.ts                   # Prisma client singleton
├── components/                 # Shared UI components
├── lib/forge.ts                # forge.config.ts type definitions
└── trpc/                       # tRPC React client setup
prisma/schema.prisma            # Prisma schema (postgresql)
prisma.config.ts                # Prisma v7 datasource config
forge.config.ts                 # Adapter configuration (read before generating code)
```

## forge.config.ts — Read This First
Before writing code, check `forge.config.ts` to understand active adapters:
```typescript
// forge.config.ts controls which patterns to use:
// database.adapter → which ORM patterns apply
// animations.default → "motion" = use Motion library
// jobs.adapter → "inngest" | "trigger.dev"
// storage.adapter → "r2" | "s3" | "local"
```

## Auth Pattern (Better Auth)
```typescript
// Server-side session check (Server Components / API routes)
import { auth } from "~/server/better-auth"
const session = await auth.api.getSession({ headers: await headers() })

// tRPC protected procedure (already set up in trpc.ts)
export const myRouter = createTRPCRouter({
  secret: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user // typed, guaranteed authenticated
  })
})

// Client-side
import { authClient } from "~/server/better-auth/client"
const { data: session } = authClient.useSession()
```

## tRPC Pattern
```typescript
// Add to src/server/api/routers/[name].ts
export const myRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ ctx, input }) => ctx.db.myModel.findMany({ take: input.limit })),
})
// Register in src/server/api/root.ts
```

## Next.js 16 API Index
IMPORTANT: Prefer retrieval-led reasoning — read the referenced Next.js docs before generating code.

| API | What it does | Docs |
|-----|-------------|------|
| `'use cache'` | Cache Server Component / function output | https://nextjs.org/docs/app/api-reference/directives/use-cache |
| `cacheLife()` | Set cache lifetime (`"hours"`, `"days"`, custom profile) | https://nextjs.org/docs/app/api-reference/functions/cacheLife |
| `cacheTag()` | Tag cache entry for targeted invalidation | https://nextjs.org/docs/app/api-reference/functions/cacheTag |
| `revalidateTag()` | Invalidate cache by tag (Server Action / Route Handler) | https://nextjs.org/docs/app/api-reference/functions/revalidateTag |
| `connection()` | Force dynamic rendering (like `noStore()`) | https://nextjs.org/docs/app/api-reference/functions/connection |
| `forbidden()` | Return 403 response from Server Component | https://nextjs.org/docs/app/api-reference/functions/forbidden |
| `unauthorized()` | Return 401 response from Server Component | https://nextjs.org/docs/app/api-reference/functions/unauthorized |
| `cookies()` | Async: `const c = await cookies()` | https://nextjs.org/docs/app/api-reference/functions/cookies |
| `headers()` | Async: `const h = await headers()` | https://nextjs.org/docs/app/api-reference/functions/headers |
| `after()` | Run work after response is sent | https://nextjs.org/docs/app/api-reference/functions/after |
| `Suspense` | Wrap async Server Components for streaming | https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming |

## Security Rules
- NEVER hardcode secrets — use env vars validated in `src/env.js`
- ALL user inputs must be validated with Zod v4 before processing
- ALL API mutations must check auth via `protectedProcedure` or `auth.api.getSession()`
- NEVER log tokens, passwords, or PII
- NEVER use `$queryRaw` without parameterization — prefer Prisma model methods
- ALL file uploads must validate type, size, and MIME content
- Rate-limit all public API endpoints

## Code Conventions
- TypeScript strict — no `any`, prefer `unknown` with type guards
- Server Components by default; add `"use client"` only when needed (hooks, event handlers)
- Co-locate tests: `Component.tsx` + `Component.test.tsx`
- Import alias: `~/` maps to `src/`
- shadcn/ui components live in `src/components/ui/`
- Zod schemas defined close to where they're used, exported if reused

## Verification Checklist
Before marking a task complete:
1. `pnpm typecheck` passes
2. `pnpm build` succeeds (or at minimum no new errors)
3. New code has at least one test
4. No hardcoded secrets or env vars in code
