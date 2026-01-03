# Setup Instructions

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXX
NEXT_PUBLIC_CLARITY_ID=xxxxx

# Forms (if using Formspree)
NEXT_PUBLIC_FORMSPREE_ID=xxxxx

# Zeffy (if needed)
NEXT_PUBLIC_ZEFFY_URL=https://...

# Site URL (for sitemap)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utility functions
- `src/styles/` - Global styles and design tokens
- `content/` - MDX content files (blog, events, news, pages)
- `public/` - Static assets (images, icons, PDFs)
- `docs/` - Documentation and migration files

## Content Management

Content is stored as MDX files in the `content/` directory:
- `content/blog/` - Blog posts
- `content/events/` - Events
- `content/news/` - News items
- `content/pages/` - Static pages

Each MDX file should include frontmatter with metadata.

## Redirects

Redirects are configured in `docs/migration/urls.csv`. The format is:
```
old_url,type,title,new_url,notes
```

Update this file with your Wix URL mappings, and they will be automatically loaded by Next.js.

## Forms

Forms are configured to use Formspree by default. Update `NEXT_PUBLIC_FORMSPREE_ID` in `.env.local` with your Formspree form ID.

Alternatively, you can modify the form components to use a different service or custom API routes.
