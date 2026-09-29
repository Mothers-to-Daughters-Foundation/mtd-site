/**
 * Builds a link to a page served by the full (server-rendered) app.
 *
 * Sign-in, registration, the dashboard and payments need a server, so they
 * are stripped from the static GitHub Pages build. When NEXT_PUBLIC_APP_URL is
 * set (e.g. https://mtd-site.vercel.app), links to those pages point there;
 * otherwise they stay relative to the current site.
 */
export function appHref(path: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
  return appUrl ? `${appUrl}${path}` : path;
}
