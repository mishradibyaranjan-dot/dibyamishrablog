ALTER TABLE public.newsletter_issues DROP CONSTRAINT IF EXISTS newsletter_issues_status_check;
ALTER TABLE public.newsletter_issues ADD CONSTRAINT newsletter_issues_status_check
  CHECK (status IN ('draft','pending_approval','approved','published'));