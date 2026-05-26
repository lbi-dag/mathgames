const DEFAULT_SITE_NAME = "Math Games";
const DEFAULT_SITE_URL = "https://mathgm.org";
const DEFAULT_HOME_TITLE = "Free Mental Math Games";

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/u, "");
}

export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME?.trim() || DEFAULT_SITE_NAME,
  url: normalizeSiteUrl(import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL),
  homeTitle: DEFAULT_HOME_TITLE,
} as const;

export function formatPageTitle(pageTitle?: string) {
  return pageTitle ? `${pageTitle} | ${siteConfig.name}` : `${siteConfig.name} | ${siteConfig.homeTitle}`;
}

export function toAbsoluteSiteUrl(pathname = "/") {
  return new URL(pathname, `${siteConfig.url}/`).toString();
}
