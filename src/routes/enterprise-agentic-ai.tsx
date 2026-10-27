import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";
import { landingPages } from "@/lib/landing-pages";
import { landingHead } from "@/lib/landing-head";

const page = landingPages["enterprise-agentic-ai"];

export const Route = createFileRoute("/enterprise-agentic-ai")({
  head: () => landingHead(page),
  component: () => <LandingPage page={page} />,
});
