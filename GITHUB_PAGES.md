# GitHub Pages Deployment

This repository is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

## How It Works

The deployment is handled by a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Checks out the code
2. Sets up Node.js and installs dependencies
3. **Removes server-side features** that are incompatible with GitHub Pages static hosting
4. Builds the Next.js site as a static export
5. Deploys the generated static files to GitHub Pages

## Important Limitations

GitHub Pages only serves static files and cannot execute server-side code. As a result, the following features are **automatically excluded** from the GitHub Pages deployment:

### Excluded Features:
- **API Routes** (`src/app/api/*`) - All backend API endpoints
- **Authentication** (`src/app/(auth)/*`) - Login, register, and auth-related pages
- **Dashboard** (`src/app/dashboard/*`) - All dashboard pages requiring authentication

### What's Included:
- ✅ All public-facing pages (home, about, programs, etc.)
- ✅ Blog posts and news articles
- ✅ Event listings
- ✅ Static content and images
- ✅ Contact forms (frontend only - no server-side processing)

## For Full Functionality

If you need the complete application with authentication, API routes, and dashboard features, consider deploying to a platform that supports server-side rendering:

- **Vercel** (recommended for Next.js) - https://vercel.com
- **Netlify** - https://www.netlify.com
- **AWS Amplify** - https://aws.amazon.com/amplify/
- **Railway** - https://railway.app

## Local Development

To test the site locally with all features:

```bash
npm install
npm run dev
```

To test the static export (GitHub Pages build):

```bash
npm run build
```

Note: The local build will fail if server-side features are present. Use `npm run dev` for local development with full functionality.

## Configuration

The static export is configured in `next.config.js`:

```javascript
output: 'export',
images: {
  unoptimized: true,
}
```

This configuration is required for GitHub Pages deployment but limits functionality to static content only.
