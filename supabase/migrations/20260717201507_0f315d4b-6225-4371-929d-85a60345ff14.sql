
CREATE TABLE public.newsletter_send_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.newsletter_schedules(id) ON DELETE SET NULL,
  issue_id UUID REFERENCES public.newsletter_issues(id) ON DELETE SET NULL,
  trigger_source TEXT NOT NULL CHECK (trigger_source IN ('schedule','manual_run','one_click','cron')),
  triggered_by UUID,
  title TEXT,
  recipients_total INTEGER NOT NULL DEFAULT 0,
  queued_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('running','completed','failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.newsletter_send_runs TO authenticated;
GRANT ALL ON public.newsletter_send_runs TO service_role;
ALTER TABLE public.newsletter_send_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view send runs"
  ON public.newsletter_send_runs FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_newsletter_send_runs_schedule ON public.newsletter_send_runs(schedule_id, started_at DESC);
CREATE INDEX idx_newsletter_send_runs_started ON public.newsletter_send_runs(started_at DESC);

CREATE TABLE public.newsletter_send_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.newsletter_send_runs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.newsletter_send_recipients TO authenticated;
GRANT ALL ON public.newsletter_send_recipients TO service_role;
ALTER TABLE public.newsletter_send_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view send recipients"
  ON public.newsletter_send_recipients FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_newsletter_send_recipients_run ON public.newsletter_send_recipients(run_id, status);
