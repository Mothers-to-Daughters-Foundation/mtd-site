# Product Requirements Document

## Nonprofit Mentor/Mentee Website Migration & Rebuild

**Node.js / Next.js Project**

---

## Overview

We're migrating our existing nonprofit mentor/mentee website from Wix to a modern Next.js (React) + Node setup. The main goals are:

* Rebuild the frontend with React components and a unified design system
* Set up a scalable backend (probably Next.js API routes, maybe a separate Node server if needed)
* Reproduce everything that currently works on the Wix site
* Improve performance, SEO, and accessibility
* Build something flexible that can grow with us
* Integrate analytics (Google Analytics + Microsoft Clarity)
* Migrate all content, assets, URLs, and preserve SEO value

This doc outlines the project scope, what we need to figure out, architecture decisions, and the migration plan.

---

## Project Structure

```
docs/
  ia/
  design-system/
  requirements/
  migration/
src/
  components/
  app/ or pages/
  lib/
public/
```

---

## Project Goals

* Modernize the site using Next.js 14+
* Build a design system we can actually use and maintain
* Improve performance, accessibility, and SEO
* Migrate all pages and content from Wix
* Get donation flows and third-party integrations working
* Move domains/hosting without breaking things
* Document everything so future us doesn't hate current us

---

## Project Management

We've already set up project tracking in GitHub:
* **Roadmap** - High-level project roadmap is available in GitHub
* **Kanban Board** - Active kanban board for tracking work in progress
* **Backlog** - Backlog is set up and ready for prioritizing tasks

Check the GitHub project board for current status and task assignments.

---

## Phase 0 — Foundations & Requirements

### GitHub Setup

* Initialize the repo
* Add `.gitignore` for Node/Next.js
* Create `/docs` folder structure (IA, design, requirements, migration)

### Hosting & Deployment

Planning to use **Vercel** for deployment, previews, and scaling. We'll need staging and production environments, plus figure out how to integrate analytics.

### Requirements Documentation

File: `docs/requirements/functional.md`

We need to document:
* What pages we have
* Prioritization schema
* Internal contributor structure / roles & responsibilities
* Mentor/mentee content structure
* How donations should work
* What forms we need
* Design system documentation
* Social media gameplan
* Any admin functionality
* Accessibility requirements (aiming for WCAG AA)

### Open Questions

* Do we need user accounts or authentication?
* Which donation provider? (Stripe, PayPal, Donorbox?)
* Any CRM or email service integrations?
* Styling approach? (Tailwind or custom CSS var?)

---

## Phase 1 — Wix Extraction & Migration Planning

### What We Need From the Wix Developer

* All text content from every page
* Images, logos, icons, SVGs
* PDFs and other documents
* Complete URL list
* SEO metadata (titles, descriptions, etc.)
* Any embedded scripts
* Brand colors and font settings
* List of hidden or unused pages

### Content Inventory

Location: `docs/ia/content-inventory.md`

Track everything with a simple table:

```
Page | URL | Content Status | Assets Status | Notes
```

### URL Inventory & Redirect Plan

* List all old URLs
* Map them to new Next.js routes
* Document which ones need 301 redirects
* Flag any pages that might hurt SEO if we mess this up

### Information Architecture

Location: `docs/ia/sitemap.md`

Figure out:
* Top-level navigation structure
* Footer links
* Maybe secondary nav for programs

---

## Phase 2 — Design System Development

### Design System Folder Structure

```
docs/design-system/
  colors.md
  typography.md
  spacing.md
  grid.md
  components.md
  buttons.md
  forms.md
  brand.md
```

### Brand Tokens

Define:
* Colors (primary, secondary, neutrals, semantic colors)
* Typography scale (H1–H6, paragraph, caption styles)
* Spacing system (4, 8, 12, 16, 24, 32, etc.)
* Breakpoints for responsive design

### Component Library

Following atomic design principles:

**Atoms:**
* Buttons
* Inputs
* Icons
* Links

**Molecules:**
* Cards
* CTAs
* Nav items
* Sections

**Organisms:**
* Hero sections
* Navbar
* Footer
* Program blocks
* Donation block

### Technology Decisions

Planning to use **Tailwind CSS + shadcn/ui**. Could also use CSS Modules or Styled Components if needed.

### Design System Open Questions

* Do we need dark mode support?
* Are there existing brand guidelines we need to follow?
* Should we build a Figma component library?

---

## Phase 3 — Technical Architecture & Development Setup

### Next.js Project Setup

* Initialize with TypeScript
* Add Tailwind (assuming we go that route)
* Set up Prettier + ESLint
* Create global layout
* Configure metadata system
* Set up fonts using next/font
* Environment variables

### Backend Architecture

Options:
* **Next.js API routes** (probably this)
* Separate Node server (only if we really need it)

### Data Model Planning

If we need a backend, we might need:
* Mentor data
* Mentee data
* Events
* Programs
* Donations
* Admin users

### Backend Open Questions

* Do we actually need persistent data storage?
* If yes, which database? (Postgres, MongoDB, or maybe we don't need one?)
* Do we need an admin dashboard?

---

## Phase 4 — Frontend Development

### Global Layout

* Header component
* Footer component
* Global styles
* SEO helpers
* Analytics scripts (GA + Clarity)

### Building Components

Using the design system, we'll build:
* Buttons
* Inputs
* Cards
* Hero sections
* Testimonials
* Program blocks
* Footer
* Navigation

### Page Development

Based on the IA, we'll need:
* Home
* About
* Programs (Mentor / Mentee)
* Get Involved
* Donate
* Resources
* Contact

### SEO Setup

* Generate sitemap.xml
* Set up robots.txt
* Add OpenGraph tags
* Use semantic HTML
* Handle canonical URLs

### Performance & Accessibility

* Run Lighthouse audits
* Optimize for mobile
* Use `next/image` for images
* Make sure we hit WCAG AA standards

---

## Phase 5 — Content & Asset Migration

### Content Insertion

* Move all text into React components
* Check formatting, links, and metadata
* Fill in any missing copy

### Asset Upload

Organize assets:
* `/public/images`
* `/public/icons`
* `/public/pdf`

### URL Redirects

* Add redirects to `next.config.js`
* Verify with Google Search Console

### Verification

* Double-check every imported asset
* Test all internal links
* Make sure SEO is at least as good as the Wix site

---

## Phase 6 — Testing

### Manual Testing

* Test on desktop browsers
* Test on mobile browsers
* Check all interactive components

### Functional Testing

* Forms work correctly
* Donation flows function properly
* Navigation works everywhere
* 404 pages look good

### Accessibility Testing

* Keyboard navigation works
* Color contrast is sufficient
* Screen reader compatibility

---

## Phase 7 — Deployment & Domain Migration

### Staging Deployment

* Set up auto-deploy on Vercel
* Test the final build

### Domain Setup

* Add custom domain to Vercel
* Update DNS records
* Verify SSL and routing
* Run through launch checklist

### Production Launch

* Cutover from Wix
* Deploy production build
* Monitor analytics
* Run post-launch SEO crawl

---

## Open Questions Summary

### Platform

* Hosting: Vercel or custom VPS?
* Do we need a separate backend?
* Do we need a database?

### Content & Migration

* What can't we export from Wix?
* Are there hidden pages or forms we don't know about?
* Which donation provider should we use?

### Design

* Do we have existing brand guidelines?
* Should we support dark mode?
* Do we need a Figma component library?

### Integrations

* Any CRM or email service we need to connect?
* Other analytics or tracking tools?

---

## Dependencies

* Wix developer needs to provide full export
* Access to domain (either through Wix or external registrar)
* Decision on donation/payment provider
* Branding assets or style guide

---

## Risks

* Missing content or assets from Wix export
* SEO issues if URLs change without proper redirects
* DNS propagation delays during cutover
* Inconsistent branding if we don't build a proper design system
* Scope creep if backend requirements expand

---

## Success Criteria

* All Wix content successfully migrated
* Modern UI built with a documented design system
* Fully responsive and accessible
* Lighthouse scores 90+ across the board
* Stable production deployment with domain and SSL
* Analytics tracking engagement accurately
* Architecture that can scale for future programs

---

We can also generate the `/docs` folder with placeholder files, a design system starter, component list, sitemap template, or Next.js boilerplate code if needed.
