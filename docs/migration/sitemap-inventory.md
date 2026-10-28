# Sitemap Inventory

This document tracks the parsing and mapping of Wix sitemap XML files.

## Sitemap Files to Process

- `blog-categories-sitemap.xml`
- `blog-posts-sitemap.xml`
- `event-pages-sitemap.xml`
- `booking-services-sitemap.xml`
- `dynamic-courses-*.xml`
- `dynamic-news-sitemap.xml`
- `pricing-plans-sitemap.xml`
- `pages-sitemap.xml`

## URL Mapping Patterns

- `/post/<slug>` → `/blog/<slug>`
- `/event-details/<slug>[/form]` → `/events/<slug>` (repeat events get date-suffixed slugs)
- `/news/<wix-slug>` → `/news/<slug>`
- `/<person>` bio pages → `/team/<slug>` (`/copy-of-kinya-baker` is Sandra Banuett)
- Wix member area (`/mentee-*`) → dashboard routes; template, store and booking pages → nearest new page

Every row lives in `docs/migration/urls.csv` (126 URLs from the live sitemap, checked against a production build).

## Status

- [x] Sitemap files downloaded
- [x] URLs extracted and cataloged
- [x] Redirect mappings created
- [x] Redirects implemented in `next.config.js`
