# Google Search Console

Pele Studio keeps its interactive editor at `/`. The public introduction at `/about/` and export guide at `/guides/mermaid-to-png/` are complete static HTML, copied into `dist/` by Vite. They do not read or modify browser-local diagrams. The editor itself still renders with JavaScript; Google can render it, but the static pages supply explanatory content without requiring JavaScript.

The canonical public origin is `https://pele-studio.cc`. Keep canonical URLs, Open Graph URLs, and `public/sitemap.xml` consistent when adding public pages or changing the domain. `public/robots.txt` allows crawling and references the sitemap. Unknown Pages URLs should retain a real 404; do not add an all-path SPA fallback just for SEO.

## Verify ownership

Open https://search.google.com/search-console using the Google account that should own the site property.

For a Domain property, enter `pele-studio.cc`, then add the exact DNS TXT verification record supplied by Google at the domain provider. Do not replace existing website DNS records. Keep the verification record after verification.

If DNS access is unavailable, add a URL-prefix property for `https://pele-studio.cc/`. Choose an HTML verification file or HTML meta tag. Place the supplied file unchanged in `public/`, or insert Google's exact `google-site-verification` meta tag into the head of the root `index.html`. Deploy, verify, and retain the file/tag. Do not invent a verification token.

## Submit and inspect

Once ownership is verified and the changes are deployed:

1. Submit `https://pele-studio.cc/sitemap.xml` through Search Console's Sitemaps report.
2. Inspect `https://pele-studio.cc/` using URL Inspection. Run the live test, review crawl/index eligibility and rendered HTML, then request indexing.
3. Inspect and request indexing for the introduction and export guide as well.
4. Use the Page Indexing report for indexing status and the Performance report for actual search queries and impressions.

Submission does not guarantee indexing or search rankings. Google may take days to weeks to crawl. Repeated indexing requests do not speed the process. No Google Analytics tracking is required for sitemap submission or indexing.

Official references:

- https://support.google.com/webmasters/answer/9008080
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
