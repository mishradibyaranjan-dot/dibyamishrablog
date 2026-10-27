import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";
import { landingPages } from "@/lib/landing-pages";
import { landingHead } from "@/lib/landing-head";

const page = landingPages["multi-tenant-saas"];

export const Route = createFileRoute("/multi-tenant-saas")({
  head: () => landingHead(page),
  component: () => <LandingPage page={page} />,
});
