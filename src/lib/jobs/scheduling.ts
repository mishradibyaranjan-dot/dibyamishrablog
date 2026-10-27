/** Operational schedule: UTC cron times corresponding to the four India-time refreshes. */
export const JOB_REFRESH_CRON_UTC = "30 1,6,10,15 * * *";

export function sourceDue(lastSync: string | null, minutes: number, now = Date.now()) {
  return !lastSync || Date.parse(lastSync) + minutes * 60_000 <= now;
}
export function retryDelayMinutes(failures: number) {
  return Math.min(1440, 15 * 2 ** Math.max(0, failures - 1));
}