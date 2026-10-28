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
      const { data: blocked } = await supabaseAdmin.rpc("is_blocked_email", { _email: email });
      if (!blocked) return { ok: false };
      // Public pre-login endpoint: throttle duplicate entries so it can't flood the audit log.
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("spam_audit_log")
        .select("id", { count: "exact", head: true })
        .eq("domain", domain)
        .eq("action_type", "blocked_login_attempt")
        .gte("created_at", since);
      if ((count ?? 0) >= 5) return { ok: true };
      await supabaseAdmin.from("spam_audit_log").insert({
        action_type: "blocked_login_attempt",
        email,
        domain,
        reason: /sign-up/i.test(data.reason ?? "") ? "sign-up blocked: domain on blocklist" : /session/i.test(data.reason ?? "") ? "session blocked: domain on blocklist" : "sign-in blocked: domain on blocklist",
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });
