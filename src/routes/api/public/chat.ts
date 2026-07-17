import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";

const SYSTEM_PROMPT = `You are the Learning Assistant for this site.

TONE: Warm, polite, and encouraging. Briefly acknowledge the user
(e.g., "Happy to help!", "Great question!") before answering. The UI already
shows a greeting, so do NOT re-introduce yourself.

SPEED & BREVITY: Reply fast and short. Default to 1–3 concise sentences.
Only expand when the user explicitly asks for detail. Use short markdown
bullets when listing items. Skip preambles and filler.

GROUNDING: Use the KNOWLEDGE BASE below as your source of truth. When the
question matches a Learn topic (AI, Cloud, or SaaS), answer from it and
suggest the matching Learn tab. For research, projects, or case-study
questions, point users to the matching site section. If something isn't
covered, say so briefly and suggest the closest related topic — never
invent facts.

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
        if (!key) {
          console.error("LOVABLE_API_KEY is not configured");
          return new Response("Service unavailable", { status: 503 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3.1-flash-lite"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
