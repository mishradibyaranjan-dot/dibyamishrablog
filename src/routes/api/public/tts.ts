import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { corsHeadersFor, isAllowedOrigin } from "@/lib/origin.server";

const Body = z.object({
  text: z.string().trim().min(1).max(2000),
  voice: z.string().trim().max(40).optional(),
});


async function verifyBearer(request: Request): Promise<string | null> {
  const h = request.headers.get("authorization") ?? "";
  if (!h.toLowerCase().startsWith("bearer ")) return null;
  const token = h.slice(7).trim();
  if (!token) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error || !data?.user?.id ? null : data.user.id;
}

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: corsHeadersFor(request) }),
      POST: async ({ request }) => {
        const cors = corsHeadersFor(request);
        if (!isAllowedOrigin(request)) {
          return new Response("Forbidden", { status: 403, headers: cors });
        }
        if (!(await verifyBearer(request))) {
          return Response.json({ error: "Sign in required" }, { status: 401, headers: cors });
        }
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
        }
        const parsed = Body.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Invalid input" }, { status: 400, headers: cors });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "TTS not configured" }, { status: 500, headers: cors });
        }
        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input: parsed.data.text,
              voice: parsed.data.voice ?? "alloy",
              response_format: "mp3",
            }),
          });
          if (!res.ok) {
            console.error("TTS upstream error", res.status, await res.text().catch(() => ""));
            return Response.json(
              { error: "TTS failed" },
              { status: 502, headers: cors },
            );
          }
          const buf = await res.arrayBuffer();
          return new Response(buf, {
            status: 200,
            headers: {
              ...cors,
              "Content-Type": "audio/mpeg",
              "Cache-Control": "no-store",
            },
          });
        } catch (err) {
          console.error("TTS request failed", err);
          return Response.json(
            { error: "TTS failed" },
            { status: 500, headers: cors },
          );
        }
      },
    },
  },
});
