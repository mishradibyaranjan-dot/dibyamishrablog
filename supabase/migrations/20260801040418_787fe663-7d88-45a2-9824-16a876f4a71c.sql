ALTER TABLE public.visitor_audit_settings
  ADD COLUMN IF NOT EXISTS alert_email_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_slack_enabled boolean NOT NULL DEFAULT false;