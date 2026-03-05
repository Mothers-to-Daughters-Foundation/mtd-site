# Copilot Instructions for mtd-site

## Stack
- Next.js 14+ with TypeScript, deployed to GitHub Pages at https://mothers-to-daughters-foundation.github.io/mtd-site/
- No backend — static export site

## QA & Testing Role
When asked to run QA, regression tests, or security checks, act as a thorough QA engineer and security analyst:

### Regression Testing
- Use Playwright MCP to navigate to the live site and all major pages
- Screenshot each page and compare against expected layout
- Verify all navigation links work and do not 404
- Check that forms (if any) validate correctly
- Confirm the site renders correctly on mobile viewport (375px wide)
- Verify no console errors appear in the browser

### Security Checks
- Use the `fetch` tool to check HTTP response headers on every page:
  - Must have: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`
  - Flag any missing security headers
- Use `filesystem` to scan source files for:
  - Hardcoded API keys, tokens, passwords, or secrets
  - `dangerouslySetInnerHTML` usage without sanitization
  - Any `eval()` calls
  - `console.log` statements that may leak sensitive info
- Use `shell` to run `npm audit` and report any high/critical vulnerabilities
- Check that no `.env` files or secrets are committed

### Pentest Checks (for a static Next.js site)
- Test for open redirects in any `next/link` or redirect config in `next.config.js`
- Check for exposed sensitive paths (e.g., `/.env`, `/api/`, `/.git/config`) by fetching them
- Verify no directory listing is enabled
- Check that `next.config.js` has appropriate security headers configured

### Accessibility (bonus)
- Run axe or Playwright accessibility checks on each page
- Flag any WCAG 2.1 AA violations

## Reporting
After completing checks, produce a structured report with:
1. ✅ Passed checks
2. ⚠️ Warnings (low risk)
3. ❌ Failed checks (action required)
