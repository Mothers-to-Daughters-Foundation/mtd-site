
# Product Roadmap

This document tracks planned features and integrations for the MTD site.

## Planned Integrations

### Dashboard — External Courses

#### Create Your Personal Brand: 5 Steps to Building Authenticity

- **Provider:** Doltam Creative Solutions
- **Course URL:** <https://doltam.podia.com/creating-your-personal-brand-5-steps-to-building-authenticity>
- **Description:** A self-paced course to help you own your story, release perfection, and build a personal brand rooted in authenticity. Through 5 powerful lessons, you'll learn to recognize every experience as a steppingstone, trust that you are enough, and show up confidently as exactly who you are.
- **Integration Target:** Member dashboard (`/dashboard`) and Courses page (`/courses`)
- **Status:** Planned

## Dashboard Feature Roadmap

| Feature | Status | Notes |

|---|---|---|
| Mentor dashboard | ✅ Planned (see `AUTHENTICATION_FEATURES.md`) | Role-based access |
| Donor portal | ✅ Planned (see `AUTHENTICATION_FEATURES.md`) | Donation history & impact |
| External course integration — Doltam "Create Your Personal Brand" | 🔲 Planned | Embed/link in dashboard courses section |
| Admin panel | 🔲 Future | Manage users, content, and events |
| Mentor availability calendar | 🔲 Launch | Date-time picker; assigned mentee is notified. External calendar/Calendly is post-launch |
| Automatic mentor–mentee matching | ✅ Done | Weighted scoring across five shared questions, mentor capacity, admin review queue, optional budget-capped AI. Paid mentees only |
| Mentee profile setup at signup | ✅ Done | Signup signs in and opens `/dashboard/onboarding` (interests, goals, tier) |
| Paid-access gating | ✅ Done | Unpaid mentees see locked chat/resources/sessions; server-enforced 403s |
| Promo codes | 🔲 Launch | Entered at checkout; Stripe applies the discount to the chosen plan |
| Top-nav submenus | 🔲 Launch | Group About, Programs, Events, Blog, Our Team, Donate, Volunteer, Partner, and Courses so the header and footer Navigation align |
| Footer social icons | 🔲 Launch | Replace the Instagram, LinkedIn, Facebook, TikTok, and YouTube text links with icons |
| Programs intro copy | 🔲 Launch | Live programs text, word for word, on the left of the carousel |
| News page rip | 🔲 Launch | `/news` matches the live newsroom HTML |
| Events page rip | 🔲 Launch | `/events` matches the live event list |
| Blog rip | 🔲 Launch | Live posts in markdown, with a view counter and a post page |
| Admin subscription controls | 🔲 Launch | Bug: page crashes. Then gift, waive, or prorate a user’s fee |
| Admin resource sharing | ✅ Done | `/dashboard/admin/resources`: admins drop in files or links for all mentees (or mentors / everyone); shown first on the mentee Resources page |
| Typeform-style mentee onboarding | ✅ Done | One question per screen; answers feed matching |
| Admin-created mentor accounts | ✅ Done | Public sign-up is mentees only; Add mentor captures the full matching profile |

## Courses Page Roadmap

| Course | Provider | Status |

|---|---|---|
| Create Your Personal Brand: 5 Steps to Building Authenticity | Doltam Creative Solutions | 🔲 Integrate into `/courses` and dashboard |

## Launch

### Top navigation submenus

The header and the footer Navigation list do not match, and the header is one flat row, so the items sit out of line.

Header today: About, Programs, Events, Blog, Media, Partner, Donate.

Footer Navigation: About, Programs, Events, Blog, Our Team, Donate, Volunteer, Partner, Courses.

Top-level items get submenus. About, Programs, Events, Blog, Our Team, Donate, Volunteer, Partner, and Courses stay reachable, grouped under fewer top-level labels. The header and the footer Navigation use that same structure.

### Footer social icons

The footer currently prints the words Instagram, LinkedIn, Facebook, TikTok, and YouTube (`src/components/layout/SiteFooter.tsx`). Replace those words with the social icons used on [motherstodaughters.org](https://www.motherstodaughters.org/programs). Keep a text label for screen readers.

### Programs intro, left of the carousel

On `/programs`, the left side of the image carousel uses the live [programs](https://www.motherstodaughters.org/programs) copy, word for word and in the same style:

- **M2D Intergenerational Mentoring Program**
- A Transformational Six-Month Journey—At No Cost
- Mothers to Daughters (M2D) offers a high-impact mentorship program designed to equip young women with the entrepreneurial mindset, strategies, and leadership skills needed to excel. Through immersive mentorship and hands-on workshops,
- Invest in yourself. Build your legacy. Enroll today.
- Interest Form
- Our Commitment is to support 100,000 business launches by 2035.
- Our Impact: 5+ years of empowering women; 100+ mentorship pairs formed; 200+ hybrid networking events since 2020; 50,000+ online engagements
- Our Commitment: 100,000 businesses by 2035; 1,000,000+ funding required

### News page

Rip [the live newsroom](https://www.motherstodaughters.org/news) into `/news` as HTML. Keep the newsroom intro (“Stay Inspired. Stay Informed.” and “What You’ll Find Here”) and the article list (date, title, excerpt, Read More), including the hero image.

### Events page

Rip [the live event list](https://www.motherstodaughters.org/event-list) into `/events`. Keep the intro (“Step into a space where wisdom, connection, and transformation come to life”), the hero image, and the Upcoming & Past Events list: image, title, RSVP state, date and time, location, More info, and Details. Include Load More.

### Blog

Rip [the live blog](https://www.motherstodaughters.org/blog) into `/blog`: All Posts, image, title, excerpt, author, date, and read time.

Each post has its own page, matching [the IWD 2025 article](https://www.motherstodaughters.org/post/iwd-2025-article-how-policy-and-legislation-can-accelerate-action-toward-gender-equality): title, author, date, read time, body, and recent posts. Add a view counter on the post.

Store every post as markdown so it can be edited without touching the page layout.

### Mentor availability

Mentors set availability with a date-time calendar picker. Saving a slot syncs it and notifies the assigned mentee.

Post-launch only: connect that availability to an external calendar or a Calendly API. Do not block launch on that integration.

### Automatic matching

Shipped. Mentees and mentors answer the same questions from the same option lists
(`src/lib/onboarding-options.ts`). Each mentor with room is scored on interests (30%), career
goals (25%), motivations (20%), what the mentee looks for next (15%) and what success means
(10%), plus a keyword bonus of at most 5% from free text. Only a strong, complete, clear winner is
assigned automatically; everything else goes to **Admin → Matches → Needs review**. AI ranking is
optional, budget-capped, and only used when enough mentors have room. Setup: `DEPLOYMENT.md` § 6.

### Mentee account setup

A new mentee account must land on the profile creation form immediately. It does not. `src/app/(auth)/register/page.tsx` sends the new account to `/login`. The form at `/dashboard/onboarding` (interests, career goals, subscription tier) only appears if someone opens that URL later.

After signup, sign the mentee in and open `/dashboard/onboarding` before anything else. That page collects:

- Interests
- Career goals, as a list
- Subscription tier

The tier choice hooks into Stripe. Build the Stripe Express provisions first (account link, price IDs, checkout session, webhook to mark the subscription active) so the live keys and price IDs can be dropped in without rewriting the flow.

### Promo codes

Checkout accepts a promo code. Stripe applies the discount to the plan the mentee selected. Codes are created in Stripe so the app only needs to pass the code through checkout.

### Admin subscriptions and resources

**Bug.** `/dashboard/admin/subscriptions` and `/dashboard/admin/resources` both crash.

Subscriptions fails because `getAllSubscriptions()` selects `user_profiles.email`, and that column does not exist. Once the page loads, an admin can gift or waive the fee for a specific user, or enter a prorated discount for that user.

Resources: admins share files or links from `/dashboard/admin/resources` with all mentees (default), all mentors, or everyone; mentors keep sharing with their mentees. Files upload straight from the browser to Supabase Storage through a signed upload URL, so size is not capped by Vercel's request-body limit.

### Subscription access

When a mentee's subscription runs out, they cannot access:

- Mentor chat
- Resources
- Sessions

## Scaling considerations

What has to change as membership grows. Ordered by when it starts to hurt. Items marked
**Before launch** are risks with even a handful of real members.

### Before launch

| Area | Today | Why it matters | Recommendation |
|---|---|---|---|
| Paid activation | The Zeffy activation webhook is a stub; Zeffy doesn't call it on its own | Paid members aren't marked paid automatically, so they never get matched or unlocked | Decide how a Zeffy payment becomes an active subscription: an integration (e.g. Zapier from Zeffy), or an admin "mark as paid" button as a stopgap |
| Password reset | ✅ Done: "Forgot password?" on sign-in, `/forgot-password` and `/reset-password` | — | Add `/reset-password` to Supabase redirect URLs. Optional: switch the reset email template to `token_hash` links so they work in any browser |
| Transactional email | Only Supabase's built-in sender, which is rate-limited and meant for testing | Sign-up, reset and match emails stop arriving once a few people sign up | Connect a custom SMTP provider (Resend, Postmark or Amazon SES) in Supabase; add "you've been matched" emails |
| Supabase plan | Production project on the Free plan | Free projects pause after a period of inactivity and have limited backups | Move production to Pro before launch, turn on backups, and keep a separate staging project |
| Database schema | Migrations only cover recent changes; the original tables were made by hand | A new environment (staging, disaster recovery) can't be rebuilt from the repo | Export the current schema into `supabase/migrations/0000_baseline.sql` |
| Safeguarding | No vetting step, report button or message moderation | A mentoring program carries duty-of-care risk; funders and partners will ask about it | Mentor background checks and agreements, a "report a concern" path, a code of conduct, and an admin view of reported conversations |
| Age and consent | ✅ Age check in onboarding (default 18+, `NEXT_PUBLIC_MIN_MEMBER_AGE`); only the birth year is stored | Members under 18 need parental consent and stricter data handling | Council to confirm the minimum age; if minors are in scope, add consent |
| Privacy | Draft policy written for council review; live page still dated October 2, 2026 | Members should know what's collected, why, and which vendors process it | Council decisions in the draft's appendix, legal review, then publish to `/legal/privacy-policy` |

### Hundreds of members

| Area | Today | Recommendation |
|---|---|---|
| Rate limiting | In-memory per server instance, so limits reset across Vercel's instances | Use a shared store (Upstash Redis or a Supabase table) for sign-up and login limits |
| Background work | Auto-match runs as fire-and-forget after payment; bulk auto-match runs one mentee at a time | Run matching from a queue or scheduled job (Vercel Cron or Supabase `pg_cron`) with retries |
| Errors and uptime | Only Vercel's short-lived logs | Add error tracking (Sentry) and an uptime check; alert on failed payments and failed matches |
| Automated checks | No CI on pull requests; the only workflow deploys GitHub Pages | Run lint, typecheck and tests on every pull request; add a few end-to-end tests (sign-up, onboarding, matching) |
| Hosting | GitHub Pages (static) and Vercel (full app) both deploy | Serve everything from Vercel on the real domain and retire the Pages workflow |
| Images | 35 MB in the repo, served unoptimized | Turn on Next.js image optimization on Vercel; move large media to Supabase Storage or a CDN |
| Mentor supply | Capacity limits exist, but there's no waitlist or recruiting view | Admin view of demand vs. capacity by interest area, a waitlist, and alerts when an area runs out of mentors |
| Matching quality | Weights are fixed in code | Collect a short feedback survey at 30 and 90 days; track override rate, time to pair and retention, then tune weights |

### Thousands of members

| Area | Recommendation |
|---|---|
| Admin roles | Split "admin" into program manager, content editor and finance roles with only the access each needs |
| Reporting | Board and funder reporting: members served, pairs formed, retention, outcomes. Export to CSV or a BI tool |
| Messaging | Message retention rules, attachment scanning, and moderation tooling |
| Costs | Expect Vercel Pro, Supabase Pro, an email provider and AI usage. Review monthly; AI is capped by `AI_MATCHING_MONTHLY_BUDGET_USD` |
| Accessibility and language | Accessibility audit (WCAG 2.2 AA); translations if you serve non-English speakers |

### CRM

Keep members, mentors and matches in Supabase rather than syncing them to a CRM: a second copy
of personal data means sync bugs and more privacy exposure. Use Zeffy's built-in donor tools for
donors first. If partner, sponsor, volunteer and newsletter follow-up needs a pipeline, send only
the public website form submissions one way to a free CRM tier such as HubSpot. Revisit a
nonprofit CRM (Salesforce for Nonprofits, Bloomerang) once staff manage grants and major donors.

## Content editing for non-technical staff

### Today

| Content | Where it lives | Who can change it |
|---|---|---|
| Blog, news, events, team bios | Markdown files in `content/` | Anyone with GitHub access, by editing the file on github.com. The site redeploys in a few minutes |
| Images | `public/images/` in the repo | GitHub upload, then the file path typed into the post |
| Home, About, Programs, Donate, Partner and other page text | Written directly in the page code (`src/app/(site)/…/page.tsx`) | A developer |
| Layout, menus, colors | Code | A developer |

Compared with Wix this is a big step down for editors: no visual editor, no preview, a page breaks
if the header block at the top of a post (the "frontmatter") is mistyped, and each save goes
live. Page text can't be changed without a developer at all.

### Options

| Option | Editing experience | Effort | Ongoing cost | Trade-offs |
|---|---|---|---|---|
| **A. Git-based CMS** (Keystatic, Decap or TinaCMS) | An `/admin` page with forms, image upload and preview. Saves to the same files in the repo | Low: blog, news, events and team are already files. Medium to move page text into editable files | Free or low | Structured forms rather than free-form page building. Tina offers on-page visual editing |
| **B. Headless CMS** (Sanity, Storyblok, Contentful) | Hosted editor; Storyblok's visual editor is the closest to Wix | High: move all content and rewire every page | Free tiers, then paid per seat or usage | Strongest editing and scheduling; another vendor and account to manage |
| **C. Keep the marketing site on Wix** | Exactly what staff know | Low: point `app.` (or similar) at Vercel for sign-in and dashboards | Wix subscription continues | Two sites to keep visually consistent; blog and events stay in Wix |
| D. Build editing into the admin dashboard | Custom forms in Supabase | High, and ongoing | Free | Rebuilding a CMS; not recommended |

### Recommendation

Start with **A**:

1. Add Keystatic, or TinaCMS if on-page visual editing matters, for blog, news, events and team
   bios. Editors sign in with GitHub, fill in forms, upload images, preview, and publish.
2. Move the text of the main pages (home, about, programs, donate, partner, volunteer) into
   content files so editors can change wording and images without a developer. Layout stays in
   code.
3. Turn on Vercel preview deployments for content changes so editors see a link before it goes
   live.

If the team needs to rearrange page layouts themselves (Wix-style drag and drop), choose **B**
with Storyblok, or **C** if staying on Wix for the public pages is acceptable.

## Post-launch

- Mentor availability syncs to an external calendar or Calendly.

## Future Enhancements

Longer-term backlog (not scheduled for launch):

- Referral program
- Mobile application
- Certificates
- Email marketing
- Analytics dashboard
- Sponsor portal
- Community forum
- Volunteer management
- Multi-language support
