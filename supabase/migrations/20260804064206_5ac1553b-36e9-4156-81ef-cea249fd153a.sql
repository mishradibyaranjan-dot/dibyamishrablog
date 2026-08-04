CREATE TABLE public.contact_email_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES public.contact_enquiries(id) ON DELETE CASCADE,
  kind text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL,
  attempt_no integer NOT NULL DEFAULT 1,
  trigger_source text NOT NULL DEFAULT 'auto',
  error_message text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_email_attempts_enquiry_idx
  ON public.contact_email_attempts (enquiry_id, created_at DESC);

GRANT SELECT ON public.contact_email_attempts TO authenticated;
GRANT ALL ON public.contact_email_attempts TO service_role;

ALTER TABLE public.contact_email_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view contact email attempts"
  ON public.contact_email_attempts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE POLICY "Service role manages contact email attempts"
  ON public.contact_email_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.contact_enquiries
  ADD COLUMN retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN last_attempt_at timestamptz,
  ADD COLUMN next_retry_at timestamptz,
  ADD COLUMN replied_at timestamptz;

CREATE INDEX contact_enquiries_next_retry_idx
  ON public.contact_enquiries (next_retry_at)
  WHERE next_retry_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.contact_enquiries_due_for_retry(_max_retries integer DEFAULT 4, _limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  subject text,
  message text,
  message_id text,
  notification_status text,
  confirmation_status text,
  retry_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.name, e.email, e.subject, e.message, e.message_id,
         e.notification_status, e.confirmation_status, e.retry_count
  FROM public.contact_enquiries e
  WHERE e.retry_count < _max_retries
    AND (e.notification_status IN ('failed','partial') OR e.confirmation_status = 'failed')
    AND (e.next_retry_at IS NULL OR e.next_retry_at <= now())
  ORDER BY e.created_at ASC
  LIMIT _limit;
$$;

REVOKE ALL ON FUNCTION public.contact_enquiries_due_for_retry(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.contact_enquiries_due_for_retry(integer, integer) TO service_role;