
-- 1) blocked_email_domains: remove public SELECT; restrict to admins.
-- Keep is_blocked_email() usable by triggers and RPCs by making it SECURITY DEFINER.
DROP POLICY IF EXISTS "Anyone can read blocked domains" ON public.blocked_email_domains;

CREATE POLICY "Admins can read blocked domains"
  ON public.blocked_email_domains
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE OR REPLACE FUNCTION public.is_blocked_email(_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

GRANT EXECUTE ON FUNCTION public.is_blocked_email(text) TO anon, authenticated;

-- 2) visitors: make write-denial explicit for anon/authenticated (writes only via service role).
CREATE POLICY "Deny anon writes on visitors"
  ON public.visitors
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
