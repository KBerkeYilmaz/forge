# create-forge-app

> Scaffold a full-stack Next.js 16 app with tRPC, Prisma, Better Auth, and Tailwind — ready in seconds.

[![npm version](https://img.shields.io/npm/v/create-forge-app)](https://www.npmjs.com/package/create-forge-app)
[![license](https://img.shields.io/npm/l/create-forge-app)](https://github.com/KBerkeYilmaz/forge/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-KBerkeYilmaz%2Fforge-181717?logo=github)](https://github.com/KBerkeYilmaz/forge)

---

## Quick Start

```bash
npx create-forge-app my-app
```

Then:

```bash
cd my-app
cp .env.example .env
# Fill in DATABASE_URL and BETTER_AUTH_SECRET
pnpm db:push
pnpm dev
```

---

## What You Get

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, `use cache`, Server Actions) |
| API | tRPC v11 + Zod v4 — end-to-end type safety |
| ORM | Prisma v7 with adapter pattern |
| Database | PostgreSQL |
| Auth | Better Auth — open-source, self-hostable |
| Styling | Tailwind v4 + shadcn/ui |
| Animations | Motion (default) or GSAP |
| Testing | Vitest + Playwright |
| Package manager | pnpm |

---

## CLI Prompts

The CLI asks two things:

1. **Project name** — directory to scaffold into (defaults to argument passed)
2. **Animation library** — Motion (default) or GSAP

After that, it clones the template, patches `forge.config.ts` with your choices, and runs `pnpm install` automatically.

---

## After Scaffolding

```bash
cd my-app
cp .env.example .env
```

Open `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
BETTER_AUTH_SECRET="your-secret-here"
```

Then:

```bash
pnpm db:push   # Push schema to your database
pnpm dev       # Start the dev server
```

Optional — GitHub OAuth:

```env
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

---

## Requirements

- Node.js 18+
- pnpm (recommended) — `npm i -g pnpm`
- PostgreSQL database

---

## Full Docs

For the full stack breakdown, adapter pattern docs, auth patterns, and more:

**[github.com/KBerkeYilmaz/forge](https://github.com/KBerkeYilmaz/forge)**
