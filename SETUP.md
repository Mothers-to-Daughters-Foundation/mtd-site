# Setup Instructions

## Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account (free tier is sufficient)

## Installation

1. Install dependencies:
```bash
npm install
```

## Supabase Setup (Authentication & Database)

The MTD site uses [Supabase](https://supabase.com) for authentication and user data, which works on both the static GitHub Pages deployment and the full Vercel/server deployment.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and follow the prompts.
3. Once created, go to **Project Settings → API**.
4. Copy your **Project URL** and **anon (public) key**.

### 2. Enable email auth

In your Supabase project:
1. Go to **Authentication → Providers**.
2. Ensure **Email** provider is enabled.
3. (Optional) Disable "Confirm email" during development so sign-ups work instantly.

### 3. Create the admin account

Run the seed script once with your credentials in environment variables.
**Never hard-code credentials in source files.**

```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
ADMIN_EMAIL="admin@yourdomain.com" \
ADMIN_PASSWORD="your-secure-password" \
ADMIN_NAME="MTD Admin" \
node scripts/create-admin.mjs
```

The **service role key** is found under **Project Settings → API → service_role key**.
Keep it secret — never commit it or expose it in client code.

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Analytics - Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Forms (if using Formspree)
NEXT_PUBLIC_FORMSPREE_ID=xxxxx

# Zeffy (if needed)
NEXT_PUBLIC_ZEFFY_URL=https://...

# Site URL (for sitemap)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Supabase (Authentication & Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# MongoDB (optional – only needed for legacy API routes / Vercel deployment)
MONGODB_URI=mongodb+srv://username:password@yourcluster.mongodb.net/mtd-site
MONGODB_DB_NAME=mtd-site

# NextAuth (optional – only needed for Vercel/full-stack deployment)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```

## GitHub Actions Secrets (for GitHub Pages deployment)

The static GitHub Pages build bakes the Supabase public keys into the HTML at build time.
Add these as **repository secrets** (Settings → Secrets and variables → Actions):

| Secret name                     | Value                             |
|---------------------------------|-----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key   |

The anon key is safe to embed in browser-side code — Supabase uses Row Level Security to restrict what it can access.

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` and admin credentials are **never** added as GitHub Actions secrets or committed to the repository. Run the `scripts/create-admin.mjs` script once locally from your own machine.

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
- `scripts/` - One-time maintenance and seeding scripts

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
