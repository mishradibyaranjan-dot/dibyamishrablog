
CREATE TABLE public.spam_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL CHECK (action_type IN ('blocked_login_attempt','blocklist_add','blocklist_remove','blocklist_update')),
  email text,
  domain text,
  reason text,
  actor_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.spam_audit_log TO authenticated;
GRANT ALL ON public.spam_audit_log TO service_role;

CREATE INDEX spam_audit_log_created_at_idx ON public.spam_audit_log (created_at DESC);
CREATE INDEX spam_audit_log_action_type_idx ON public.spam_audit_log (action_type);
CREATE INDEX spam_audit_log_domain_idx ON public.spam_audit_log (domain);

ALTER TABLE public.spam_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view spam audit log"
  ON public.spam_audit_log FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.audit_blocked_domain_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.spam_audit_log (action_type, domain, reason, actor_id, metadata)
    VALUES ('blocklist_add', NEW.domain, NEW.reason, auth.uid(),
            jsonb_build_object('created_by', NEW.created_by));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.spam_audit_log (action_type, domain, reason, actor_id, metadata)
    VALUES ('blocklist_update', NEW.domain, NEW.reason, auth.uid(),
            jsonb_build_object('old_domain', OLD.domain, 'old_reason', OLD.reason));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.spam_audit_log (action_type, domain, reason, actor_id, metadata)
    VALUES ('blocklist_remove', OLD.domain, OLD.reason, auth.uid(), '{}'::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_blocked_domain_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_audit_blocked_domain_ins
  AFTER INSERT ON public.blocked_email_domains
  FOR EACH ROW EXECUTE FUNCTION public.audit_blocked_domain_change();

CREATE TRIGGER trg_audit_blocked_domain_upd
  AFTER UPDATE ON public.blocked_email_domains
  FOR EACH ROW EXECUTE FUNCTION public.audit_blocked_domain_change();

CREATE TRIGGER trg_audit_blocked_domain_del
  AFTER DELETE ON public.blocked_email_domains
  FOR EACH ROW EXECUTE FUNCTION public.audit_blocked_domain_change();

CREATE OR REPLACE FUNCTION public.log_blocked_login_attempt(_email text, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _domain text;
BEGIN
  IF _email IS NULL OR length(_email) > 320 THEN RETURN; END IF;
  _domain := lower(split_part(trim(_email), '@', 2));
  IF _domain = '' THEN RETURN; END IF;
  INSERT INTO public.spam_audit_log (action_type, email, domain, reason)
  VALUES ('blocked_login_attempt', lower(trim(_email)), _domain, _reason);
END;
$$;

REVOKE ALL ON FUNCTION public.log_blocked_login_attempt(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_blocked_login_attempt(text, text) TO anon, authenticated;
