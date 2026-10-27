import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const recordWebVital = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    consent: z.literal(true), metric: z.enum(["LCP", "INP", "CLS"]), value: z.number().finite().min(0).max(600_000),
    rating: z.enum(["good", "needs-improvement", "poor"]), path: z.string().startsWith("/").max(120), device: z.enum(["mobile", "desktop"]),
  }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { consent: _consent, ...sample } = data;
    // Never retain query strings, job slugs, emails, device identifiers or IPs.
    if (sample.path !== "/" && sample.path !== "/jobs") sample.path = "/other";
    const { error } = await db.from("web_vital_samples").insert(sample);
    if (error) console.error("[web-vitals] measurement could not be saved");
    return { ok: !error };
  });