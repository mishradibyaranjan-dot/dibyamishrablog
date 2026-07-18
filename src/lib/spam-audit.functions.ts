import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(320),
  reason: z.string().trim().max(200).optional(),
});

export const logBlockedLoginAttempt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const email = data.email.toLowerCase();
      const domain = email.split("@")[1] ?? "";
      if (!domain) return { ok: false };
      await supabaseAdmin.from("spam_audit_log").insert({
        action_type: "blocked_login_attempt",
        email,
        domain,
        reason: data.reason ?? "email domain on blocklist",
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });
