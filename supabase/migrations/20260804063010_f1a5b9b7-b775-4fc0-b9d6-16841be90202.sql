CREATE TABLE public.contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  ip_hash text,
  user_agent text,
  status text NOT NULL DEFAULT 'new',
  notification_status text NOT NULL DEFAULT 'pending',
  confirmation_status text NOT NULL DEFAULT 'pending',
  error_message text,
  message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.contact_enquiries TO authenticated;
GRANT ALL ON public.contact_enquiries TO service_role;

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read contact enquiries"
  ON public.contact_enquiries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Admins can update contact enquiries"
  ON public.contact_enquiries FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Service role manages contact enquiries"
  ON public.contact_enquiries FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX contact_enquiries_created_at_idx ON public.contact_enquiries (created_at DESC);
CREATE INDEX contact_enquiries_ip_hash_idx ON public.contact_enquiries (ip_hash, created_at DESC);

CREATE TRIGGER contact_enquiries_touch
  BEFORE UPDATE ON public.contact_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.count_recent_contact_submissions(_ip_hash text, _minutes integer DEFAULT 10)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.contact_enquiries
  WHERE ip_hash = _ip_hash
    AND created_at > now() - make_interval(mins => _minutes);
$$;

REVOKE ALL ON FUNCTION public.count_recent_contact_submissions(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.count_recent_contact_submissions(text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.count_recent_contact_submissions(text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.count_recent_contact_submissions(text, integer) TO service_role;