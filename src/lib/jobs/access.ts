export function hasJobsAdminAccess(role: string | undefined, assurance: unknown): boolean {
  return role === "admin" && assurance === "aal2";
}