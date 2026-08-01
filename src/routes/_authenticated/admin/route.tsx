import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <RequireAdmin>
      <Outlet />
    </RequireAdmin>
  ),
});
