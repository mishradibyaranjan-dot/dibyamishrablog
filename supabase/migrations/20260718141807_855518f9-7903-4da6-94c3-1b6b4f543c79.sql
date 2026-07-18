
REVOKE ALL ON FUNCTION public.log_blocked_login_attempt(text, text) FROM anon, authenticated, PUBLIC;
DROP FUNCTION IF EXISTS public.log_blocked_login_attempt(text, text);
