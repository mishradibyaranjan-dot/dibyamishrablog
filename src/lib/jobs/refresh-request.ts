import { z } from 'zod';

export const refreshRequest = z.object({ mode: z.enum(['dispatch','source','maintenance']).default('dispatch'), sourceSlug: z.string().regex(/^[a-z0-9-]+$/).max(100).optional(), force: z.boolean().default(false) }).strict().refine(input => input.mode !== 'source' || Boolean(input.sourceSlug), 'Missing source');
const origins = new Set(['https://www.dibyamishra.co.in','https://dibyamishra.co.in','https://dibyamishrablog.lovable.app','https://project--afb27601-9db8-4f5f-bd9a-50ae5eee7ddc.lovable.app','https://project--afb27601-9db8-4f5f-bd9a-50ae5eee7ddc-dev.lovable.app']);
export function refreshDispatchUrl(input: string) {
  const url = new URL(input);
  if (!origins.has(url.origin) || url.username || url.password) throw new Error('Refresh requires a trusted published or preview origin');
  return `${url.origin}/api/public/cron/jobs-sync`;
}