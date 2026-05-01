import "server-only";
import { Resend } from "resend";
import { supabaseAdmin } from "./supabase-admin";
import {
  renderEmail,
  type EmailKind,
  type OrderEmailContext,
} from "./email-templates";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  tenantId: string;
  orderId: string | null;
  to: string;
  kind: EmailKind;
  ctx: OrderEmailContext;
};

// 送信を試み、結果を email_logs に記録する。
// RESEND_API_KEY 未設定時は実送信をスキップし status='skipped' で記録する。
export async function sendOrderEmail({
  tenantId,
  orderId,
  to,
  kind,
  ctx,
}: SendArgs): Promise<void> {
  const { subject, body } = renderEmail(kind, ctx);

  let status: "sent" | "skipped" | "failed" = "skipped";
  let errorMsg: string | null = null;

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        text: body,
      });
      if (result.error) {
        status = "failed";
        errorMsg = result.error.message;
      } else {
        status = "sent";
      }
    } catch (e) {
      status = "failed";
      errorMsg = e instanceof Error ? e.message : String(e);
    }
  } else {
    errorMsg = "RESEND_API_KEY is not configured";
  }

  await supabaseAdmin.from("email_logs").insert({
    tenant_id: tenantId,
    order_id: orderId,
    to_address: to,
    subject,
    body,
    kind,
    status,
    error: errorMsg,
  });

  if (status === "failed") {
    console.error(`email send failed (${kind} → ${to}): ${errorMsg}`);
  }
}

// admin_users の email 全員に同じメールを送る（管理者向け新規発注通知用）。
export async function sendAdminEmail(args: {
  tenantId: string;
  orderId: string | null;
  kind: EmailKind;
  ctx: OrderEmailContext;
}): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("email")
    .eq("tenant_id", args.tenantId);
  if (error) {
    console.error("sendAdminEmail: admin_users lookup failed", error);
    return;
  }
  const recipients = (data ?? []).map((r) => r.email).filter(Boolean);
  await Promise.all(
    recipients.map((to) =>
      sendOrderEmail({
        tenantId: args.tenantId,
        orderId: args.orderId,
        to,
        kind: args.kind,
        ctx: args.ctx,
      })
    )
  );
}
