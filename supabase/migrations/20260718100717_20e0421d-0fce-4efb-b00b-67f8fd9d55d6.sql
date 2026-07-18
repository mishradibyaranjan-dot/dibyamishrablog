
CREATE TABLE public.visitor_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  path TEXT,
  referrer TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  language TEXT,
  timezone TEXT,
  screen TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.visitor_logs TO service_role;
GRANT SELECT ON public.visitor_logs TO authenticated;
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read visitor logs" ON public.visitor_logs
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role)
  );
CREATE INDEX idx_visitor_logs_visitor ON public.visitor_logs(visitor_id, created_at DESC);
CREATE INDEX idx_visitor_logs_created ON public.visitor_logs(created_at DESC);
CREATE INDEX idx_visitor_logs_user ON public.visitor_logs(user_id) WHERE user_id IS NOT NULL;

CREATE TABLE public.visitors (
  visitor_id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  display_name TEXT,
  first_ip TEXT,
  last_ip TEXT,
  first_country TEXT,
  last_country TEXT,
  last_city TEXT,
  first_referrer TEXT,
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  user_agent TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_pageviews INTEGER NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  identified_at TIMESTAMPTZ
);
GRANT ALL ON public.visitors TO service_role;
GRANT SELECT ON public.visitors TO authenticated;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read visitors" ON public.visitors
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role)
  );
CREATE INDEX idx_visitors_last_seen ON public.visitors(last_seen_at DESC);
CREATE INDEX idx_visitors_user ON public.visitors(user_id) WHERE user_id IS NOT NULL;
