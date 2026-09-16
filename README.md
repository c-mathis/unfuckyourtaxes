# Unfuck Your Taxes

A static, multi-page marketing site designed for Cloudflare Pages.

## Pages

- Home, about, services, process, resources, contact, and privacy
- Three plain-English resource articles
- `robots.txt` and `sitemap.xml` for search engines

## Creative handoff

- [Brand & Creative Handoff](design/BRAND_CREATIVE_HANDOFF.md)
- [Machine-readable design tokens](design/design-tokens.json)

## Deployment

This is dependency-free static HTML, CSS, and JavaScript. In Cloudflare Pages, set the build command to blank and the output directory to `.` (the repository root). Connect the custom domain after the first successful deployment.

The contact page and paid-traffic assessment post leads to the shared Cloudflare Worker, preserve campaign parameters, and redirect successful submissions to `/thank-you`. Email remains the fallback when the endpoint is unavailable.
