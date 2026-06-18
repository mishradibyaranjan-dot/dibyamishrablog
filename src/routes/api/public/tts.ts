import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  text: z.string().trim().min(1).max(2000),
  voice: z.string().trim().max(40).optional(),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
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
            const body = await res.text().catch(() => "");
            return new Response(body || "TTS upstream error", {
              status: res.status,
              headers: { ...cors, "Content-Type": "text/plain" },
            });
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
          return Response.json(
            { error: err instanceof Error ? err.message : "TTS failed" },
            { status: 500, headers: cors },
          );
        }
      },
    },
  },
});
