-- =============================================================================
-- QR VAULT — INVOICES & TRANSACTIONS DATABASE TABLE
-- Run this script in the Supabase SQL Editor to support the transactions system
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,                       -- e.g., INV-20260705-XXXXXX
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,                        -- Formatted date string
  plan TEXT NOT NULL,                        -- Starter, Pro
  amount INTEGER NOT NULL,                   -- Price paid (e.g. 99, 199)
  expiry TEXT NOT NULL,                      -- Formatted expiry date string
  timestamp BIGINT NOT NULL,                 -- Linux timestamp milliseconds
  status TEXT DEFAULT 'successful'           -- successful, pending, failed
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Allow public select/update invoices
CREATE POLICY "Allow public select invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- SEED DATA (If you want to view a variety of transaction statuses in the Admin panel)
-- =============================================================================
-- Note: Replace the user_id with actual user profiles IDs if you want them linked to real users, 
-- or leave them empty if they represent unlinked visitor payment attempts.

INSERT INTO public.invoices (id, user_id, date, plan, amount, expiry, timestamp, status)
VALUES 
  ('INV-20260705-SEED1', NULL, '5 July 2026', 'Pro', 199, '5 August 2026', 1783262400000, 'successful'),
  ('INV-20260704-SEED2', NULL, '4 July 2026', 'Starter', 99, '4 August 2026', 1783176000000, 'pending'),
  ('INV-20260703-SEED3', NULL, '3 July 2026', 'Pro', 199, '3 August 2026', 1783089600000, 'failed'),
  ('INV-20260702-SEED4', NULL, '2 July 2026', 'Starter', 99, '2 August 2026', 1783003200000, 'pending')
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status;
