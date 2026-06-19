import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";

const SYSTEM_PROMPT = `You are the Learning Assistant for this site.

GREETING: On the user's very first message in a conversation, always begin
your reply with a brief polite greeting that introduces you as the Learning
Assistant, e.g. "Hi! I'm your Learning Assistant — happy to help you explore
AI, Cloud, SaaS, research articles, and case studies." Then answer the user's
question. On subsequent messages do NOT repeat the greeting.

STYLE: Be concise, friendly, accurate. Default to 2–6 short sentences;
expand only when the user asks for depth. Use markdown lists when it helps.

GROUNDING: Use the KNOWLEDGE BASE below as your source of truth. When the
question matches a Learn topic (AI, Cloud, or SaaS), answer from it and
suggest visiting the matching Learn tab (e.g., "see the Intro to Cloud tab
on the Learn page"). For research, projects, or case-study questions, point
users to the matching site section. If something is not covered, say so
clearly and suggest the closest related topic — never invent facts.

NEVER mention specific company names, even if asked about past clients.

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}
`;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 20;
const MAX_TEXT_PER_PART = 4000;

const messagePartSchema = z.object({ type: z.string().max(64), text: z.string().max(MAX_TEXT_PER_PART).optional() }).passthrough();
const messageSchema = z.object({
  id: z.string().max(128).optional(),
  role: z.enum(["system", "user", "assistant", "tool"]),
  parts: z.array(messagePartSchema).max(32).optional(),
  content: z.union([z.string().max(MAX_TEXT_PER_PART), z.array(messagePartSchema).max(32)]).optional(),
}).passthrough();
const bodySchema = z.object({ messages: z.array(messageSchema).min(1).max(MAX_MESSAGES) });

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origin) return false;
  let host: string;
  try { host = new URL(origin).host; } catch { return false; }
  const selfHost = new URL(request.url).host;
  if (host === selfHost) return true;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com") ||
    host === "dibyamishrablog.lovable.app"
  );
}

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAllowedOrigin(request)) return new Response("Forbidden", { status: 403 });

        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength && contentLength > MAX_BODY_BYTES) return new Response("Payload too large", { status: 413 });
        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) return new Response("Payload too large", { status: 413 });

        let json: unknown;
        try { json = JSON.parse(raw); } catch { return new Response("Invalid JSON", { status: 400 }); }
        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) return new Response("Invalid request body", { status: 400 });
        const messages = parsed.data.messages as unknown as UIMessage[];

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
