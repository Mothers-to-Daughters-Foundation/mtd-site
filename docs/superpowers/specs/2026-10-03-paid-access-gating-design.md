# Paid-Access Gating — Design

**Date:** 2026-10-03
**Status:** Approved (pending spec review)
**Roadmap item:** Launch — "Expired mentee subscriptions block mentor chat, resources, and sessions."

## Goal

Restrict three mentee features — **mentor chat, resources, and sessions** — to mentees
on an active **paid** subscription. Everyone else (no subscription, Free tier, expired,
cancelled, paused) sees an inline "upgrade to unlock" panel instead of the content, and
the backing APIs refuse the action. Mentors and admins are never gated.

## Access rule (source of truth)

A mentee **has access** when all hold:

- they have a subscription row with `is_current = true`;
- its plan is a **paid** tier (`plans.monthly_price > 0`, i.e. Growth/Premium);
- `status` is `active` or `trial`;
- `expires_at` is null **or** in the future (not expired).

Role override: `mentor` and `admin` always have access (they do not subscribe).

`reason` when blocked (drives CTA copy): `no_subscription`, `free_tier`, `expired`,
`cancelled`, `paused`.

**Fail-closed:** if the subscription/plan lookup throws, access is **denied** (locked
state shown). This protects the paid model; data itself is still protected by RLS
regardless.

## Components

### 1. `src/lib/access.ts`

- `type MenteeAccessReason = 'ok' | 'no_subscription' | 'free_tier' | 'expired' | 'cancelled' | 'paused';`
- `type MenteeAccess = { hasAccess: boolean; reason: MenteeAccessReason };`
- **Pure, unit-tested:** `evaluateMenteeAccess(role, subscription, plan, now): MenteeAccess`
  - Encapsulates all the rule logic above; no I/O.
- **Async wrapper:** `getMenteeAccess(userId): Promise<MenteeAccess>`
  - Reads the user's role (user_profiles), current subscription
    (`getSubscriptionByUserId`), and its plan (`getPlanById`) via the service-role
    client for reliability, then calls `evaluateMenteeAccess`. Catches errors →
    `{ hasAccess: false, reason: 'no_subscription' }` (fail-closed).

### 2. `src/components/dashboard/LockedFeature.tsx` (+ `.module.css`)

Reusable server/client-agnostic panel: lock icon, `feature` name, a reason-specific
message, and an "Upgrade" / "Choose a plan" button linking to
`/dashboard/mentee/subscription`. Rendered in place of gated content.

### 3. Gated server pages

Each fetches `getMenteeAccess(user.id)`; if `!hasAccess`, renders `<LockedFeature>`
instead of the real content:

- `src/app/dashboard/messages/page.tsx` (mentor chat)
- `src/app/dashboard/mentee/resources/page.tsx`
- `src/app/dashboard/mentee/sessions/page.tsx`

### 4. Gated APIs (server-enforced)

- `POST /api/messages` — 403 when the sender is a blocked mentee.
- `GET /api/resources/[id]/download` — a blocked mentee gets 403 for **any** download
  (the resources feature is gated as a whole). Admins, mentors, and the uploader are
  unaffected. The existing `canAccess` visibility check stays; the paid-gate is applied
  first, only for the `mentee` role.
- **New** `GET /api/me/access` — returns `{ hasAccess, reason }` for the signed-in user
  (used by the chat dock).

### 5. Chat dock (`src/components/chat/ChatDock.tsx`)

On load, calls `/api/me/access`. If blocked, the launcher shows a small lock badge and,
when opened, renders a compact upgrade prompt (link to the subscription page) instead of
threads/composer. Non-mentees and paid mentees behave exactly as today.

## Data flow

```
server page ─► getMenteeAccess(userId) ─► {role, subscription, plan} ─► evaluateMenteeAccess ─► hasAccess?
                                                                                   │
chat dock ─► GET /api/me/access ─────────────────────────────────────────────────┘
send/download API ─► getMenteeAccess(userId) ─► 403 if blocked
```

## Error handling

- Access lookup error → fail-closed (deny) + locked state (never a crash/500).
- APIs return 403 (not 500) for blocked mentees, with `{ error: 'Upgrade required' }`.
- Gated pages never throw on a blocked user — they render the locked panel.

## Testing

- **Unit (pure fn `evaluateMenteeAccess`):** no subscription; Free active; paid active;
  paid trial; paid expired (past `expires_at`); paid cancelled; paused; mentor/admin
  override. Each asserts `hasAccess` + `reason`. (Add a lightweight test runner if the
  repo has none; otherwise a `node:test` script under `scripts/` or `__tests__`.)
- **Manual/integration:** blocked mentee sees locked panels on the three pages; dock
  locks; `POST /api/messages` and the download route return 403; a paid (Growth/Premium)
  mentee passes through everywhere; mentor/admin unaffected. Verify against the live DB
  by toggling a test mentee's subscription row.

## Out of scope (YAGNI)

- Changing how subscriptions are created (Stripe/Zeffy flows) — separate roadmap item.
- Gating any feature beyond chat/resources/sessions.
- Grace periods / dunning emails on expiry — post-launch.
- Mentor-side gating (mentors are never gated).
