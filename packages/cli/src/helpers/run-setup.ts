import { execa } from "execa";

export async function runSetup(targetDir: string): Promise<void> {
  await execa("pnpm", ["install"], {
    cwd: targetDir,
    stdio: "pipe",
  });

  await execa("pnpm", ["dlx", "@next/codemod@canary", "agents-md", "--output", "AGENTS.md"], {
    cwd: targetDir,
    stdio: "pipe",
  });
}
