DROP POLICY IF EXISTS "Deny client writes on visitor_logs" ON public.visitor_logs;
CREATE POLICY "Deny client writes on visitor_logs"
  ON public.visitor_logs
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny anon writes on visitors" ON public.visitors;
DROP POLICY IF EXISTS "Deny client writes on visitors" ON public.visitors;
CREATE POLICY "Deny client writes on visitors"
  ON public.visitors
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);