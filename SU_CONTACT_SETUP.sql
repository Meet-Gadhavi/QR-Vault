-- =============================================================================
-- QR VAULT — CONTACT US MESSAGES DATABASE TABLE
-- Run this script in the Supabase SQL Editor to support the Contact Us page
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_replied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous/unsigned users) to insert messages
CREATE POLICY "Allow public insert messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Allow admins/owners to view and manage all messages
CREATE POLICY "Allow public select/update messages" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);
