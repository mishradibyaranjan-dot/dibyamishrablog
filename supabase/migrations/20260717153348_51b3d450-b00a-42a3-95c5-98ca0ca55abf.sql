
CREATE TABLE public.newsletter_issue_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.newsletter_issues(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body_markdown TEXT NOT NULL DEFAULT '',
  linkedin_post TEXT NOT NULL DEFAULT '',
  hero_emoji TEXT NOT NULL DEFAULT '📰',
  status_at_snapshot TEXT NOT NULL DEFAULT 'draft',
  snapshot_reason TEXT NOT NULL DEFAULT 'save',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (issue_id, version_no)
);

CREATE INDEX idx_newsletter_versions_issue ON public.newsletter_issue_versions (issue_id, version_no DESC);

GRANT SELECT, INSERT ON public.newsletter_issue_versions TO authenticated;
GRANT ALL ON public.newsletter_issue_versions TO service_role;

ALTER TABLE public.newsletter_issue_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read newsletter versions"
  ON public.newsletter_issue_versions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE POLICY "Admins insert newsletter versions"
  ON public.newsletter_issue_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));
