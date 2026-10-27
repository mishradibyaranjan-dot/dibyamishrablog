export function sourceDue(lastSync: string | null, minutes: number, now = Date.now()) {
  return !lastSync || Date.parse(lastSync) + minutes * 60_000 <= now;
}
export function retryDelayMinutes(failures: number) {
  return Math.min(1440, 15 * 2 ** Math.max(0, failures - 1));
}