-- ============================================================
-- Sistèm Notifikasyon Push pou CEO-Admin
-- ============================================================
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  uid text not null unique,
  subscription jsonb not null,
  created_at timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subscriptions aksè total" on public.push_subscriptions;
create policy "push_subscriptions aksè total" on public.push_subscriptions for all using (true) with check (true);

notify pgrst, 'reload schema';

-- ============================================================
-- APRE w fin mete tout Environment Variables yo sou Vercel (gade
-- enstriksyon konplè yo), ale nan Supabase Dashboard:
-- Database > Webhooks > Create a new webhook
--   Name: notify-new-payment
--   Table: payment_requests
--   Events: Insert
--   Type: HTTP Request
--   URL: https://<domèn-vercel-ou>.vercel.app/api/send-push
--   Method: POST
--   Headers: x-webhook-secret = <menm valè PUSH_WEBHOOK_SECRET la>
-- ============================================================
