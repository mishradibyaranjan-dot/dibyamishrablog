
-- =========================
-- Roles enum + user_roles
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile + grant admin to designated email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'mishra.dibyaranjan@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Activity / tracking tables
-- =========================

-- login_sessions
CREATE TABLE public.login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  ip TEXT,
  user_agent TEXT
);
GRANT SELECT, INSERT, UPDATE ON public.login_sessions TO authenticated;
GRANT ALL ON public.login_sessions TO service_role;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.login_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin sessions select" ON public.login_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own sessions insert" ON public.login_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sessions update" ON public.login_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_activity (generic event log)
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target TEXT,
  metadata JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.user_activity TO authenticated;
GRANT ALL ON public.user_activity TO service_role;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity select" ON public.user_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin activity select" ON public.user_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own activity insert" ON public.user_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- page_visits
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  referrer TEXT,
  duration_seconds INTEGER,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own visits select" ON public.page_visits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin visits select" ON public.page_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own visits insert" ON public.page_visits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own visits update" ON public.page_visits FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- tab_access
CREATE TABLE public.tab_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  tab_id TEXT NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.tab_access TO authenticated;
GRANT ALL ON public.tab_access TO service_role;
ALTER TABLE public.tab_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tab select" ON public.tab_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin tab select" ON public.tab_access FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own tab insert" ON public.tab_access FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- search_queries
CREATE TABLE public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.search_queries TO authenticated;
GRANT ALL ON public.search_queries TO service_role;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own search select" ON public.search_queries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin search select" ON public.search_queries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own search insert" ON public.search_queries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- chatbot_messages
CREATE TABLE public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chatbot_messages TO authenticated;
GRANT ALL ON public.chatbot_messages TO service_role;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat select" ON public.chatbot_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin chat select" ON public.chatbot_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own chat insert" ON public.chatbot_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- resource_access
CREATE TABLE public.resource_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.resource_access TO authenticated;
GRANT ALL ON public.resource_access TO service_role;
ALTER TABLE public.resource_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resource select" ON public.resource_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin resource select" ON public.resource_access FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own resource insert" ON public.resource_access FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- failed_login_attempts (open insert; no auth context required)
CREATE TABLE public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip TEXT,
  reason TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.failed_login_attempts TO anon, authenticated;
GRANT SELECT ON public.failed_login_attempts TO authenticated;
GRANT ALL ON public.failed_login_attempts TO service_role;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log failed attempts" ON public.failed_login_attempts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read failed" ON public.failed_login_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Indexes
CREATE INDEX idx_login_sessions_user ON public.login_sessions(user_id, started_at DESC);
CREATE INDEX idx_user_activity_user ON public.user_activity(user_id, occurred_at DESC);
CREATE INDEX idx_page_visits_user ON public.page_visits(user_id, visited_at DESC);
CREATE INDEX idx_page_visits_path ON public.page_visits(path);
CREATE INDEX idx_tab_access_user ON public.tab_access(user_id, opened_at DESC);
CREATE INDEX idx_chatbot_user ON public.chatbot_messages(user_id, created_at DESC);
CREATE INDEX idx_chatbot_conv ON public.chatbot_messages(conversation_id, created_at);
