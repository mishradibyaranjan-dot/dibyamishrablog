
CREATE TABLE public.blocked_email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX blocked_email_domains_domain_idx ON public.blocked_email_domains (domain);

GRANT SELECT ON public.blocked_email_domains TO anon, authenticated;
GRANT ALL ON public.blocked_email_domains TO service_role;

ALTER TABLE public.blocked_email_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blocked domains"
  ON public.blocked_email_domains FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert blocked domains"
  ON public.blocked_email_domains FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "Admins can update blocked domains"
  ON public.blocked_email_domains FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "Admins can delete blocked domains"
  ON public.blocked_email_domains FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE OR REPLACE FUNCTION public.normalize_blocked_domain()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.domain := lower(trim(NEW.domain));
  IF NEW.domain IS NULL OR NEW.domain = '' OR NEW.domain NOT LIKE '%.%' THEN
    RAISE EXCEPTION 'Invalid domain: %', NEW.domain USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER normalize_blocked_domain_biu
  BEFORE INSERT OR UPDATE ON public.blocked_email_domains
  FOR EACH ROW EXECUTE FUNCTION public.normalize_blocked_domain();

CREATE OR REPLACE FUNCTION public.is_blocked_email(_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _domain text;
BEGIN
  IF _email IS NULL THEN RETURN false; END IF;
  _domain := lower(split_part(trim(_email), '@', 2));
  IF _domain = '' THEN RETURN false; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_email_domains b
    WHERE b.domain = _domain OR _domain LIKE ('%.' || b.domain)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_blocked_email(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reject_blocked_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND public.is_blocked_email(NEW.email) THEN
    RAISE EXCEPTION 'Email domain is not allowed'
      USING ERRCODE = '22023',
            HINT = 'This email domain has been blocked as spam.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reject_blocked_email_profiles
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.reject_blocked_email();

CREATE TRIGGER reject_blocked_email_newsletter
  BEFORE INSERT OR UPDATE OF email ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.reject_blocked_email();

INSERT INTO public.blocked_email_domains (domain, reason) VALUES
  ('luckfeed.com', 'spam'),
  ('mailinator.com', 'disposable'),
  ('guerrillamail.com', 'disposable'),
  ('guerrillamail.info', 'disposable'),
  ('sharklasers.com', 'disposable'),
  ('10minutemail.com', 'disposable'),
  ('10minutemail.net', 'disposable'),
  ('tempmail.com', 'disposable'),
  ('temp-mail.org', 'disposable'),
  ('tempmailo.com', 'disposable'),
  ('yopmail.com', 'disposable'),
  ('trashmail.com', 'disposable'),
  ('throwawaymail.com', 'disposable'),
  ('getnada.com', 'disposable'),
  ('dispostable.com', 'disposable'),
  ('maildrop.cc', 'disposable'),
  ('fakeinbox.com', 'disposable'),
  ('mintemail.com', 'disposable'),
  ('mohmal.com', 'disposable'),
  ('spam4.me', 'disposable'),
  ('mailnesia.com', 'disposable'),
  ('moakt.com', 'disposable'),
  ('emailondeck.com', 'disposable'),
  ('mytemp.email', 'disposable'),
  ('tempail.com', 'disposable'),
  ('dropmail.me', 'disposable'),
  ('mailpoof.com', 'disposable'),
  ('inboxbear.com', 'disposable')
ON CONFLICT (domain) DO NOTHING;
