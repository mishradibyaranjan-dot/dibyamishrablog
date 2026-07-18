
REVOKE EXECUTE ON FUNCTION public.is_ip_blocked(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_disposable_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.count_recent_failed_logins(text, int) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_expired_ip_blocks() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_ip_blocked(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_disposable_email(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.count_recent_failed_logins(text, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_ip_blocks() TO service_role;
