ALTER TABLE public.newsletter_send_runs
  ADD COLUMN IF NOT EXISTS linkedin_status text,
  ADD COLUMN IF NOT EXISTS linkedin_error text;