
-- Trigger functions: not meant to be called by clients
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role used in RLS expressions; keep callable by authenticated only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Tighten failed_login_attempts insert
DROP POLICY IF EXISTS "anyone can log failed attempts" ON public.failed_login_attempts;
CREATE POLICY "log failed attempts" ON public.failed_login_attempts
  FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(email) <= 320);
