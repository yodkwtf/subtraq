/**
 * The canonical base URL for the deployed site, used for metadata, Open Graph,
 * sitemap, and robots. Set NEXT_PUBLIC_SITE_URL in your env to override; on
 * Netlify `URL` is injected automatically. The final fallback is the production
 * domain so prod links never point at localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  "https://subtraq.yodkwtf.com";
