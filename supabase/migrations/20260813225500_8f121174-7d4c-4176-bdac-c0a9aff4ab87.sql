-- Explicit restrictive deny-write policies for sensitive security/audit tables.
-- RESTRICTIVE + WITH CHECK(false)/USING(false) means anon/authenticated can never
-- write, even if a permissive policy is added later. service_role bypasses RLS.

-- email_send_state: no client access at all
REVOKE ALL ON public.email_send_state FROM anon, authenticated;
DROP POLICY IF EXISTS "Deny client access to email send state" ON public.email_send_state;
CREATE POLICY "Deny client access to email send state"
  ON public.email_send_state AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- failed_login_attempts
REVOKE INSERT, UPDATE, DELETE ON public.failed_login_attempts FROM anon, authenticated;
DROP POLICY IF EXISTS "Deny client writes on failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Deny client writes on failed login attempts"
  ON public.failed_login_attempts AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client updates on failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Deny client updates on failed login attempts"
  ON public.failed_login_attempts AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client deletes on failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Deny client deletes on failed login attempts"
  ON public.failed_login_attempts AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

-- ip_blocks
REVOKE INSERT, UPDATE, DELETE ON public.ip_blocks FROM anon, authenticated;
DROP POLICY IF EXISTS "Deny client writes on ip blocks" ON public.ip_blocks;
CREATE POLICY "Deny client writes on ip blocks"
  ON public.ip_blocks AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client updates on ip blocks" ON public.ip_blocks;
CREATE POLICY "Deny client updates on ip blocks"
  ON public.ip_blocks AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client deletes on ip blocks" ON public.ip_blocks;
CREATE POLICY "Deny client deletes on ip blocks"
  ON public.ip_blocks AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

-- security_events
REVOKE INSERT, UPDATE, DELETE ON public.security_events FROM anon, authenticated;
DROP POLICY IF EXISTS "Deny client writes on security events" ON public.security_events;
CREATE POLICY "Deny client writes on security events"
  ON public.security_events AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client updates on security events" ON public.security_events;
CREATE POLICY "Deny client updates on security events"
  ON public.security_events AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client deletes on security events" ON public.security_events;
CREATE POLICY "Deny client deletes on security events"
  ON public.security_events AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

-- spam_audit_log
REVOKE INSERT, UPDATE, DELETE ON public.spam_audit_log FROM anon, authenticated;
DROP POLICY IF EXISTS "Deny client writes on spam audit log" ON public.spam_audit_log;
CREATE POLICY "Deny client writes on spam audit log"
  ON public.spam_audit_log AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client updates on spam audit log" ON public.spam_audit_log;
CREATE POLICY "Deny client updates on spam audit log"
  ON public.spam_audit_log AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Deny client deletes on spam audit log" ON public.spam_audit_log;
CREATE POLICY "Deny client deletes on spam audit log"
  ON public.spam_audit_log AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

GRANT ALL ON public.email_send_state TO service_role;
GRANT ALL ON public.failed_login_attempts TO service_role;
GRANT ALL ON public.ip_blocks TO service_role;
GRANT ALL ON public.security_events TO service_role;
GRANT ALL ON public.spam_audit_log TO service_role;
GRANT SELECT ON public.failed_login_attempts TO authenticated;
GRANT SELECT ON public.ip_blocks TO authenticated;
GRANT SELECT ON public.security_events TO authenticated;
GRANT SELECT ON public.spam_audit_log TO authenticated;