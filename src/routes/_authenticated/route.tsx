import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  ),
});
