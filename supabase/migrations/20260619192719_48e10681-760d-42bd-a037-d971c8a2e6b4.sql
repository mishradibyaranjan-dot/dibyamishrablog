
-- Fix chatbot_messages: require user_id = auth.uid() on insert (no NULL ownership)
DROP POLICY IF EXISTS "own chat insert" ON public.chatbot_messages;
CREATE POLICY "own chat insert" ON public.chatbot_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Lock down failed_login_attempts: only service_role may write
DROP POLICY IF EXISTS "log failed attempts" ON public.failed_login_attempts;
REVOKE INSERT ON public.failed_login_attempts FROM anon, authenticated;

-- Tighten SECURITY DEFINER function: restrict EXECUTE on has_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
