DO $$ BEGIN PERFORM cron.unschedule('monthly-newsletter'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.newsletter_send_runs SET status = 'failed', error_message = 'Timed out', finished_at = now()
WHERE status = 'running' AND started_at < now() - interval '1 hour';

INSERT INTO public.newsletter_schedules (name, cadence, hour_utc, day_of_week, day_of_month, active, next_run_at, created_by)
SELECT 'Weekly newsletter', 'weekly', 4, 1, NULL, true,
  date_trunc('week', now()) + interval '7 days' + interval '4 hours',
  (SELECT id FROM auth.users WHERE email = 'mishra.dibyaranjan@gmail.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_schedules WHERE cadence = 'weekly');

INSERT INTO public.newsletter_schedules (name, cadence, hour_utc, day_of_week, day_of_month, active, next_run_at, created_by)
SELECT 'Monthly newsletter', 'monthly', 5, NULL, 1, true,
  date_trunc('month', now()) + interval '1 month' + interval '5 hours',
  (SELECT id FROM auth.users WHERE email = 'mishra.dibyaranjan@gmail.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_schedules WHERE cadence = 'monthly');