import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/blog" || location.pathname === "/blog/") {
      throw redirect({ to: "/research", search: { q: "", category: "All", tag: "", page: 1 } });
    }
  },
  component: () => <Outlet />,
});
