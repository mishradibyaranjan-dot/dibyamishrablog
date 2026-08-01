CREATE TABLE public.visitor_audit_settings (
  id integer NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  retention_days integer NOT NULL DEFAULT 30,
  alerts_enabled boolean NOT NULL DEFAULT true,
  alert_window_minutes integer NOT NULL DEFAULT 60,
  alert_min_events integer NOT NULL DEFAULT 20,
  alert_failure_pct integer NOT NULL DEFAULT 30,
  last_alert_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.visitor_audit_settings TO authenticated;
GRANT ALL ON public.visitor_audit_settings TO service_role;

ALTER TABLE public.visitor_audit_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view visitor audit settings"
  ON public.visitor_audit_settings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE POLICY "Deny client writes on visitor_audit_settings"
  ON public.visitor_audit_settings
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

INSERT INTO public.visitor_audit_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.purge_visitor_tracking_audit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _days integer;
  _deleted integer;
BEGIN
  SELECT retention_days INTO _days FROM public.visitor_audit_settings WHERE id = 1;
  IF _days IS NULL OR _days < 1 THEN _days := 30; END IF;
  DELETE FROM public.visitor_tracking_audit
  WHERE created_at < now() - make_interval(days => _days);
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_visitor_tracking_audit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_visitor_tracking_audit() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'purge-visitor-tracking-audit',
  '17 */6 * * *',
  $$ SELECT public.purge_visitor_tracking_audit(); $$
);

SELECT cron.schedule(
  'visitor-audit-spike-alerts',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--afb27601-9db8-4f5f-bd9a-50ae5eee7ddc.lovable.app/api/public/cron/visitor-audit-alerts',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eGhvYnppYm1xeGVxdWlkZW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODA0MzQsImV4cCI6MjA5NzQ1NjQzNH0.dUIs1cxQZ94hhmIMs95pWafP4kIdrt1JRFsXPOVfNQc"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);