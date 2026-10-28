import { z } from 'zod';
import { refreshDispatchUrl } from './refresh-request';

export async function dispatchJobRefresh(url: string, force = false) {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('Refresh authorization is not configured');
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const { data, error } = await db.rpc('dispatch_job_refresh', { p_url: refreshDispatchUrl(url), p_secret: secret, p_force: force });
  if (error) throw new Error('Could not dispatch refresh');
  return z.array(z.object({ source: z.string(), status: z.literal('queued') })).parse(data);
}