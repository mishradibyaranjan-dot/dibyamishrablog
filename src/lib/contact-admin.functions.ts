import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IdSchema = z.object({ enquiryId: z.string().uuid() });
const ReplySchema = z.object({
  enquiryId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

/** Admin-triggered immediate retry of the failing delivery legs for one enquiry. */
export const retryEnquiryEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as { supabase: any; userId: string });
    const { serviceClient, retryEnquiryDelivery } = await import("@/lib/contact-email.server");
    const supabase = await serviceClient();
    const { data: row, error } = await supabase
      .from("contact_enquiries")
      .select(
        "id, name, email, subject, message, message_id, notification_status, confirmation_status, retry_count",
      )
      .eq("id", data.enquiryId)
      .maybeSingle();
    if (error || !row) throw new Error("Enquiry not found");
    const result = await retryEnquiryDelivery(
      supabase,
      row as never,
      "manual-retry",
      context.userId,
    );
    return result;
  });

/** Sends an admin reply to the requester using the shared sender configuration. */
export const replyToEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReplySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as { supabase: any; userId: string });
    const {
      serviceClient,
      renderTemplate,
      sendContactEmail,
      PUBLIC_REPLY_TO,
    } = await import("@/lib/contact-email.server");
    const supabase = await serviceClient();

    const { data: row, error } = await supabase
      .from("contact_enquiries")
      .select("id, name, email, subject, message, message_id")
      .eq("id", data.enquiryId)
      .maybeSingle();
    if (error || !row) throw new Error("Enquiry not found");

    const templateData = {
      name: row.name,
      subject: row.subject,
      message: row.message,
      reply: data.body,
    };
    const payload = await renderTemplate("contact-reply", templateData);
    const messageId = `${row.message_id ?? row.id}-reply-${Date.now()}`;

    const result = await sendContactEmail({
      supabase,
      recipient: row.email,
      templateName: "contact-reply",
      payload,
      messageId,
      replyTo: PUBLIC_REPLY_TO,
      enquiryId: row.id,
      attemptNo: 1,
      triggerSource: "admin-reply",
      actorId: context.userId,
    });

    if (!result.ok) return { ok: false, error: result.error ?? "send_failed" };

    await supabase
      .from("contact_enquiries")
      .update({ status: "replied", replied_at: new Date().toISOString() })
      .eq("id", row.id);

    return { ok: true, recipient: row.email };
  });
