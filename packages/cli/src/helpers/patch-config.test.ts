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
