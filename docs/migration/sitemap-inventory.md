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
- `/event-details/<slug>` → `/events/<slug>`
- Other patterns to be documented as discovered

## Status

- [ ] Sitemap files downloaded
- [ ] URLs extracted and cataloged
- [ ] Redirect mappings created
- [ ] Redirects implemented in `next.config.js`
