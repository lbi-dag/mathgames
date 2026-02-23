import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("typography contract", () => {
  test("aliases display font token to sans font token", () => {
    const tokensCss = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
    expect(tokensCss).toMatch(/--font-display:\s*var\(--font-sans\);/);
  });

  test("loads only Space Grotesk from Google Fonts", () => {
    const indexCss = readFileSync(join(process.cwd(), "src/index.css"), "utf8");
    expect(indexCss).toContain("family=Space+Grotesk:wght@400;600;700");
    expect(indexCss).not.toContain("Fraunces");
  });
});
