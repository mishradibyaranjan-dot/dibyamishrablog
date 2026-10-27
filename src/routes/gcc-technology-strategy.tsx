import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";
import { landingPages } from "@/lib/landing-pages";
import { landingHead } from "@/lib/landing-head";

const page = landingPages["gcc-technology-strategy"];

export const Route = createFileRoute("/gcc-technology-strategy")({
  head: () => landingHead(page),
  component: () => <LandingPage page={page} />,
});
