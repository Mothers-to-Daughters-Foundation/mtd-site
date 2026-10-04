
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
| Automatic mentor–mentee matching | 🔲 Launch | Career areas + expertise. Soft and deterministic match, paid mentees only |
| Mentee profile setup at signup | 🔲 Launch | Interests, career goals, subscription tier. Stripe Express provisions first |
| Paid-access gating | 🔲 Launch | Expired subscription blocks chat, resources, and sessions |
| Mentee–mentor matching | 🔲 Future | See automatic matching above; external calendar sync stays post-launch |

## Courses Page Roadmap

| Course | Provider | Status |

|---|---|---|
| Create Your Personal Brand: 5 Steps to Building Authenticity | Doltam Creative Solutions | 🔲 Integrate into `/courses` and dashboard |

## Launch

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

A new mentee account goes to a profile setup page before the rest of the app. That page collects:

- Interests
- Career goals, as a list
- Subscription tier

The tier choice hooks into Stripe. Build the Stripe Express provisions first (account link, price IDs, checkout session, webhook to mark the subscription active) so the live keys and price IDs can be dropped in without rewriting the flow.

### Subscription access

When a mentee's subscription runs out, they cannot access:

- Mentor chat
- Resources
- Sessions

## Post-launch

- Mentor availability syncs to an external calendar or Calendly.
