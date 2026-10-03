-- Performance: add indexes on foreign-key columns (advisor:
-- unindexed_foreign_keys) to speed up joins and cascading deletes.
-- Idempotent.

create index if not exists idx_mentor_requests_reviewed_by on public.mentor_requests (reviewed_by);
create index if not exists idx_mentor_requests_user_id on public.mentor_requests (user_id);
create index if not exists idx_mentorship_requests_mentee_id on public.mentorship_requests (mentee_id);
create index if not exists idx_mentorship_requests_mentor_id on public.mentorship_requests (mentor_id);
create index if not exists idx_mentorships_created_by on public.mentorships (created_by);
create index if not exists idx_mentorships_mentorship_request_id on public.mentorships (mentorship_request_id);
create index if not exists idx_payments_subscription_id on public.payments (subscription_id);
create index if not exists idx_payments_user_id on public.payments (user_id);
create index if not exists idx_sessions_cancelled_by on public.sessions (cancelled_by);
create index if not exists idx_subscriptions_plan_id on public.subscriptions (plan_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);
