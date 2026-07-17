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
  title?: string;
  summary?: string;
  bodyMarkdown?: string;
  slug?: string;
  siteUrl?: string;
}

const SITE = "https://www.dibyamishra.co.in";

const Email = ({
  title = "Monthly Notes from Dibya",
  summary = "",
  bodyMarkdown = "",
  slug = "",
  siteUrl = SITE,
}: Props) => {
  const paragraphs = bodyMarkdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const url = slug ? `${siteUrl}/newsletter/${slug}` : siteUrl;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{summary || title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>Monthly Newsletter</Text>
            <Heading style={h1}>{title}</Heading>
            {summary ? <Text style={lead}>{summary}</Text> : null}
          </Section>
          <Section style={body}>
            {paragraphs.map((p, i) => {
              if (p.startsWith("## ")) {
                return (
                  <Heading key={i} as="h2" style={h2}>
                    {p.replace(/^##\s+/, "")}
                  </Heading>
                );
              }
              if (p.startsWith("- ")) {
                const items = p.split(/\n- /).map((s) => s.replace(/^-\s+/, ""));
                return (
                  <ul key={i} style={list}>
                    {items.map((it, j) => (
                      <li key={j} style={li}>
                        {it}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <Text key={i} style={p1}>
                  {p}
                </Text>
              );
            })}
          </Section>
          <Section style={footer}>
            <Link href={url} style={cta}>
              Read this issue on the web →
            </Link>
            <Text style={small}>
              Sent by Dibya R. Mishra · <Link href={siteUrl} style={muted}>{siteUrl.replace(/^https?:\/\//, "")}</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    typeof data?.title === "string" && data.title.trim()
      ? `📰 ${data.title}`
      : "📰 Monthly newsletter from Dibya",
  displayName: "Newsletter Issue",
  previewData: {
    title: "Agentic AI in the Enterprise — What Shipped in October",
    summary: "New research, three case studies, and where GenAI is landing in retail supply chains.",
    bodyMarkdown:
      "## What's new\n\nThis month I published three case studies on agentic automation and a research note on RAG at scale.\n\n## Deep dive\n\n- Multi-tenant LLM apps\n- LinkedIn auto-publishing\n- Vector DB comparison",
    slug: "sample-issue",
  },
} satisfies TemplateEntry;

const main: React.CSSProperties = { backgroundColor: "#ffffff", fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" };
const container: React.CSSProperties = { maxWidth: 620, margin: "0 auto", padding: "32px 24px" };
const header: React.CSSProperties = { borderBottom: "1px solid #e5e7eb", paddingBottom: 16, marginBottom: 24 };
const eyebrow: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 2, textTransform: "uppercase", margin: 0 };
const h1: React.CSSProperties = { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "8px 0 0" };
const lead: React.CSSProperties = { fontSize: 15, color: "#475569", margin: "10px 0 0", lineHeight: 1.5 };
const body: React.CSSProperties = { fontSize: 15, color: "#1f2937", lineHeight: 1.65 };
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#0f172a", marginTop: 24, marginBottom: 8 };
const p1: React.CSSProperties = { fontSize: 15, color: "#1f2937", lineHeight: 1.65, margin: "12px 0" };
const list: React.CSSProperties = { paddingLeft: 20, margin: "8px 0" };
const li: React.CSSProperties = { margin: "4px 0" };
const footer: React.CSSProperties = { borderTop: "1px solid #e5e7eb", marginTop: 28, paddingTop: 20, textAlign: "center" };
const cta: React.CSSProperties = { display: "inline-block", padding: "10px 20px", backgroundColor: "#0ea5e9", color: "#ffffff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 };
const small: React.CSSProperties = { fontSize: 12, color: "#64748b", marginTop: 16 };
const muted: React.CSSProperties = { color: "#0ea5e9", textDecoration: "none" };
