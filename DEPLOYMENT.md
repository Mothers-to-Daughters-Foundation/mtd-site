# Deploying Sign-in and Payments

GitHub Pages only serves static files. The Pages workflow deletes the login,
register, dashboard, and API routes before it builds, so on
`*.github.io/mtd-site` those pages return **404**. Sign-in and Stripe payments
need a host that runs Next.js server code. The steps below use **Vercel**, which
is free for this size of site.

## 0. Run it locally (demo)

```bash
git clone https://github.com/Mothers-to-Daughters-Foundation/mtd-site.git
cd mtd-site
npm install
# create .env.local with the variables in step 2 (NEXT_PUBLIC_APP_URL=http://localhost:3000)
npm run dev
```

Open http://localhost:3000/login. Sign-in, dashboards, and messaging work against your Supabase project.
To test payments locally, use Stripe test keys and forward webhooks with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# put the whsec_… it prints into STRIPE_WEBHOOK_SECRET in .env.local, then restart npm run dev
```

## 1. Deploy the full app to Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. Import `Mothers-to-Daughters-Foundation/mtd-site`. Keep the defaults
   (framework: Next.js; build command: `npm run build`). **Do not** set `GITHUB_PAGES`.
3. Add the environment variables from step 2, then click **Deploy**.
4. Note the URL, e.g. `https://mtd-site.vercel.app` (or add a custom domain under
   Project → Settings → Domains).

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Where to get it |
|------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (secret) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → Secret key (`sk_live_…` or `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | From step 4 below (`whsec_…`) |
| `NEXT_PUBLIC_APP_URL` | The Vercel URL from step 1, no trailing slash |
| `NEXT_PUBLIC_SITE_URL` | Same as above (used for the sitemap) |

After you change variables, redeploy (Deployments → ⋯ → Redeploy).

## 3. Configure Supabase auth

Supabase → Authentication → URL Configuration:

- **Site URL**: your Vercel URL
- **Redirect URLs**: add `https://<your-vercel-url>/**`

To create test and admin accounts, run `supabase/seed-users.sql` in the Supabase SQL editor
(see `SETUP.md`).

## 4. Connect Stripe

1. In Stripe → Product catalog, create one **recurring** product/price per membership plan.
   Copy each price ID (`price_…`).
2. Put each price ID in the `stripe_price_id` column of the matching row in the Supabase
   `plans` table. You can do this in the Supabase table editor or on **Dashboard → Admin → Tiers**.
   Checkout refuses plans that have no price ID.
3. Stripe → Developers → Webhooks → **Add endpoint**:
   - URL: `https://<your-vercel-url>/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.paid`
4. Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel and redeploy.

Test with Stripe test mode first: use `sk_test_…` keys and card `4242 4242 4242 4242`.

## 5. Send "Sign in" on the GitHub Pages site to Vercel (optional)

If you keep the public site on GitHub Pages, go to GitHub → repo **Settings → Secrets and
variables → Actions → Variables** and add `APP_URL` = your Vercel URL. The next Pages
deploy points **Sign in**, **Join the Community**, and the membership **Get Started** buttons
at Vercel.

The simpler alternative is to serve the whole site from Vercel and turn off GitHub Pages.

## 6. AI-assisted matching (optional)

Matching works without AI. Mentees and mentors answer the same questions; each mentor with room
is scored on interests (30%), career goals (25%), motivations (20%), what the mentee looks for
next (15%) and what success means (10%), plus a small keyword bonus from free text. A strong
(60%+), complete, clear winner is assigned automatically; everything else goes to
**Admin → Matches → Needs review** with the reasons.

With an AI key, partial fits are first ranked by a model, but only when at least
`AI_MATCHING_MIN_MENTORS` mentors have room; with fewer, a person decides. The AI's pick is
assigned only at or above a confidence threshold; below it, or whenever the AI step is skipped,
the match goes to review with a flag saying why.

Two providers are supported. Gemini is used when its key is set.

**Google AI Studio (Gemini Flash / Flash-Lite)**

1. Go to https://aistudio.google.com → **Get API key** → **Create API key**.
2. Turn on billing for that project (AI Studio → **Billing**) before using real member data.
   On the free tier Google may use prompts to improve its products, and free quotas are small.
3. Optionally set a budget alert in Google Cloud Billing. The app's own budget below is a soft cap.

**Anthropic (Claude)**: create a key at https://console.anthropic.com → **API keys** and set a
monthly spend limit under **Limits** (a hard cap).

Add these on Vercel (server-only; never prefix them with `NEXT_PUBLIC_`), then redeploy:

| Name | Default | Meaning |
|------|---------|---------|
| `GEMINI_API_KEY` | — | Google AI Studio key: turns the AI step on with Gemini |
| `ANTHROPIC_API_KEY` | — | Anthropic key: turns the AI step on with Claude |
| `AI_MATCHING_PROVIDER` | whichever key is set (Google first) | `google` or `anthropic` |
| `AI_MATCHING_MODEL` | `gemini-3.5-flash-lite` / `claude-opus-5-5` | e.g. `gemini-3.8-flash` for Flash |
| `AI_MATCHING_MONTHLY_BUDGET_USD` | `5` | Stop calling AI once this month's estimated spend reaches this |
| `AI_MATCHING_MIN_CONFIDENCE` | `0.8` | AI picks below this (0–1) go to admin review |
| `AI_MATCHING_MIN_MENTORS` | `5` | Fewer mentors with room than this: skip AI, a person decides |
| `AI_MATCHING_ENABLED` | `true` | Set `false` to turn AI off without deleting the key |

For local testing, put the same names in `.env.local`. The AI step only sees mentee answers and
mentor career areas, expertise, bio and load, under opaque labels, never names or contact details.

When the AI step is skipped, the review shows why: AI off, monthly budget used up, provider quota
or credit used up, service unavailable, or misconfigured key/model. Spend is estimated from token
counts at paid-tier prices and resets on the 1st of each month (UTC).

## Moving to your own domain

Add the domain in Vercel (Project → Settings → Domains) and create the DNS records Vercel shows
you. Then update these to the new domain: `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL`
(then redeploy), the Supabase Site URL and redirect URLs, and the Stripe webhook endpoint URL.

## Known gaps before launch

- **Database schema is not in this repo.** The code expects these Supabase tables to already exist:
  `user_profiles`, `admin_users`, `plans`, `subscriptions`, `mentorships`, `conversations`,
  `conversation_members`, `messages`, `sessions`, `notifications`, `resources`, `audit_logs`,
  plus a storage bucket for resources. A new Supabase project needs these created first.
- **Apply the files in `supabase/migrations/` in order** (Supabase SQL editor; each is safe to
  re-run). `0014_match_review.sql` adds mentor capacity and the review queue;
  `0015_matching_profile.sql` adds the onboarding answers. Without 0015, onboarding, Add mentor
  and mentor profile saves fail.
- The contact, newsletter, and volunteer forms need `NEXT_PUBLIC_FORMSPREE_ID`.
- Change the seeded test and admin passwords.
