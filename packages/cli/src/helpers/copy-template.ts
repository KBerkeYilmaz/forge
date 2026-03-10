import tiged from "tiged";
import fs from "fs-extra";
import path from "path";

const TEMPLATE_REPO = "KBerkeYilmaz/forge";

// Directories/files that exist in the repo but should NOT be in a scaffolded project
const PATHS_TO_REMOVE = [
  "packages",
  "docs",
  "Forge — AI-Optimized Next.js 16 Boilerplate",
];

export async function copyTemplate(targetDir: string): Promise<void> {
  const emitter = tiged(TEMPLATE_REPO, {
    disableCache: true,
    force: true,
    verbose: false,
  });

  await emitter.clone(targetDir);

  for (const entry of PATHS_TO_REMOVE) {
    const entryPath = path.join(targetDir, entry);
    if (await fs.pathExists(entryPath)) {
      await fs.remove(entryPath);
    }
  }
}
