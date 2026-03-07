# Wix Site PRD — Pre-Migration Requirements

**Organization:** Mothers to Daughters Foundation (MTD)  
**Document type:** Product Requirements Document  
**Scope:** Current Wix site feature inventory and requirements, captured before migration to the GitHub Pages static site  
**Status:** Reference / Migration baseline

---

## Overview

This document captures the full product requirements and feature inventory of the **current MTD Wix website** as a baseline for the migration to a Next.js / GitHub Pages static site. All requirements listed here must either be reproduced in the new site or explicitly marked as out-of-scope with an agreed-upon reason.

---

## 1. Site Identity & Brand

| Attribute | Value |
|---|---|
| Organization name | Mothers to Daughters Foundation |
| Abbreviation | M2D / MTD |
| Tagline | "Bridging Generations. Empowering Women." |
| Mission | Empower young women by connecting them with the wisdom and insights of experienced mentors, fostering personal growth, professional development, and meaningful intergenerational relationships |
| Vision | A world where women of all generations thrive through intergenerational wisdom, driving inclusivity and gender equity for lasting global economic and social impact |
| Founder | Francine Mbvoumbo, Chair & President |
| Primary CTA | Donate / Support Our Mission |
| Secondary CTA | Join the Community |

### Brand Assets Required from Wix

- [ ] Organization logo (`MDLOGO.png` — already in `/public/images/`)
- [ ] Hero image
- [ ] Program images
- [ ] Founder/team headshots
- [ ] Partner logo collection (see §8 for full list)
- [ ] Brand color palette
- [ ] Typography stack (headings, body, captions)
- [ ] All icons and SVGs

---

## 2. Page Inventory

All pages live under the root domain. The table below maps every Wix page to its expected Next.js route and notes migration status.

| # | Wix Page | New Route | Priority | Notes |
|---|---|---|---|---|
| 1 | Home | `/` | P0 | Impact metrics, hero, programs overview, founder statement, partners carousel, newsletter CTA, content feed |
| 2 | About | `/about` | P0 | Mission, vision, why we exist, core values |
| 3 | Programs | `/programs` | P0 | Program listings; Intergenerational Mentoring Cohort + Slack community |
| 4 | Events | `/events` | P0 | Event listings with RSVP functionality |
| 5 | Blog | `/blog` | P1 | Blog post listing |
| 6 | Blog Post (dynamic) | `/blog/[slug]` | P1 | Individual blog posts |
| 7 | Media / News | `/news` | P1 | Press coverage, news items |
| 8 | News Article (dynamic) | `/news/[slug]` | P1 | Individual news/media items |
| 9 | Donate | `/donate` | P0 | Zeffy donation iframe embed |
| 10 | Contact | `/contact` | P0 | Contact form + mailing address + social links |
| 11 | Volunteer | `/volunteer` | P1 | Volunteer sign-up form |
| 12 | Partner | `/partner` | P1 | Partnership types, benefits, partner logos, contact form |
| 13 | Team | `/team` | P1 | Leadership team members with photos and bios |
| 14 | Courses | `/courses` | P1 | Internal and external course listings |
| 15 | Mentors Mixer | `/mentors-mixer` | P1 | Hub for Mentors Mixer events |
| 16 | Mentors Mixer 3.0 | `/mentors-mixer/3.0` | P2 | Event recap, speakers, photo/video gallery |
| 17 | Mentors Mixer 4.0 | `/mentors-mixer/4.0` | P2 | Event details / upcoming |
| 18 | Careers | `/careers` | P2 | Job/volunteer openings (linked in footer) |
| 19 | Legal | `/legal` | P2 | Legal index page |
| 20 | Privacy Policy | `/legal/privacy-policy` | P2 | Full privacy policy text |
| 21 | Disclaimer | `/legal/disclaimer` | P2 | Full disclaimer text |
| 22 | 404 | `/404` | P0 | Custom not-found page |

### Wix Sitemap Files to Process

The following Wix XML sitemaps must be downloaded, parsed, and mapped to new routes:

- `pages-sitemap.xml`
- `blog-posts-sitemap.xml`
- `blog-categories-sitemap.xml`
- `event-pages-sitemap.xml`
- `booking-services-sitemap.xml`
- `dynamic-courses-*.xml`
- `dynamic-news-sitemap.xml`
- `pricing-plans-sitemap.xml`

---

## 3. Navigation

### Primary Navigation (Header)

| Link label | Route | Notes |
|---|---|---|
| Logo | `/` | |
| About | `/about` | |
| Programs | `/programs` | |
| Events | `/events` | |
| Blog | `/blog` | |
| Media | `/news` | Labelled "Media" in nav, maps to `/news` |
| Partner | `/partner` | |
| Donate | `/donate` | Styled as a primary CTA button |
| Sign In | `/login` | Icon + label (server-side only; excluded from static export) |

- Hamburger menu on mobile
- Desktop: horizontal nav bar

### Footer Navigation (4-column layout)

| Column | Contents |
|---|---|
| About | Organization mission statement |
| Navigation | About, Programs, Events, Blog, Our Team, Donate, Volunteer, Partner, Courses, Careers |
| Contact | "Get in Touch" link; social icons (Instagram, LinkedIn, TikTok, YouTube) |
| Newsletter | Newsletter sign-up form (inline) |

Footer bottom bar: Legal · Privacy Policy · Disclaimer · Copyright notice

---

## 4. Page-Level Content Requirements

### 4.1 Home Page (`/`)

**Sections (in order):**

1. **Hero** — Full-width image with headline "Bridging Generations. Empowering Women.", sub-headline, and two CTAs: "Support Our Mission" (Donate) and "Join the Community" (Register)
2. **Empowering Young Women** — Two-column image + text block: "Empowering Young Women to Become Leaders"
3. **Programs Overview** — Two-column cards: Intergenerational Mentoring Cohort Program and Free Slack Community; "Learn more" links
4. **Impact Metrics** — Four stat cards:
   - 5 — Years in the Business
   - 100+ — Women Mentored
   - 300+ — Events Held
   - $200k+ — Donations
5. **Donate CTA** — "She Could Be Your Daughter. Your Sister. Your Future Leader." + Donate Now button
6. **Impact Stories** — Featured pull-quote from a program participant; link to blog
7. **Partners** — Logo grid carousel of 20 partner organizations (see §8)
8. **Founder Statement** — Photo of Francine Mbvoumbo + quote about intergenerational mentoring
9. **Newsletter CTA** — "Stay Connected" section with inline newsletter form
10. **Content Feed** — "We're Making Waves" — latest 3 items (blog posts + upcoming events) as cards

### 4.2 About Page (`/about`)

**Sections:**
- Mission statement
- Vision statement
- Why We Exist
- Core Values grid (4 values): Empowerment, Connection, Inclusivity, Impact

### 4.3 Programs Page (`/programs`)

**Sections:**
- Hero with description
- Program cards grid (each card links to program detail)
- Program Outcomes stats (95% / 89% / 100%)

**Programs to migrate from Wix:**
- Intergenerational Mentoring Cohort Program (featured)
- Free Slack Community

### 4.4 Events Page (`/events`)

- List of upcoming and past events
- Each event links to `/events/[slug]`
- RSVP form per event

### 4.5 Blog Page (`/blog`)

- List of all blog posts, sorted by date (newest first)
- Each post links to `/blog/[slug]`
- Blog post content: title, date, excerpt, full body, author, category tags, featured image

### 4.6 Media / News Page (`/news`)

- Press coverage and news items
- Each item links to `/news/[slug]`
- Content: title, date, source, excerpt, full body, image

### 4.7 Donate Page (`/donate`)

- Zeffy donation platform embedded via `<iframe>`
- Configured via `NEXT_PUBLIC_ZEFFY_URL` environment variable
- Page copy: "Your support helps us continue our mission of connecting mentors and mentees"

### 4.8 Contact Page (`/contact`)

- Two-column layout: contact info (left) + contact form (right)
- Mailing address (to be populated from Wix)
- Social media links: Instagram, LinkedIn, TikTok, YouTube
- Contact form fields: name, email, subject, message

### 4.9 Volunteer Page (`/volunteer`)

- Intro copy
- Volunteer sign-up form

### 4.10 Partner Page (`/partner`)

- Hero section
- Partnership types: Financial Support, In-Kind Support, Mentorship
- Partnership benefits list
- Current partner logos section
- Contact/inquiry form

### 4.11 Team Page (`/team`)

- Grid of team/leadership members
- Each member: photo, name, title, short bio
- Content to be migrated from Wix

### 4.12 Courses Page (`/courses`)

- Internal course listings (empty; to be populated)
- External courses section — currently featuring:
  - "Create Your Personal Brand: 5 Steps to Building Authenticity" by **Doltam Creative Solutions** ([link](https://doltam.podia.com/creating-your-personal-brand-5-steps-to-building-authenticity))

### 4.13 Mentors Mixer (`/mentors-mixer`)

- Hub page with links to individual Mentors Mixer edition pages
- Currently: Mentors Mixer 3.0 and 4.0

### 4.14 Mentors Mixer 3.0 (`/mentors-mixer/3.0`)

- Event recap
- Highlights and speakers
- Photos and videos gallery

### 4.15 Mentors Mixer 4.0 (`/mentors-mixer/4.0`)

- Upcoming event details
- RSVP functionality

### 4.16 Legal Pages

- `/legal` — index with links to Privacy Policy and Disclaimer
- `/legal/privacy-policy` — full policy text (to be migrated from Wix)
- `/legal/disclaimer` — full disclaimer text (to be migrated from Wix)

---

## 5. Forms & Interactive Features

| Form | Page | Fields | Submission handler |
|---|---|---|---|
| Contact Form | `/contact`, `/partner` | First name, last name, email, subject, message | Formspree (configurable) |
| Newsletter Form (inline) | Home, Footer | Email | Formspree (configurable) |
| Volunteer Form | `/volunteer` | Name, email, phone, availability, areas of interest, message | Formspree (configurable) |
| RSVP Form | `/events/[slug]` | Name, email, number of guests, dietary requirements | Formspree (configurable) |

All forms use client-side validation before submission. Formspree endpoint IDs are configured via environment variables.

---

## 6. Third-Party Integrations

| Integration | Purpose | Config |
|---|---|---|
| **Zeffy** | Donation processing | `NEXT_PUBLIC_ZEFFY_URL` env var; iframe embed on `/donate` |
| **Formspree** | Form submission handling | Endpoint IDs per-form via env vars |
| **Google Analytics 4** | Traffic analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var |
| **Microsoft Clarity** | Session recording / heatmaps | `NEXT_PUBLIC_CLARITY_ID` env var |
| **Slack** | Free community hub | External Slack workspace invite link |
| **Doltam (Podia)** | External course provider | External link from `/courses` |

---

## 7. Content Management

### Content Types (MDX-based)

| Type | Directory | Fields |
|---|---|---|
| Blog posts | `content/blog/` | `title`, `date`, `excerpt`, `author`, `tags`, `image`, `featured` |
| Events | `content/events/` | `title`, `date`, `location`, `excerpt`, `image`, `rsvpUrl` |
| News / Media | `content/news/` | `title`, `date`, `source`, `excerpt`, `image`, `url` |
| Static pages | `content/pages/` | Custom per-page frontmatter |

### Asset Organization

```
public/
  images/          # All site images (hero, programs, team, events, etc.)
  icons/           # SVG icons
  pdf/             # Downloadable PDFs and documents
```

---

## 8. Partner Organizations

The following partner logos are displayed in the Home page partners section and must be migrated:

| Partner | Logo file |
|---|---|
| 6ix | `partner_6ix.avif` |
| Ariana Marquis | `partner_arianamarquis.avif` |
| Branded Cities | `partner_brandedcities.avif` |
| Elevate Her | `partner_elevateher.avif` |
| FLO Unleashed | `partner_flounleashed.avif` |
| Freda's | `partner_fredas.avif` |
| Immigrant Women | `partner_immigrantwomen.avif` |
| Indeed | `partner_indeed.avif` |
| Jute | `partner_jute.avif` |
| Lux | `partner_lux.avif` |
| Mave | `partner_mave.avif` |
| Microsoft | `partner_microsoft.avif` |
| Mint Room | `partner_mintroom.avif` |
| Press The Best | `partner_pressthebest.avif` |
| Rondyce | `partner_rondyce.avif` |
| Spartan Cafe | `partner_spartancafe.avif` |
| Times Change | `partner_timeschange.avif` |
| UEF | `partner_uef.avif` |
| Vision 2 Reality | `partner_vision2reality.avif` |
| Zesty Lifestyle | `partner_zestylifestyle.avif` |

All logo files already live in `/public/images/` and are in use on the current static site.

---

## 9. Impact Metrics (Home Page Stats)

These numbers are displayed on the Home page and should be kept current:

| Metric | Value |
|---|---|
| Years in the Business | 5 |
| Women Mentored | 100+ |
| Events Held | 300+ |
| Donations raised | $200k+ |

---

## 10. SEO & Discoverability Requirements

| Requirement | Implementation |
|---|---|
| Per-page `<title>` and meta description | Next.js `metadata` export per route |
| OpenGraph / social sharing tags | Via Next.js metadata API |
| XML Sitemap | Dynamic `sitemap.ts` at `/sitemap.xml` |
| Robots.txt | `robots.ts` at `/robots.txt` |
| Semantic HTML | All pages use `<h1>`–`<h6>`, `<nav>`, `<main>`, `<article>`, `<footer>` correctly |
| Canonical URLs | Via `metadataBase` in root layout |
| URL Redirects | Wix-to-Next.js 301 redirects via `next.config.js` (see `docs/migration/urls.csv`) |
| Google Search Console | Sitemap submission post-launch |

### URL Redirect Mapping (Patterns)

| Old Wix URL pattern | New Next.js route |
|---|---|
| `/post/<slug>` | `/blog/<slug>` |
| `/event-details/<slug>` | `/events/<slug>` |
| Other patterns | To be documented after parsing Wix sitemaps |

---

## 11. Accessibility Requirements

Target: **WCAG 2.1 Level AA**

| Requirement | Notes |
|---|---|
| Keyboard navigable | All interactive elements reachable and operable via keyboard |
| Color contrast | Minimum 4.5:1 for normal text, 3:1 for large text |
| Touch targets | Minimum 44×44px on mobile |
| Alt text | All images have descriptive `alt` attributes |
| Screen reader support | Use semantic HTML and ARIA labels where needed |
| Skip navigation | "Skip to main content" link at top of page |
| Form labels | All inputs associated with visible labels |
| Focus indicators | Visible focus outlines on all interactive elements |

---

## 12. Performance Requirements

| Target | Metric |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 90 |
| Lighthouse Best Practices | ≥ 90 |
| Lighthouse SEO | ≥ 90 |
| First Contentful Paint | < 2s |
| Images | Optimized via `next/image`; served as `.avif` / `.webp` where possible |
| Fonts | Loaded via `next/font` to eliminate layout shift |
| Mobile-first | Responsive across 320px → 1280px+ |

---

## 13. Social Media Presence

| Platform | Status |
|---|---|
| Instagram | Active (link to be confirmed from Wix) |
| LinkedIn | Active (link to be confirmed from Wix) |
| TikTok | Active (link to be confirmed from Wix) |
| YouTube | Active (link to be confirmed from Wix) |

Social links appear in the site header (Contact page) and footer.

---

## 14. Content to Gather from Wix

The following items must be exported from the Wix site before it is decommissioned:

### Text Content
- [ ] All page body copy for every page listed in §2
- [ ] Team member names, titles, and bios
- [ ] Legal / Privacy Policy / Disclaimer full text
- [ ] Mentors Mixer 3.0 and 4.0 event details, speaker bios, and recap text
- [ ] Any hidden or unpublished pages
- [ ] All blog post body content and metadata
- [ ] All news/media item body content and metadata
- [ ] All event details and descriptions
- [ ] Any pricing plan descriptions

### Assets
- [ ] All images not already in `/public/images/`
- [ ] Team/staff headshots
- [ ] Event photos and gallery images
- [ ] Program-specific photography
- [ ] Any videos (or YouTube/Vimeo embed links)
- [ ] All PDFs and downloadable documents

### Technical Data
- [ ] Complete list of all public URLs (from Wix sitemap XML)
- [ ] SEO metadata per page (titles, descriptions, OG images)
- [ ] Any embedded scripts or widgets (chat, pop-ups, etc.)
- [ ] Form configuration (recipients, field mappings)
- [ ] Analytics property IDs (GA4, Clarity)
- [ ] Zeffy embed URL
- [ ] Formspree form IDs
- [ ] Social media profile URLs

---

## 15. Out-of-Scope for Static Site (GitHub Pages)

The following Wix/server-side features are **not included** in the GitHub Pages static export but are planned for the full Next.js deployment (Vercel):

| Feature | Reason | Planned Location |
|---|---|---|
| User authentication (login/register) | Requires server-side rendering | `src/app/(auth)/` — excluded from static build |
| Mentor dashboard | Requires authenticated session + database | `src/app/dashboard/mentor/` — excluded from static build |
| Donor portal | Requires authenticated session + donation data | `src/app/dashboard/donor/` — excluded from static build |
| API routes | No server runtime on GitHub Pages | `src/app/api/` — excluded from static build |
| MongoDB / database | No persistent runtime | Planned for Vercel deployment |
| Real-time RSVP counts | Requires backend | Future feature |
| Mentee–mentor matching | Requires backend logic | Future feature |
| Admin panel | Requires authenticated admin session | Future feature |

---

## 16. Member Platform Architecture

The following diagrams document the architecture and user flow for the Wix-based member platform, which serves as the reference design for the planned full Next.js deployment.

### 16.1 System Architecture

Shows how Wix Members, Authentication, and Pricing Plans feed into Role Assignment. Velo Logic drives role-based access, and CMS Collections (MembersProfile, Mentorships, Sessions, Transactions, Resources, Notifications) populate the Mentee and Mentor Dashboards.

![Member Platform System Architecture](https://github.com/user-attachments/assets/19fcc422-65cc-494f-be96-5ab8807a787e)

### 16.2 User Flow

Shows the end-to-end user journey from Visitor through Signup/Login → Wix Members Authentication → Pricing Plan/Role decision (Mentee Plan or Mentor Plan) → Role assignment → Profile creation → Role-Based Routing → Mentor or Mentee Dashboard. Admin manages all Wix CMS Collections that back dashboard features (Sessions, Resources, Events, Profile, Payments, My Mentees).

![Member Platform User Flow](https://github.com/user-attachments/assets/434a6c72-25ab-48dd-b108-0701b8fd3497)

---

## 17. Open Questions (Pre-Migration)

- [ ] What is the full list of Wix pages (including any hidden/draft pages)?
- [ ] Which donation tiers or amounts are configured in Zeffy?
- [ ] What are the exact Formspree form IDs in use on the Wix site?
- [ ] What email address(es) do contact/volunteer forms send to?
- [ ] Are there any Wix blog categories or tags that need to be preserved?
- [ ] Are there any Wix booking/scheduling services in use?
- [ ] Are there any Wix pricing plans that need to be replicated?
- [ ] Are the social media profile URLs documented anywhere?
- [ ] Is there a Wix CMS database (dynamic pages) with structured data?
- [ ] Does the Wix site have any password-protected pages?
- [ ] What is the complete mailing address for the Contact page?
- [ ] Are there existing brand guidelines / a style guide from Wix?

---

## 18. Migration Checklist

### Phase 0 — Gather

- [ ] Download all Wix sitemap XML files
- [ ] Export all page text content
- [ ] Download all images and assets
- [ ] Record all social media profile URLs
- [ ] Note all third-party integration IDs/keys

### Phase 1 — Map

- [ ] Populate `docs/migration/urls.csv` with old → new URL mappings
- [ ] Identify all required 301 redirects
- [ ] Flag SEO-sensitive URLs

### Phase 2 — Build

- [ ] Replace placeholder content in all pages with real Wix content
- [ ] Upload all images to `/public/images/`
- [ ] Configure Formspree endpoint IDs in `.env.local`
- [ ] Set `NEXT_PUBLIC_ZEFFY_URL`
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_CLARITY_ID`

### Phase 3 — Test

- [ ] Complete QA checklist (`docs/qa-checklist.md`)
- [ ] Verify all redirects resolve correctly
- [ ] Run Lighthouse audit (target 90+ across all categories)
- [ ] Test all forms end-to-end
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test on desktop (Chrome, Firefox, Safari, Edge)

### Phase 4 — Launch

- [ ] Complete launch checklist (`docs/launch-checklist.md`)
- [ ] Keep Wix site live during DNS cutover
- [ ] Monitor analytics post-launch
- [ ] Submit new sitemap to Google Search Console

---

*Last updated: 2026-03-07*  
*Document owner: MTD Engineering / Content Team*
