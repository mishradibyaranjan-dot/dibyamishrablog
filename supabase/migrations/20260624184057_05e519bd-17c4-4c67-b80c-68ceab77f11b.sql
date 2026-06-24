-- Lock down user_roles writes: explicit deny policies so privilege escalation is impossible
CREATE POLICY "deny user role inserts" ON public.user_roles FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "deny user role updates" ON public.user_roles FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "deny user role deletes" ON public.user_roles FOR DELETE TO authenticated, anon USING (false);

-- Restrict has_role direct execution: only needed by Postgres internals during RLS evaluation.
-- Revoking from authenticated still allows RLS policies to call it (policy expressions run as the policy owner's privilege check on the function via SECURITY DEFINER chain through Postgres), but actually policies are evaluated as the calling role.
-- To remain functional for RLS while no longer being directly callable via RPC, move the function to a non-API schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;

-- Recreate in private schema, callable only by postgres/service_role, then wrap in public via SECURITY DEFINER that only checks own row
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Update public.has_role to delegate (kept for existing RLS policies) but restrict direct RPC by keeping it out of api exposure via revoke; re-grant minimal needed
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;