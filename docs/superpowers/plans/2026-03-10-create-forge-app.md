# create-forge-app CLI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `npx create-forge-app my-app` — a CLI that scaffolds a complete Forge project with one interactive prompt (Motion or GSAP).

**Architecture:** pnpm workspace monorepo — CLI lives in `packages/cli/`, template stays at repo root. CLI uses `tiged` to download a clean copy of `KBerkeYilmaz/forge`, removes non-template dirs (`packages/`, `docs/`), patches `forge.config.ts` based on animation choice, then runs `pnpm install` and re-generates `AGENTS.md`.

**Tech Stack:** TypeScript (ESM), `@clack/prompts`, `tiged`, `execa`, `fs-extra`, published to npm as `create-forge-app`.

---

## Chunk 1: Workspace + GitHub

### Task 1: Push repo to GitHub

**Files:**
- No code changes — git + GitHub operations only

- [ ] **Step 1: Create the GitHub repo**

Go to https://github.com/new and create a public repo named `forge` under `KBerkeYilmaz`. Do NOT initialize with README (we already have one).

- [ ] **Step 2: Add remote and push**

```bash
git remote add origin https://github.com/KBerkeYilmaz/forge.git
git push -u origin main
```

Expected: all 3 commits pushed, branch tracking set.

- [ ] **Step 3: Verify**

Open https://github.com/KBerkeYilmaz/forge — confirm README renders correctly.

---

### Task 2: Set up pnpm workspace

**Files:**
- Create: `pnpm-workspace.yaml`
- Modify: `package.json` (root) — add `agents-md` script, mark as workspace root

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 2: Add `agents-md` script to root `package.json`**

In the `"scripts"` block, add:
```json
"agents-md": "npx @next/codemod@canary agents-md --version 16.1.6 --output AGENTS.md"
```

- [ ] **Step 3: Verify workspace is recognized**

```bash
pnpm install
```

Expected: no errors, workspace recognized. (No packages yet, that's fine.)

- [ ] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml package.json pnpm-lock.yaml
git commit -m "chore: set up pnpm workspace and agents-md script"
```

---

## Chunk 2: CLI Package Scaffold

### Task 3: Scaffold `packages/cli`

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts` (empty entrypoint)

- [ ] **Step 1: Create `packages/cli/package.json`**

```json
{
  "name": "create-forge-app",
  "version": "0.1.0",
  "description": "Create a new Forge app — AI-optimized Next.js 16 boilerplate",
  "type": "module",
  "bin": {
    "create-forge-app": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@clack/prompts": "^0.9.0",
    "execa": "^9.5.2",
    "fs-extra": "^11.3.0",
    "tiged": "^2.12.7"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.14.10",
    "typescript": "^5.8.2",
    "vitest": "^3.0.9"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["create-forge-app", "forge", "nextjs", "boilerplate", "claude-code"],
  "license": "MIT"
}
```

- [ ] **Step 2: Create `packages/cli/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create empty entrypoint `packages/cli/src/index.ts`**

```typescript
#!/usr/bin/env node
// entrypoint — implementation in next tasks
```

- [ ] **Step 4: Install CLI dependencies**

```bash
pnpm install
```

Expected: `packages/cli/node_modules` populated.

- [ ] **Step 5: Update `.gitignore` to exclude CLI build output**

Add to `.gitignore`:
```
packages/cli/dist/
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/ .gitignore pnpm-lock.yaml
git commit -m "chore: scaffold create-forge-app CLI package"
```

---

## Chunk 3: Core Logic

### Task 4: Implement and test `patch-config`

This is the only unit with meaningful logic — a pure function that patches `forge.config.ts`.

**Files:**
- Create: `packages/cli/src/helpers/patch-config.ts`
- Create: `packages/cli/src/helpers/patch-config.test.ts`

- [ ] **Step 1: Write the failing test first**

Create `packages/cli/src/helpers/patch-config.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { patchAnimationConfig } from "./patch-config.js";

const baseConfig = `import { defineConfig } from "~/lib/forge";

export default defineConfig({
  database: {
    adapter: "postgres",
  },
  animations: {
    default: "motion",
  },
});
`;

describe("patchAnimationConfig", () => {
  it("keeps motion when motion is selected", () => {
    const result = patchAnimationConfig(baseConfig, "motion");
    expect(result).toContain('default: "motion"');
  });

  it("replaces motion with gsap when gsap is selected", () => {
    const result = patchAnimationConfig(baseConfig, "gsap");
    expect(result).toContain('default: "gsap"');
    expect(result).not.toContain('default: "motion"');
  });

  it("does not mutate anything else in the config", () => {
    const result = patchAnimationConfig(baseConfig, "gsap");
    expect(result).toContain('adapter: "postgres"');
    expect(result).toContain("defineConfig");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && npx vitest run src/helpers/patch-config.test.ts
```

Expected: FAIL — `patch-config.ts` doesn't exist yet.

- [ ] **Step 3: Implement `packages/cli/src/helpers/patch-config.ts`**

```typescript
type AnimationLibrary = "motion" | "gsap";

/**
 * Patches the animations.default field in forge.config.ts content.
 * Pure function — takes the file content as a string, returns patched string.
 */
export function patchAnimationConfig(
  configContent: string,
  animation: AnimationLibrary
): string {
  return configContent.replace(
    /default:\s*"(motion|gsap)"/,
    `default: "${animation}"`
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && npx vitest run src/helpers/patch-config.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/helpers/
git commit -m "feat(cli): add patchAnimationConfig with tests"
```

---

### Task 5: Implement `copy-template` helper

Downloads the template with `tiged`, removes non-template directories.

**Files:**
- Create: `packages/cli/src/helpers/copy-template.ts`

- [ ] **Step 1: Create `packages/cli/src/helpers/copy-template.ts`**

```typescript
import tiged from "tiged";
import fs from "fs-extra";
import path from "path";

const TEMPLATE_REPO = "KBerkeYilmaz/forge";

// Directories that exist in the repo but should NOT be in a scaffolded project
const DIRS_TO_REMOVE = ["packages", "docs"];

// Files that exist in the repo but should NOT be in a scaffolded project
const FILES_TO_REMOVE = ["Forge — AI-Optimized Next.js 16 Boilerplate"];

export async function copyTemplate(targetDir: string): Promise<void> {
  const emitter = tiged(TEMPLATE_REPO, {
    disableCache: true,
    force: true,
    verbose: false,
  });

  await emitter.clone(targetDir);

  // Remove CLI and docs — users don't need these in their project
  for (const dir of DIRS_TO_REMOVE) {
    const dirPath = path.join(targetDir, dir);
    if (await fs.pathExists(dirPath)) {
      await fs.remove(dirPath);
    }
  }

  for (const file of FILES_TO_REMOVE) {
    const filePath = path.join(targetDir, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/helpers/copy-template.ts
git commit -m "feat(cli): add copyTemplate helper using tiged"
```

---

### Task 6: Implement `run-setup` helper

Runs `pnpm install` and `agents-md` in the scaffolded project.

**Files:**
- Create: `packages/cli/src/helpers/run-setup.ts`

- [ ] **Step 1: Create `packages/cli/src/helpers/run-setup.ts`**

```typescript
import { execa } from "execa";

export async function runSetup(targetDir: string): Promise<void> {
  // Install dependencies
  await execa("pnpm", ["install"], {
    cwd: targetDir,
    stdio: "inherit",
  });

  // Regenerate AGENTS.md with correct Next.js version
  await execa(
    "npx",
    [
      "@next/codemod@canary",
      "agents-md",
      "--version",
      "16.1.6",
      "--output",
      "AGENTS.md",
    ],
    {
      cwd: targetDir,
      stdio: "inherit",
    }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/helpers/run-setup.ts
git commit -m "feat(cli): add runSetup helper (pnpm install + agents-md)"
```

---

## Chunk 4: CLI Entrypoint + Build

### Task 7: Implement the CLI entrypoint

Wires everything together with `@clack/prompts`.

**Files:**
- Modify: `packages/cli/src/index.ts` (replace stub)

- [ ] **Step 1: Implement `packages/cli/src/index.ts`**

```typescript
#!/usr/bin/env node
import * as p from "@clack/prompts";
import path from "path";
import fs from "fs-extra";
import { copyTemplate } from "./helpers/copy-template.js";
import { patchAnimationConfig } from "./helpers/patch-config.js";
import { runSetup } from "./helpers/run-setup.js";

async function main() {
  console.log();
  p.intro("create-forge-app");

  // Project name — from argv or prompt
  let projectName = process.argv[2];

  if (!projectName) {
    const nameResult = await p.text({
      message: "What is your project name?",
      placeholder: "my-app",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-]+$/.test(value))
          return "Use lowercase letters, numbers, and hyphens only";
      },
    });

    if (p.isCancel(nameResult)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    projectName = nameResult;
  }

  // Animation library choice
  const animation = await p.select({
    message: "Which animation library?",
    options: [
      {
        value: "motion",
        label: "Motion",
        hint: "framer-motion rebranded — lighter, great for UI animations",
      },
      {
        value: "gsap",
        label: "GSAP",
        hint: "GreenSock — industry standard for complex animations",
      },
    ],
  });

  if (p.isCancel(animation)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Guard: don't overwrite existing directories
  if (await fs.pathExists(targetDir)) {
    p.cancel(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  const tasks = await p.tasks([
    {
      title: "Downloading template",
      task: async () => {
        await copyTemplate(targetDir);
        return "Template downloaded";
      },
    },
    {
      title: "Configuring forge.config.ts",
      task: async () => {
        const configPath = path.join(targetDir, "forge.config.ts");
        const content = await fs.readFile(configPath, "utf-8");
        const patched = patchAnimationConfig(
          content,
          animation as "motion" | "gsap"
        );
        await fs.writeFile(configPath, patched, "utf-8");
        return "forge.config.ts configured";
      },
    },
    {
      title: "Installing dependencies",
      task: async () => {
        await runSetup(targetDir);
        return "Dependencies installed";
      },
    },
  ]);

  p.outro(
    [
      `Your Forge app is ready! Next steps:`,
      ``,
      `  cd ${projectName}`,
      `  cp .env.example .env`,
      `  # Fill in DATABASE_URL and BETTER_AUTH_SECRET`,
      `  pnpm db:push`,
      `  pnpm dev`,
    ].join("\n")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): implement CLI entrypoint with clack prompts"
```

---

### Task 8: Build and smoke-test locally

**Files:** No new files — build + test run only.

- [ ] **Step 1: Build the CLI**

```bash
cd packages/cli && pnpm build
```

Expected: `packages/cli/dist/` created with `index.js` and type declarations.

- [ ] **Step 2: Make the binary executable**

```bash
chmod +x packages/cli/dist/index.js
```

- [ ] **Step 3: Smoke test with `node` directly**

```bash
node packages/cli/dist/index.js test-project
```

Expected: prompts appear, animation selection works, scaffolding begins.

> Note: The `tiged` download will fail until the GitHub repo is pushed (Task 1). If testing before push, mock it by commenting out `copyTemplate` and testing the rest of the flow.

- [ ] **Step 4: Verify the scaffolded output**

After a successful run, check:
```bash
ls test-project/
# Should NOT contain: packages/, docs/
# Should contain: src/, prisma/, forge.config.ts, CLAUDE.md, .claude/, etc.

grep 'default:' test-project/forge.config.ts
# Should reflect your animation choice
```

- [ ] **Step 5: Clean up test project**

```bash
rm -rf test-project/
```

- [ ] **Step 6: Commit build artifacts note**

The `dist/` is gitignored. No commit needed.

---

## Chunk 5: Publish

### Task 9: Publish to npm

- [ ] **Step 1: Log in to npm (if not already)**

```bash
npm login
```

- [ ] **Step 2: Dry run to verify what gets published**

```bash
cd packages/cli && npm publish --dry-run
```

Expected output lists only `dist/` files + `package.json`. Verify `src/` and `node_modules/` are NOT included.

- [ ] **Step 3: Publish**

```bash
cd packages/cli && npm publish --access public
```

- [ ] **Step 4: Verify it works via npx**

```bash
npx create-forge-app@latest test-project
```

Expected: full flow works end-to-end.

- [ ] **Step 5: Clean up**

```bash
rm -rf test-project/
```

- [ ] **Step 6: Tag the release and push**

```bash
git tag v0.1.0
git push origin main --tags
```

---

## Post-Implementation

Update `README.md` Quick Start section — replace the placeholder comment with the actual working command:

```markdown
## Quick Start

\`\`\`bash
npx create-forge-app my-app
\`\`\`
```

Commit: `docs: update README quick start with working npx command`
