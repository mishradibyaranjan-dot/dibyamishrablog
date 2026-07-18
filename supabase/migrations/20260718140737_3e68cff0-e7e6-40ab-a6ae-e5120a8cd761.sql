
ALTER FUNCTION public.is_blocked_email(text) SECURITY INVOKER;
ALTER FUNCTION public.reject_blocked_email() SECURITY INVOKER;

REVOKE ALL ON FUNCTION public.reject_blocked_email() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_blocked_email() TO service_role;
