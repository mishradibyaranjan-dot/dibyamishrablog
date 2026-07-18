import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  severity: "low" | "medium" | "critical";
  type: string;
  ip: string | null;
  target: string | null;
  user: string | null;
  actionTaken: string | null;
  metadata: Record<string, unknown>;
  timestamp: string;
}

const Email = ({ severity, type, ip, target, user, actionTaken, metadata, timestamp }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`[${severity.toUpperCase()}] ${type} — ${ip ?? "unknown IP"}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Security alert</Heading>
        <Text style={badge(severity)}>{severity.toUpperCase()}</Text>
        <Section style={card}>
          <Row label="Type" value={type} />
          <Row label="IP" value={ip ?? "—"} />
          <Row label="Target" value={target ?? "—"} />
          <Row label="User" value={user ?? "—"} />
          <Row label="Action taken" value={actionTaken ?? "—"} />
          <Row label="Timestamp" value={timestamp} />
          {Object.keys(metadata).length > 0 && (
            <Row label="Metadata" value={JSON.stringify(metadata)} />
          )}
        </Section>
        <Text style={foot}>
          Sent automatically by the security monitor on dibyamishra.co.in.
        </Text>
      </Container>
    </Body>
  </Html>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={rowStyle}>
    <span style={{ color: "#64748b" }}>{label}: </span>
    <span style={{ color: "#0f172a", fontFamily: "monospace" }}>{value}</span>
  </Text>
);

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px", maxWidth: "560px" };
const heading = { color: "#0f172a", fontSize: "22px", margin: "0 0 8px" };
const card = {
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "16px 18px",
  marginTop: "12px",
};
const rowStyle = { fontSize: "13px", margin: "4px 0", lineHeight: "1.5" };
const foot = { color: "#64748b", fontSize: "11px", marginTop: "16px" };
const badge = (sev: string) => ({
  display: "inline-block",
  padding: "3px 10px",
  fontSize: "11px",
  fontWeight: 700 as const,
  borderRadius: "999px",
  color: "#ffffff",
  backgroundColor: sev === "critical" ? "#dc2626" : sev === "medium" ? "#ea580c" : "#0284c7",
});

export const template = {
  component: Email,
  subject: (d: Record<string, unknown>) =>
    `[Security] ${(d.type as string) ?? "event"} from ${(d.ip as string) ?? "unknown IP"}`,
  displayName: "Security alert",
  previewData: {
    severity: "critical",
    type: "brute_force_attempt",
    ip: "203.0.113.42",
    target: "/auth",
    user: "attacker@example.com",
    actionTaken: "ip_blocked_60m",
    metadata: { failures_15m: 6 },
    timestamp: new Date().toISOString(),
  },
} satisfies TemplateEntry;
