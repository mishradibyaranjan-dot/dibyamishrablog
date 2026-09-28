DROP POLICY IF EXISTS "Anyone can read disposable domains" ON public.disposable_email_domains;
REVOKE ALL ON public.disposable_email_domains FROM anon, authenticated;
GRANT ALL ON public.disposable_email_domains TO service_role;