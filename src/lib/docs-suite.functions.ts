import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DocMeta } from "@/lib/docs-suite.types";

// The engineering documentation suite is restricted to the single owner
// identity, on top of the admin role check. Both must pass.
const SUPER_ADMIN_EMAIL = "mishra.dibyaranjan@gmail.com";

/** Masks an email for logs: d***a@gmail.com */
function maskEmail(email: string) {
  if (!email) return "(none)";
  const [local = "", domain = ""] = email.split("@");
  const head = local.slice(0, 1);
  const tail = local.length > 1 ? local.slice(-1) : "";
  return `${head}***${tail}@${domain}`;
}

function logDocsAccess(payload: Record<string, unknown>) {
  // Single-line JSON so it is greppable in production server logs.
  console.log(`[admin/docs] ${JSON.stringify(payload)}`);
}

async function assertSuperAdmin(
  context: {
    supabase: { from: (t: string) => any };
    userId: string;
    claims: Record<string, unknown>;
  },
  op: string,
) {
  const startedAt = Date.now();
  const email = String(context.claims["email"] ?? "").trim().toLowerCase();
  const base = {
    op,
    userId: context.userId,
    emailMasked: maskEmail(email),
    emailClaimPresent: !!context.claims["email"],
    emailVerifiedClaim: context.claims["email_verified"] ?? null,
    claimKeys: Object.keys(context.claims ?? {}).sort(),
    aud: context.claims["aud"] ?? null,
    role: context.claims["role"] ?? null,
    iss: context.claims["iss"] ?? null,
    tokenExp: context.claims["exp"] ?? null,
    now: Math.floor(Date.now() / 1000),
  };

  if (email !== SUPER_ADMIN_EMAIL) {
    logDocsAccess({
      ...base,
      outcome: "forbidden",
      reason: context.claims["email"] ? "email_mismatch" : "email_claim_missing",
      expectedEmailMasked: maskEmail(SUPER_ADMIN_EMAIL),
      durationMs: Date.now() - startedAt,
    });
    throw new Error("Forbidden");
  }

  // Verified through the caller's RLS-scoped client, never the admin client.
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    logDocsAccess({
      ...base,
      outcome: "forbidden",
      reason: "role_query_error",
      dbError: { message: error.message, code: error.code ?? null, details: error.details ?? null },
      durationMs: Date.now() - startedAt,
    });
    throw new Error("Forbidden");
  }

  if (!data) {
    logDocsAccess({
      ...base,
      outcome: "forbidden",
      reason: "admin_role_row_not_visible",
      hint: "no admin row returned for this user via the caller's RLS-scoped client",
      durationMs: Date.now() - startedAt,
    });
    throw new Error("Forbidden");
  }

  logDocsAccess({ ...base, outcome: "allowed", durationMs: Date.now() - startedAt });
}



export const listEngineeringDocs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ docs: DocMeta[]; generatedAt: string }> => {
    await assertSuperAdmin(context as never);
    const { listDocMeta } = await import("@/lib/docs-suite.server");
    return { docs: listDocMeta(), generatedAt: new Date().toISOString() };
  });

export const getEngineeringDoc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().min(1).max(64) }).parse(input),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{ id: string; title: string; filename: string; content: string }> => {
      await assertSuperAdmin(context as never);
      const { getDocEntry } = await import("@/lib/docs-suite.server");
      const entry = getDocEntry(data.id);
      if (!entry) throw new Error("Not found");
      return {
        id: entry.id,
        title: entry.title,
        filename: entry.filename,
        content: entry.content,
      };
    },
  );
