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
