
DO $$ BEGIN
  CREATE TYPE public.security_severity AS ENUM ('low','medium','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity public.security_severity NOT NULL DEFAULT 'low',
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  target_path text,
  user_id uuid,
  user_email text,
  action_taken text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.security_events TO authenticated;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read security events"
  ON public.security_events FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_sec_events_created ON public.security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sec_events_ip ON public.security_events (ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sec_events_type ON public.security_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sec_events_severity ON public.security_events (severity, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL,
  severity public.security_severity NOT NULL DEFAULT 'medium',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
GRANT SELECT ON public.ip_blocks TO authenticated;
GRANT ALL ON public.ip_blocks TO service_role;
ALTER TABLE public.ip_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read ip blocks"
  ON public.ip_blocks FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_ip_blocks_active ON public.ip_blocks (ip_address, expires_at);

CREATE TABLE IF NOT EXISTS public.disposable_email_domains (
  domain text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disposable_email_domains TO authenticated, anon;
GRANT ALL ON public.disposable_email_domains TO service_role;
ALTER TABLE public.disposable_email_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read disposable domains"
  ON public.disposable_email_domains FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.disposable_email_domains (domain) VALUES
  ('mailinator.com'),('guerrillamail.com'),('guerrillamail.info'),('guerrillamail.biz'),
  ('sharklasers.com'),('grr.la'),('yopmail.com'),('yopmail.fr'),('trashmail.com'),
  ('trashmail.net'),('10minutemail.com'),('10minutemail.net'),('temp-mail.org'),
  ('tempmail.com'),('tempmailo.com'),('tmpmail.org'),('dispostable.com'),
  ('maildrop.cc'),('getnada.com'),('nada.email'),('fakeinbox.com'),
  ('throwawaymail.com'),('mytemp.email'),('mailnesia.com'),('mailcatch.com'),
  ('spam4.me'),('mohmal.com'),('emailondeck.com'),('luckfeed.com'),
  ('mvrht.net'),('binkmail.com'),('spambog.com'),('mintemail.com'),
  ('inboxbear.com'),('tempinbox.com'),('mailtemp.info'),('emlpro.com'),
  ('anonymbox.com'),('temp-mail.io'),('mail.tm'),('mailtemporaire.fr'),
  ('mail-temp.com'),('crazymailing.com'),('deadaddress.com'),('vomoto.com'),
  ('mail7.io'),('trbvm.com'),('einrot.com'),('spamgourmet.com')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_ip_blocked(_ip text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ip_blocks
    WHERE ip_address = _ip
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_disposable_email(_email text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _d text;
BEGIN
  IF _email IS NULL THEN RETURN false; END IF;
  _d := lower(split_part(trim(_email),'@',2));
  IF _d = '' THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM public.disposable_email_domains WHERE domain = _d);
END; $$;

CREATE OR REPLACE FUNCTION public.count_recent_failed_logins(_ip text, _minutes int DEFAULT 15)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::int FROM public.security_events
  WHERE event_type = 'failed_login'
    AND ip_address = _ip
    AND created_at > now() - make_interval(mins => _minutes);
$$;

CREATE OR REPLACE FUNCTION public.purge_expired_ip_blocks()
RETURNS int LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH d AS (DELETE FROM public.ip_blocks WHERE expires_at IS NOT NULL AND expires_at < now() RETURNING 1)
  SELECT COUNT(*)::int FROM d;
$$;
