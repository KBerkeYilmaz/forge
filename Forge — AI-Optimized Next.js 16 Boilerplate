# Forge — AI-Optimized Next.js 16 Boilerplate

## Handoff Document for Claude Code

> This document captures planning and research from a Claude UI conversation.
> Feed this to Claude Code at the start of your session to pick up where we left off.

---

## What is Forge?

A T3-inspired boilerplate/starter kit for Next.js 16 with:
- Claude Code integration baked in out of the box
- Adapter-based architecture via `forge.config.ts`
- Modern CI/CD, Docker support planned

Think: create-t3-app but with full AI dev tooling pre-configured.

---

## Stack Decisions (from previous conversation)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 | App Router, Server Actions, `use cache`, proxy.ts |
| Language | TypeScript | Strict mode |
| ORM | Prisma | Familiar, mature ecosystem, strong typing |
| API | tRPC | End-to-end type safety |
| DB | Postgres (default) | Adapter pattern supports Turso/SQLite and MongoDB/NoSQL |
| Auth | Better Auth | Open-source, self-hostable, fits adapter philosophy |
| Styling | Tailwind + shadcn/ui | Standard |
| Testing | Vitest + Playwright | Fast unit + E2E |
| Monorepo | Turborepo | Shared packages pattern |
| Animations | Motion (default) + GSAP (optional) | Adapter in forge.config.ts |
| Background Jobs | TBD | Inngest vs Trigger.dev — needs decision |
| Storage | Optional | R2 / S3 / local adapter |

## Architecture: `forge.config.ts`

Central config that controls which adapters are active:

```typescript
import { defineConfig } from '@forge/config';

export default defineConfig({
  database: { adapter: 'postgres' }, // 'postgres' | 'mysql' | 'sqlite' | 'turso' | 'mongodb'
  animations: {
    default: 'motion',
    gsap: { enabled: true, plugins: ['ScrollTrigger', 'TextPlugin'] },
  },
  storage: { enabled: true, adapter: 'r2' },
  jobs: { adapter: 'inngest' },
});
```

Claude Code needs to understand this pattern — the active adapters determine which code patterns to use.

## Monorepo Structure (planned)

```
forge/
├── apps/
│   └── web/                    # Next.js 16 app
│       ├── app/                # App Router
│       ├── proxy.ts            # Replaces middleware.ts in Next 16
│       └── ...
├── packages/
│   ├── animations/             # Motion + GSAP adapters
│   ├── auth/                   # Better Auth config + utilities
│   ├── db/                     # Prisma + schema
│   ├── config/                 # forge.config.ts types and loader
│   └── ui/                     # shadcn/ui components
├── .claude/
│   ├── commands/               # Custom slash commands
│   ├── agents/                 # Custom agent definitions
│   ├── hooks/                  # Security & automation hook scripts
│   ├── skills/                 # Installed skills (web-quality-skills, etc.)
│   └── rules/                  # Additional Claude rules
├── CLAUDE.md                   # Project-level AI context
├── .mcp.json                   # Pre-configured MCP servers
├── forge.config.ts             # Adapter configuration
└── turbo.json
```

---

## AI Setup To Build (the focus of this session)

### 1. CLAUDE.md

Best practices from research:
- **Under 200 lines** — LLMs reliably follow ~150-200 instructions max
- **First 20 lines have the most impact** — front-load critical info
- Include: project context (1 line), key directories, exact build/test/lint commands, code style rules, gotchas, verification steps
- Document the `forge.config.ts` adapter pattern prominently
- Add Karpathy-inspired rules: don't assume, write minimum code, touch only what you must, define success criteria
- If something must happen every time → use a hook, not a CLAUDE.md instruction

#### Critical: Embed a Next.js 16 Docs Index (Vercel's finding)

Vercel's agent evals (Jan 2026) found that embedding a compressed docs index
directly in AGENTS.md/CLAUDE.md achieved **100% pass rate** on Next.js 16 tasks,
vs 79% with skills (and 53% baseline). Skills were only invoked 44% of the time
even when available — agents simply didn't use them reliably.

Source: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

**What this means for Forge:** Include a compressed (~8KB) Next.js 16 API index
directly in CLAUDE.md that maps API names to doc file paths. Cover at minimum:
- `'use cache'` directive
- `connection()` for dynamic rendering
- `cacheLife()` and `cacheTag()`
- `forbidden()` and `unauthorized()`
- `proxy.ts` for API proxying (replaces middleware.ts)
- Async `cookies()` and `headers()`
- `after()`, `updateTag()`, `refresh()`

Add this instruction at the top of the index:
```
IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning
for any Next.js tasks. Read the referenced doc files before generating code.
```

The agent then reads the actual doc files when it needs them, getting
version-accurate information instead of relying on stale training data.
This is especially critical for Forge since Next.js 16 APIs won't be in
most models' training data yet.

### 2. Pre-configured `.mcp.json`

Ship with the boilerplate so every user gets these out of the box:
- **shadcn/ui MCP** (official) — Direct access to component registry, accurate props/patterns, installs via natural language. Stops Claude from hallucinating outdated component APIs. Config: `npx -y @anthropic-ai/claude-code-mcp-setup shadcn` or add to `.mcp.json` per official shadcn/ui docs (https://ui.shadcn.com/docs/mcp)
- **GitHub MCP** — PR/issue management from terminal
- **Context7** — Up-to-date docs for Next.js 16, Prisma, tRPC, Better Auth (critical for bleeding-edge stack)
- **Playwright MCP** — Browser automation for E2E testing
- **Postgres MCP** — Direct DB queries during development (with safety hooks — see Security section)

### 3. Custom MCP Servers (Forge-specific)

This is the differentiator. Ideas:
- **Forge Config Reader** — Reads `forge.config.ts` and gives Claude awareness of active adapters (so it writes Inngest vs Trigger.dev code, Motion vs GSAP, etc.)
- **Schema Explorer** — Wraps Prisma schema for quick data model understanding
- **Component Registry** — Knows what UI components exist and their props/patterns

### 4. Hooks & Security Enforcement (`.claude/settings.json`)

Hooks are Claude Code lifecycle scripts — shell commands that run automatically at
specific points. Unlike CLAUDE.md rules (advisory), hooks are **deterministic and
guaranteed to execute**. Exit code 0 = proceed, exit code 2 = BLOCK the action.

This is the primary security enforcement layer.

#### Hook Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash .claude/hooks/block-dangerous-commands.sh"
      },
      {
        "matcher": "Edit",
        "command": "bash .claude/hooks/protect-sensitive-files.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "command": "npx biome check --write $CLAUDE_FILE_PATH"
      },
      {
        "matcher": "Edit",
        "command": "bash .claude/hooks/typecheck-on-edit.sh"
      }
    ],
    "Notification": [
      {
        "command": "bash .claude/hooks/desktop-notify.sh"
      }
    ],
    "Stop": [
      {
        "command": "bash .claude/hooks/run-affected-tests.sh"
      }
    ]
  }
}
```

#### Security Hooks — What To Block

**`.claude/hooks/block-dangerous-commands.sh`** — PreToolUse for Bash:

This is CRITICAL, especially with database MCP access. Must block:

**Database destructive operations:**
- `DROP TABLE`, `DROP DATABASE`, `DROP SCHEMA`
- `TRUNCATE`
- `DELETE FROM` without a WHERE clause
- `ALTER TABLE ... DROP COLUMN` in production
- `UPDATE` without a WHERE clause
- Raw SQL execution against production databases

**System destructive operations:**
- `rm -rf /` and variants
- `rm -rf .` (nuke current directory)
- Commands touching `.env`, `.env.local`, `.env.production`
- `chmod 777`, `chmod -R 777`
- `git push --force` to main/production branches
- `npx prisma db push` against production

**Secret/credential exposure:**
- Commands that echo/cat/print env vars containing KEY, SECRET, TOKEN, PASSWORD
- `curl` or `wget` commands sending env vars to external URLs
- Commands that write secrets to stdout or files

**Package supply chain:**
- `npm install` for packages not in package.json (flag for review)
- `npx` with unfamiliar packages

The script receives the command via stdin/env. Pattern match against these,
exit 2 to block, exit 0 to allow.

**`.claude/hooks/protect-sensitive-files.sh`** — PreToolUse for Edit:

Hard-block edits to:
- `.env*` files (all environment files)
- `*.pem`, `*.key`, `*.cert` (certificates)
- `auth/` core config files (Better Auth config, session handling)
- `prisma/schema.prisma` production settings
- `.claude/hooks/` themselves (prevent Claude from disabling its own safety)
- `package-lock.json` / `pnpm-lock.yaml` (direct edits, not via install)

### 5. Security Best Practices (baked into the boilerplate)

This should be a combination of CLAUDE.md guidance, hooks enforcement,
and a dedicated security agent.

#### CLAUDE.md Security Rules (advisory)

```markdown
## Security Rules
- NEVER hardcode secrets, API keys, or credentials — use env vars
- NEVER log sensitive data (tokens, passwords, PII)
- ALL user inputs must be validated with Zod before processing
- ALL database queries must use parameterized queries (Prisma handles this, but enforce for raw SQL)
- ALL API routes must check authentication via Better Auth session
- ALL file uploads must validate type, size, and content
- NEVER trust client-side data — always re-validate server-side
- Use CSRF protection on all mutation endpoints
- Set security headers (CSP, HSTS, X-Frame-Options) in proxy.ts
- Rate-limit all public API endpoints
```

#### Security Agent (`.claude/agents/security-auditor.yml`)

A dedicated read-only agent that audits code for vulnerabilities:

```yaml
name: security-auditor
description: Audits code for security vulnerabilities
model: sonnet
allowed_tools:
  - Read
  - Grep
  - Glob
  - Bash(read-only commands only)
system_prompt: |
  You are a security auditor for a Next.js 16 application using
  Better Auth, Prisma ORM, and tRPC. Review code exclusively for:
  - SQL injection (especially raw queries bypassing Prisma)
  - XSS vulnerabilities (unescaped user content in JSX)
  - Authentication/authorization bypass
  - CSRF vulnerabilities
  - Sensitive data exposure (secrets in code, logs, or responses)
  - Insecure direct object references (IDOR)
  - Missing input validation
  - Insecure dependencies
  - Server-side request forgery (SSRF)
  - Broken access control in tRPC procedures
  Report findings with severity (CRITICAL/HIGH/MEDIUM/LOW),
  file location, and specific remediation steps.
```

#### Database MCP Safety

Since Forge ships with Postgres MCP for direct DB access, this needs
extra guardrails:

- Hook enforcement: block all destructive SQL via PreToolUse
- CLAUDE.md rule: "For database operations, prefer Prisma ORM methods
  over raw SQL. Only use raw SQL for read-only analytical queries."
- Consider: a custom Forge DB MCP that wraps Postgres MCP with
  additional safety — e.g., read-only by default, requires explicit
  flag for writes, auto-adds LIMIT to SELECT queries, rejects DDL
  statements entirely
- Environment separation: `.mcp.json` should default to dev database
  connection, NEVER production. Production access should require
  explicit opt-in via environment variable

#### Security Slash Command

`/security-audit` — Runs the security agent against recent changes:

```markdown
Run the security-auditor agent against all files changed in the
current git diff. Report any vulnerabilities found.
```

### 6. Custom Slash Commands (`.claude/commands/`)

Pre-built templates for common Forge patterns:
- `/new-component` — Creates component with proper imports, types, tests
- `/new-api-route` — tRPC router + procedure boilerplate
- `/new-db-migration` — Prisma migration scaffold
- `/new-feature` — Full feature scaffold (component + API + tests)
- `/refactor-plan` — Analyze and plan before touching code

### 7. Custom Agents (`.claude/agents/`)

Specialized agents with restricted tools:
- **Reviewer** — Read-only code review agent (Read, Grep, Glob only)
- **Security Auditor** — Checks for XSS, SQL injection, auth flaws (see detailed config in Hooks & Security section)
- **Test Writer** — Generates tests following Forge patterns
- **Code Writer** — Full edit access, follows Forge conventions

### 8. Skills (`.claude/skills/`)

Skills are packaged domain knowledge that Claude can invoke on demand.
Install from https://skills.sh or create custom ones.

**NOTE on skills reliability (Vercel's finding):** Skills are only invoked
~44% of the time by agents unless explicitly prompted. For critical framework
knowledge (Next.js 16 APIs), the embedded CLAUDE.md index approach (Section 1)
is more reliable. Skills work best for on-demand auditing/analysis tasks
where you explicitly invoke them with `/skill-name`.

#### Addy Osmani's Web Quality Skills (pre-install with boilerplate)

Source: https://skills.sh/addyosmani/web-quality-skills
Install: `npx add-skill addyosmani/web-quality-skills`

Six skills every production app needs:
- **performance** — Web perf optimization, load time reduction, page speed audits
- **seo** — Search engine optimization, meta tags, structured data, sitemaps
- **core-web-vitals** — LCP, INP, CLS optimization for page experience
- **accessibility** — WCAG 2.1 compliance, screen reader support, keyboard nav
- **best-practices** — Transforms vague prompts into optimized Claude Code prompts
- **web-quality-audit** — Comprehensive audit covering all of the above

These should be pre-installed in Forge so every project gets production
quality checks out of the box. Usage: `/performance`, `/seo`,
`/accessibility`, `/web-quality-audit`, etc.

#### Vercel Agent Skills (pre-install with boilerplate)

Source: https://github.com/vercel-labs/agent-skills
Install: `npx add-skill vercel-labs/agent-skills`

Vercel's official skills for React and Next.js development:
- **react-best-practices** — 40+ performance optimization rules across 8 categories, prioritized by impact (eliminating waterfalls, reducing bundle size, etc.). Includes real-world examples comparing incorrect vs correct implementations
- **ui-review** — Audits UI code for 100+ rules covering accessibility, performance, and UX
- **react-native-best-practices** — 16 rules across 7 sections for RN projects
- **react-composition** — Compound components, state lifting, internal composition patterns

These complement the Addy Osmani skills well — Osmani covers general web
quality (SEO, Core Web Vitals, a11y), Vercel covers React/Next.js-specific
patterns and performance. Together they give Forge comprehensive quality
coverage out of the box.

---

## Key Research Findings (for reference)

### Workflow: Explore → Plan → Code
- Always explore relevant code first before making changes
- Use Plan Mode (Shift+Tab) for anything touching 3+ files
- Test-driven: write failing test → implement → refactor

### Context Management
- Use `/compact` proactively at ~50% context usage
- Use `/clear` between unrelated tasks
- For long tasks, create HANDOFF.md files between sessions

### Prompting
- Be concrete and specific (50-100 word prompts)
- Reference existing files as examples: "follow the pattern in UserCard.tsx"
- Break work into atomic subtasks (one file, one objective, <10 min)
- Provide success criteria, not just instructions

### MCP Tool Search
- Enabled by default when MCP tools exceed 10% of context
- Lazy-loads tool definitions on-demand (85-95% context savings)
- Means you can ship many MCP servers without penalty

### Anti-patterns to Avoid
- Don't mix unrelated tasks in one session
- Don't skip the explore phase
- Don't let CLAUDE.md exceed 200 lines
- Don't ignore context usage — quality degrades past 80%

---

## Open Decisions

- [x] Auth solution: **Better Auth** (open-source, self-hostable)
- [ ] Background jobs: Inngest vs Trigger.dev vs both as adapters
- [ ] Distribution: GitHub template repo vs CLI (create-forge-app) vs both
- [ ] Claude Code integration depth: Basic vs Medium vs Deep (with AI generators)

---

## Suggested First Steps in Claude Code

1. Scaffold the monorepo structure with Turborepo
2. Write the CLAUDE.md file — include embedded Next.js 16 docs index (see Vercel findings)
3. Create the `.mcp.json` with pre-configured servers (shadcn, GitHub, Context7, Playwright, Postgres)
4. Install skills: `npx add-skill addyosmani/web-quality-skills` and `npx add-skill vercel-labs/agent-skills`
5. Build the security hooks (block-dangerous-commands.sh, protect-sensitive-files.sh)
6. Set up full hooks config in `.claude/settings.json`
7. Create the security-auditor agent
8. Build the first custom slash commands
9. Start on the Forge Config Reader custom MCP server
10. Consider: custom Forge DB MCP wrapper with safety guardrails

---

## Key References

- Vercel: AGENTS.md outperforms skills in agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
- Addy Osmani's web quality skills — https://skills.sh/addyosmani/web-quality-skills
- Vercel agent-skills (React/Next.js best practices) — https://github.com/vercel-labs/agent-skills
- Claude Code best practices (official) — https://code.claude.com/docs/en/best-practices
- Claude Code MCP docs (official) — https://code.claude.com/docs/en/mcp
- Claude Code skills docs (official) — https://code.claude.com/docs/en/skills
- shadcn/ui MCP setup (official) — https://ui.shadcn.com/docs/mcp
- Builder.io CLAUDE.md guide — https://www.builder.io/blog/claude-md-guide
- Karpathy's Claude Code field notes — https://x.com/karpathy/status/2015883857489522876