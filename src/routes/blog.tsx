import { shareImageMeta } from "@/lib/og-images";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [
    { title: "Research Archive — Dibya Mishra" },
    { name: "description", content: "Research articles from Dibya Mishra on AI, cloud platforms and engineering leadership." },
    { property: "og:title", content: "Research Archive — Dibya Mishra" },
    { property: "og:description", content: "Explore Dibya Mishra’s research on AI, cloud platforms and engineering leadership." },
    { property: "og:type", content: "website" },
    ...shareImageMeta(),
  ] }),
  beforeLoad: ({ location }) => {
    if (location.pathname === "/blog" || location.pathname === "/blog/") {
      throw redirect({ to: "/research", search: { q: "", category: "All", tag: "", page: 1 } });
    }
  },
  component: () => <Outlet />,
});
