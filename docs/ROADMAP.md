
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
| Automatic mentor–mentee matching | ✅ Done | Career areas + expertise. Soft and deterministic match, paid mentees only |
| Mentee profile setup at signup | ✅ Done | Signup signs in and opens `/dashboard/onboarding` (interests, goals, tier) |
| Paid-access gating | ✅ Done | Unpaid mentees see locked chat/resources/sessions; server-enforced 403s |
| Promo codes | 🔲 Launch | Entered at checkout; Stripe applies the discount to the chosen plan |
| Top-nav submenus | 🔲 Launch | Group About, Programs, Events, Blog, Our Team, Donate, Volunteer, Partner, and Courses so the header and footer Navigation align |
| Footer social icons | 🔲 Launch | Replace the Instagram, LinkedIn, Facebook, TikTok, and YouTube text links with icons |
| Programs intro copy | 🔲 Launch | Live programs text, word for word, on the left of the carousel |
| News page rip | 🔲 Launch | `/news` matches the live newsroom HTML |
| Events page rip | 🔲 Launch | `/events` matches the live event list |
| Blog rip | 🔲 Launch | Live posts in markdown, with a view counter and a post page |
| Mentee–mentor matching | 🔲 Future | See automatic matching above; external calendar sync stays post-launch |

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

Mentors choose the career areas they have developed in, and their areas of expertise.

Matching runs in two ways:

- **Deterministic:** pair when career area and expertise line up directly.
- **Soft:** pair on a partial overlap when a strict pair is not available.

Automatic pairing happens only when the mentee is on a paid subscription. Free accounts are not auto-matched.

### Mentee account setup

A new mentee account must land on the profile creation form immediately. It does not. `src/app/(auth)/register/page.tsx` sends the new account to `/login`. The form at `/dashboard/onboarding` (interests, career goals, subscription tier) only appears if someone opens that URL later.

After signup, sign the mentee in and open `/dashboard/onboarding` before anything else. That page collects:

- Interests
- Career goals, as a list
- Subscription tier

The tier choice hooks into Stripe. Build the Stripe Express provisions first (account link, price IDs, checkout session, webhook to mark the subscription active) so the live keys and price IDs can be dropped in without rewriting the flow.

### Promo codes

Checkout accepts a promo code. Stripe applies the discount to the plan the mentee selected. Codes are created in Stripe so the app only needs to pass the code through checkout.

### Subscription access

When a mentee's subscription runs out, they cannot access:

- Mentor chat
- Resources
- Sessions

## Post-launch

- Mentor availability syncs to an external calendar or Calendly.
