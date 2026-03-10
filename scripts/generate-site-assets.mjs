import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const dotenvPath = new URL("../.env", import.meta.url);

const DEFAULT_SITE_URL = "https://mathgames.win";
const ROUTES = [
  "/",
  "/about",
  "/speed-arithmetic",
  "/power-blitz",
  "/factor-rush",
  "/target-24",
  "/number-sense",
];

function loadDotenv(path) {
  try {
    const file = readFileSync(path, "utf8");
    const pairs = {};

    for (const rawLine of file.split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      pairs[key] = value;
    }

    return pairs;
  } catch {
    return {};
  }
}

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/u, "");
}

const dotenvValues = loadDotenv(dotenvPath);
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL ?? dotenvValues.VITE_SITE_URL ?? DEFAULT_SITE_URL);

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemapEntries = ROUTES.map(
  (route) => `  <url>\n    <loc>${siteUrl}${route === "/" ? "/" : route}</loc>\n  </url>`,
).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

writeFileSync(new URL("../public/robots.txt", import.meta.url), robots, "utf8");
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), sitemap, "utf8");

process.stdout.write(`Generated robots.txt and sitemap.xml for ${siteUrl} in ${projectRoot}\n`);
