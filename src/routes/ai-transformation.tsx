import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";
import { landingPages } from "@/lib/landing-pages";
import { landingHead } from "@/lib/landing-head";

const page = landingPages["ai-transformation"];

export const Route = createFileRoute("/ai-transformation")({
  head: () => landingHead(page),
  component: () => <LandingPage page={page} />,
});
