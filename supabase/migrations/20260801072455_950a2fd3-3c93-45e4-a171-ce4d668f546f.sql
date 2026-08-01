SELECT cron.schedule(
  'visitor-audit-spike-alerts',
  '*/15 * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--afb27601-9db8-4f5f-bd9a-50ae5eee7ddc.lovable.app/api/public/cron/visitor-audit-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $cron$
);