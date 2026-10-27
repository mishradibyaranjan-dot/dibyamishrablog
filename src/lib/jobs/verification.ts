import { checkApplyUrl } from "./rules";

const ATS_HOSTS: Record<string, string[]> = {
  greenhouse: ["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io"],
  lever: ["jobs.lever.co"], ashby: ["jobs.ashbyhq.com"],
};

export function approvedDestination(url: string, provider: string, board: string | null, original: string) {
  if (!checkApplyUrl(url).ok) return false;
  const u = new URL(url);
  const originalHost = new URL(original).hostname;
  if ((ATS_HOSTS[provider] ?? []).includes(u.hostname)) return Boolean(board && u.pathname.toLowerCase().startsWith(`/${board.toLowerCase()}/`));
  // Employer-custom career domains require explicit source configuration, not arbitrary feed-provided trust.
  return provider === "remoteok" && u.hostname === "remoteok.com" && originalHost === "remoteok.com" && u.pathname.startsWith("/remote-jobs/");
}

export function safeSnapshot(previous: number, current: number) {
  return previous < 10 || current >= previous * 0.5;
}

export function canonicalApplication(url: string) {
  const u = new URL(url);
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|ref$|source$)/i.test(key)) u.searchParams.delete(key);
  u.hash = "";
  return u.toString();
}