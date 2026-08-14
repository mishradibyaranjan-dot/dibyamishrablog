import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DocMeta } from "@/lib/docs-suite.server";

// The engineering documentation suite is restricted to the single owner
// identity, on top of the admin role check. Both must pass.
const SUPER_ADMIN_EMAIL = "mishra.dibyaranjan@gmail.com";

async function assertSuperAdmin(context: {
  supabase: { from: (t: string) => any };
  userId: string;
  claims: Record<string, unknown>;
}) {
  const email = String(context.claims["email"] ?? "").trim().toLowerCase();
  if (email !== SUPER_ADMIN_EMAIL) throw new Error("Forbidden");

  // Verified through the caller's RLS-scoped client, never the admin client.
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
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
