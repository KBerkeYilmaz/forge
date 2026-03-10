# Design: create-forge-app CLI

**Date:** 2026-03-10
**Status:** Approved

---

## What We're Building

A `npx create-forge-app my-app` CLI that scaffolds a complete Forge project from the `KBerkeYilmaz/forge` GitHub template. One interactive prompt (animation library), then fully automated setup.

---

## Architecture

Single repo (Option C), pnpm workspace:

```
forge/                        ← GitHub: KBerkeYilmaz/forge
├── packages/
│   └── cli/                  ← npm: create-forge-app
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts      ← CLI entrypoint
├── pnpm-workspace.yaml       ← NEW
├── package.json              ← add "agents-md" script
└── ... (existing template files)
```

---

## CLI Flow

```
npx create-forge-app my-app

◆  What is your project name? › my-app          (skip if passed as arg)
◆  Which animation library?
   ● Motion (default — framer-motion rebranded)
   ○ GSAP

◇  Downloading template...       ← tiged KBerkeYilmaz/forge
◇  Configuring forge.config.ts...← patch animations.default field
◇  Installing dependencies...    ← pnpm install
◇  Generating AGENTS.md...       ← npx @next/codemod@canary agents-md ...
◇  Done in Xs.

Next steps:
  cd my-app
  cp .env.example .env
  # Fill in DATABASE_URL and BETTER_AUTH_SECRET
  pnpm db:push
  pnpm dev
```

---

## CLI Dependencies

| Package | Purpose |
|---------|---------|
| `@clack/prompts` | Terminal UI (spinner, select, text input) |
| `tiged` | degit fork — downloads GitHub repo without git history |
| `execa` | Run shell commands (pnpm install, agents-md) |
| `fs-extra` | File ops (remove packages/ from scaffolded output) |

TypeScript source, compiled to JS via `tsc`, published to npm.

---

## Template Copy Strategy

1. `tiged KBerkeYilmaz/forge` → target directory
2. Remove `packages/` from scaffolded output (CLI shouldn't ship to users)
3. Remove `docs/` from scaffolded output
4. Patch `forge.config.ts`: set `animations.default` to `"motion"` or `"gsap"`
5. Run `pnpm install` in target directory
6. Run `npx @next/codemod@canary agents-md --version 16.1.6 --output AGENTS.md`

---

## `pnpm agents-md` Script

Add to root `package.json`:
```json
"agents-md": "npx @next/codemod@canary agents-md --version 16.1.6 --output AGENTS.md"
```

Anyone who clones the template can re-run this in one command when upgrading Next.js.

---

## GitHub Setup

- Repo: `https://github.com/KBerkeYilmaz/forge`
- Public repo, push current `main` branch
- npm package name: `create-forge-app`

---

## Out of Scope (V2)

- Database adapter options (no-DB, SQLite, Turso)
- Background jobs adapter
- Storage adapter
- GitHub Actions for auto-publish on tag
