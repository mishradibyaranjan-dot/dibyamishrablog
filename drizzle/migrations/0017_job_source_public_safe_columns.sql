REVOKE ALL PRIVILEGES ON TABLE public.job_sources FROM anon, authenticated;
GRANT SELECT (id,slug,name,provider,status,poll_minutes,terms_note,last_synced_at,active) ON public.job_sources TO anon, authenticated;
GRANT ALL ON TABLE public.job_sources TO service_role;
COMMENT ON TABLE public.job_sources IS 'Public registry reads are limited to non-sensitive display columns; feed configuration, lock tokens and operational errors are service-role only.';