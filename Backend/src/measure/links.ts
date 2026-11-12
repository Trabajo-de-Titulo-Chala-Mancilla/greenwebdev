const NON_PAGE_EXTENSION =
  /\.(pdf|zip|rar|7z|gz|docx?|xlsx?|pptx?|csv|jpe?g|png|gif|webp|avif|svg|mp3|mp4|webm|mov|xml|json|exe|dmg)$/i;

const withoutWww = (hostname: string) => hostname.replace(/^www\./i, "").toLowerCase();

/** Clave para detectar la misma página con distinta barra final. */
export function pageKey(url: URL): string {
  return `${withoutWww(url.hostname)}${url.pathname.replace(/\/+$/, "") || "/"}`;
}

/** Enlaces internos únicos, en el orden del documento y sin la página base. */
export function selectInternalLinks(hrefs: string[], base: string, limit: number): string[] {
  const baseUrl = new URL(base);
  const seen = new Set([pageKey(baseUrl)]);
  const selected: string[] = [];

  for (const href of hrefs) {
    if (selected.length === limit) break;
    let url: URL;
    try {
      url = new URL(href, baseUrl);
    } catch {
      continue;
    }
    const isInternal =
      (url.protocol === "http:" || url.protocol === "https:") &&
      withoutWww(url.hostname) === withoutWww(baseUrl.hostname);
    if (!isInternal || NON_PAGE_EXTENSION.test(url.pathname)) continue;

    const key = pageKey(url);
    if (seen.has(key)) continue;
    seen.add(key);

    url.hash = "";
    url.search = "";
    selected.push(url.href);
  }
  return selected;
}
