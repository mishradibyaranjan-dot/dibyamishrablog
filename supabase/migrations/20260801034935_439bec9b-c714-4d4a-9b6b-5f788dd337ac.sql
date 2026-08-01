CREATE TABLE public.visitor_tracking_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outcome text NOT NULL,
  reason text,
  visitor_id text,
  session_id text,
  user_id uuid,
  identified boolean NOT NULL DEFAULT false,
  path text,
  ip_hash text,
  country text,
  user_agent text,
  duration_ms integer,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.visitor_tracking_audit TO authenticated;
GRANT ALL ON public.visitor_tracking_audit TO service_role;

ALTER TABLE public.visitor_tracking_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view visitor tracking audit"
  ON public.visitor_tracking_audit
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE POLICY "Deny client writes on visitor_tracking_audit"
  ON public.visitor_tracking_audit
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE INDEX idx_vta_created_at ON public.visitor_tracking_audit (created_at DESC);
CREATE INDEX idx_vta_outcome ON public.visitor_tracking_audit (outcome);
CREATE INDEX idx_vta_visitor ON public.visitor_tracking_audit (visitor_id);