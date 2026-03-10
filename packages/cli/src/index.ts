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

  if (await fs.pathExists(targetDir)) {
    p.cancel(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  await p.tasks([
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
