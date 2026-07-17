import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  siteUrl?: string;
}

const SITE = "https://www.dibyamishra.co.in";

const Email = ({ siteUrl = SITE }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're subscribed — monthly notes on AI, cloud & scale</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={eyebrow}>Welcome aboard</Text>
          <Heading style={h1}>You're on the list 🎉</Heading>
        </Section>
        <Section>
          <Text style={p}>
            Thanks for subscribing to my monthly newsletter. Expect one email on
            the 1st of each month — deep, practical notes on Agentic AI, GenAI
            in retail supply chains, multi-tenant SaaS, and cloud architecture.
          </Text>
          <Text style={p}>
            No promo fluff. Just the teardown of real systems I'm building,
            breaking, and learning from.
          </Text>
          <Text style={p}>
            While you wait for the next issue, you can browse the archive:
          </Text>
          <Link href={`${siteUrl}/newsletter`} style={cta}>
            Read past issues →
          </Link>
        </Section>
        <Section style={footer}>
          <Text style={small}>
            Sent by Dibya R. Mishra ·{" "}
            <Link href={siteUrl} style={muted}>
              {siteUrl.replace(/^https?:\/\//, "")}
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "Welcome to Dibya's monthly newsletter 👋",
  displayName: "Newsletter Welcome",
  previewData: {},
} satisfies TemplateEntry;

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: 620,
  margin: "0 auto",
  padding: "32px 24px",
};
const header: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 16,
  marginBottom: 24,
};
const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#4f46e5",
  letterSpacing: 2,
  textTransform: "uppercase",
  margin: 0,
};
const h1: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  color: "#0f172a",
  margin: "8px 0 0",
};
const p: React.CSSProperties = {
  fontSize: 15,
  color: "#1f2937",
  lineHeight: 1.65,
  margin: "12px 0",
};
const cta: React.CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  padding: "10px 20px",
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};
const footer: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  marginTop: 28,
  paddingTop: 20,
  textAlign: "center",
};
const small: React.CSSProperties = { fontSize: 12, color: "#64748b" };
const muted: React.CSSProperties = { color: "#4f46e5", textDecoration: "none" };
