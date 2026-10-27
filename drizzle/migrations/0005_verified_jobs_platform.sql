CREATE TABLE public.job_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  provider text NOT NULL,
  board_token text,
  status text NOT NULL DEFAULT 'connected',
  poll_minutes int NOT NULL DEFAULT 15,
  terms_note text,
  last_synced_at timestamptz,
  last_error text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_sources TO anon, authenticated;
GRANT ALL ON public.job_sources TO service_role;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view source registry" ON public.job_sources FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  source_id uuid NOT NULL REFERENCES public.job_sources(id) ON DELETE CASCADE,
  source_job_id text NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  location text,
  country text,
  work_arrangement text NOT NULL DEFAULT 'unspecified',
  employment_type text,
  categories text[] NOT NULL DEFAULT '{}',
  career_level text NOT NULL DEFAULT 'unclassified',
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  summary text,
  source_url text NOT NULL,
  apply_url text NOT NULL,
  original_posted_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  verification_status text NOT NULL DEFAULT 'PENDING',
  application_status text NOT NULL DEFAULT 'OPEN',
  source_access_status text NOT NULL DEFAULT 'AUTHORIZED',
  verification_notes text,
  dedupe_key text NOT NULL,
  is_primary boolean NOT NULL DEFAULT true,
  search tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, coalesce(title,'') || ' ' || coalesce(company,'') || ' ' || coalesce(location,'') || ' ' || coalesce(summary,''))) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, source_job_id)
);
CREATE INDEX jobs_posted_idx ON public.jobs (original_posted_at DESC);
CREATE INDEX jobs_search_idx ON public.jobs USING gin (search);
CREATE INDEX jobs_dedupe_idx ON public.jobs (dedupe_key);
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
-- The 24-hour freshness rule is enforced here, independent of any cleanup worker.
CREATE POLICY "Public sees only fresh verified open jobs" ON public.jobs FOR SELECT TO anon, authenticated USING (
  verification_status = 'VERIFIED' AND application_status = 'OPEN' AND source_access_status = 'AUTHORIZED'
  AND is_primary AND original_posted_at <= now() AND original_posted_at > now() - interval '24 hours'
  AND expires_at > now() AND last_verified_at > now() - interval '3 hours'
);

CREATE TABLE public.source_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.job_sources(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  fetched int NOT NULL DEFAULT 0,
  accepted int NOT NULL DEFAULT 0,
  rejected int NOT NULL DEFAULT 0,
  closed int NOT NULL DEFAULT 0,
  error text
);
GRANT ALL ON public.source_sync_runs TO service_role;
ALTER TABLE public.source_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reported_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.reported_jobs TO service_role;
ALTER TABLE public.reported_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.job_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  job_id uuid,
  action text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.job_admin_audit TO service_role;
ALTER TABLE public.job_admin_audit ENABLE ROW LEVEL SECURITY;