
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe with valid email"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 3 AND 255
    AND email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
    AND status = 'active'
  );
