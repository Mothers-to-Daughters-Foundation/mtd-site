# Fix list

Findings from the local app against project `vhtnwxbfpnzjslctabyv`. Not implemented.

## 1. Stay signed in on “Back to site”, and show a profile control

**What happens now**

- “← Back to site” in `src/components/dashboard/DashboardSidebar.tsx` is only a link to `/`. It does not call `signOut`. Sign out is a separate button.
- The public header in `src/components/layout/SiteHeader.tsx` always renders **Sign In**. It never reads the session, so a signed-in person looks logged out as soon as they leave the dashboard.
- Session refresh only runs for `/dashboard/:path*`, `/login`, and `/register` (`src/middleware.ts`). The marketing site does not refresh the Supabase session.

**Fix**

- Leave “Back to site” as navigation. Do not sign the user out.
- Run session refresh on public pages as well, so the cookie stays valid while they browse the site.
- When a session exists, replace **Sign In** in the top right with that person’s profile (name and photo). The control links to their profile:
  - Mentor → `/dashboard/mentor/profile`
  - Mentee → `/dashboard/mentee/profile`
  - Admin → `/dashboard/admin`
- When there is no session, keep **Sign In**.

## 2. Notification bell in that same header spot

**What happens now**

- `notifications` already exists. Rows have `type`, `title`, `message`, `related_id`, `is_read`. Known types include `new_message` and `resource` (`src/lib/notifications.ts`).
- `NotificationProvider` only wraps the dashboard (`src/app/dashboard/layout.tsx`). The public header has no bell.

**Fix**

- If the person is signed in, show a bell next to the profile control.
- The popover lists their notifications, newest first, with an unread count.
- A new message and a newly shared resource should create a notification the bell can show.
- Mark an item read when it is opened.

## 3. Messaging crashes with Postgres `42P17`

**What happens now**

Opening Messages throws and the dashboard error boundary replaces the page. The browser only shows `{code: "42P17", ...}` because the server component throws before render.

Reproduced against the API as a signed-in user:

| Request | Result |
| --- | --- |
| `conversation_members` | `500` — `infinite recursion detected in policy for relation "conversation_members"` |
| `messages` | `500` — same recursion, because that policy reads `conversation_members` |
| `conversations` | `200` |

`src/app/dashboard/messages/page.tsx` calls `getMyConversations()` in `src/lib/models/messages.ts`, which selects `conversation_members` first and throws. `src/app/dashboard/messages/messagesclient.tsx` also reads `conversation_members` and `messages` directly from the browser.

The rows are readable with the service role. This is the row-level security policy, not missing tables. No policy SQL for these tables is in the repo. Test mentor `mentor@mtd.org` has no conversation membership, but the page still crashes on the policy before it can show an empty list.

**Fix**

- Replace the recursive `conversation_members` policy. A policy that subqueries `conversation_members` from inside `conversation_members` loops. Membership for that table should be `user_id = auth.uid()` only.
- Policies on `messages` may check membership through a `SECURITY DEFINER` function (so they do not re-enter the recursive policy).
- After that, `/dashboard/messages` should render. An account with no conversations should see the existing empty state, not an error boundary.

## 4. Mentors can drop in a resource that all mentees receive

**What happens now**

- `/dashboard/mentor/resources` is a read-only list (`src/app/dashboard/mentor/resources/page.tsx`).
- Creating a resource is admin-only (`POST /api/resources` in `src/app/api/resources/route.ts`).
- `getResourcesForUser` shows mentees `public` and `mentee_only`, and mentors `public` and `mentor_only` (`src/lib/models/resources.ts`). A file saved as `mentee_only` would reach mentees and disappear from the mentor’s own list.
- The `resources` storage bucket is private. Download permission in `src/app/api/resources/[id]/download/route.ts` does not allow the uploader to fetch a `mentee_only` file.

**Fix**

- On the mentor Resources page, add upload and drag-and-drop.
- Save the file in the `resources` bucket and insert a `resources` row with `visibility: mentee_only` and `uploaded_by` set to that mentor.
- Every mentee then sees it in their Resources list. The mentor still sees the files they shared.
- Allow download for the uploader, and for every mentee when visibility is `mentee_only`.
- Create a `resource` notification for mentees so the bell in item 2 can show it.

## 5. Rounded profile photo for mentors and mentees

**What happens now**

- `user_profiles.avatar_url` exists, and the public `avatars` storage bucket already exists.
- Mentor and mentee profile forms (`src/app/dashboard/mentor/profile/page.tsx`, `src/app/dashboard/mentee/profile/page.tsx`) never set a photo.

**Fix**

- Let both roles pick an image on their profile page.
- Center-crop it to a square before upload, store it in `avatars`, and save the public URL on `avatar_url`.
- Show it as a circle (`border-radius: 50%`) on the profile page and in the header control from item 1.

## 6. Docked chat on the site while browsing

**What happens now**

- Chat exists only as the full page at `/dashboard/messages`.
- It cannot load until item 3 is fixed.

**Fix**

- After messaging works, add a docked chat panel on the site for signed-in users so they can keep browsing.
- Collapsed state shows an unread count. New messages also show up in the header bell (item 2).
- Use the existing `conversations`, `conversation_members`, and `messages` tables. A third-party widget from GitHub would still have to be wired to those tables, so it is not a substitute for the policy fix. Prefer docking this app’s own thread list.
- Hide the dock on `/dashboard/messages`, where the full page is already open.

## 7. Activate a plan, then show the three plan cards

**What happens now**

- The mentee dashboard Subscription card says **No active plan** and has no action (`src/app/dashboard/mentee/page.tsx`).
- The Subscription page (`src/app/dashboard/mentee/subscription/page.tsx`) is built to render plan cards, but it loads them from `GET /api/admin/tiers`.
- That route is admin-only and returns `{ plans: [...] }`, not an array (`src/app/api/admin/tiers/route.ts`). A mentee gets 403, so the page treats the result as no plans and the card grid stays empty.
- The three active plans already exist in `plans`:

| Plan | Slug | Stored monthly price | Shown on a card (price ÷ 100) |
| --- | --- | --- | --- |
| Free | `free` | 0 | $0.00/mo |
| Growth | `growth` | 5000 | $50.00/mo |
| Premium | `premium` | 12000 | $120.00/mo |

- The public membership page (`src/app/(site)/membership/page.tsx`) already turns those rows into cards through `getPublicPlans()`. The mentee subscription page does not use that path.

**Fix**

- On the dashboard card, when there is no active plan, add an **Activate** button that goes to `/dashboard/mentee/subscription`.
- On that page, show the three defined plans as cards: **Free**, **Growth**, and **Premium**, using the active rows in `plans` (name, description, monthly price, mentor limit, session limit, resource access, priority support).
- Load them with a mentee-accessible query, the same set `getPublicPlans()` already returns. Do not call the admin tiers route.
- Each card keeps a subscribe action. The current plan, once one exists, stays marked on its card.

## Suggested order

1. Item 3, so Messages stops crashing.
2. Item 1, so leaving the dashboard no longer looks like a logout.
3. Item 6 and item 2 together, since both depend on a working message and notification path.
4. Item 4, then item 5.
5. Item 7, so a mentee can activate Free, Growth, or Premium.
