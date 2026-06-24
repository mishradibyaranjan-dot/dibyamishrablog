-- Recreate policies to use private.has_role instead of public.has_role
DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin sessions select" ON public.login_sessions;
DROP POLICY IF EXISTS "admin activity select" ON public.user_activity;
DROP POLICY IF EXISTS "admin visits select" ON public.page_visits;
DROP POLICY IF EXISTS "admin tab select" ON public.tab_access;
DROP POLICY IF EXISTS "admin search select" ON public.search_queries;
DROP POLICY IF EXISTS "admin chat select" ON public.chatbot_messages;
DROP POLICY IF EXISTS "admin resource select" ON public.resource_access;
DROP POLICY IF EXISTS "admin read failed" ON public.failed_login_attempts;

CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin sessions select" ON public.login_sessions FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin activity select" ON public.user_activity FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin visits select" ON public.page_visits FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin tab select" ON public.tab_access FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin search select" ON public.search_queries FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin chat select" ON public.chatbot_messages FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin resource select" ON public.resource_access FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin read failed" ON public.failed_login_attempts FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- Drop public-schema wrapper entirely so it's no longer exposed via PostgREST
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);