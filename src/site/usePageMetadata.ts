import { useEffect } from "react";
import { formatPageTitle, siteConfig, toAbsoluteSiteUrl } from "./siteConfig";

type PageMetadata = {
  title?: string;
  pathname?: string;
};

function setMetaContent(selector: string, value: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", value);
}

function setLinkHref(selector: string, value: string) {
  document.querySelector<HTMLLinkElement>(selector)?.setAttribute("href", value);
}

export function usePageMetadata({ title, pathname }: PageMetadata = {}) {
  useEffect(() => {
    const currentPath = pathname ?? window.location.pathname;
    const pageTitle = formatPageTitle(title);
    const pageUrl = toAbsoluteSiteUrl(currentPath);
    const imageUrl = toAbsoluteSiteUrl("/site-logo.svg");

    document.title = pageTitle;
    setLinkHref('link[rel="canonical"]', pageUrl);
    setMetaContent('meta[property="og:site_name"]', siteConfig.name);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:url"]', pageUrl);
    setMetaContent('meta[property="og:image"]', imageUrl);
    setMetaContent('meta[name="twitter:title"]', pageTitle);
    setMetaContent('meta[name="twitter:image"]', imageUrl);
  }, [pathname, title]);
}
