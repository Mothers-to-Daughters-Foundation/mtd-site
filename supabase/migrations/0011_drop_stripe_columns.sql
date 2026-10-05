-- Remove Stripe columns; the app uses Zeffy links + a stub activation webhook.
alter table public.plans drop column if exists stripe_price_id;
alter table public.subscriptions drop column if exists stripe_subscription_id;
