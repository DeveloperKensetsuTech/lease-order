"use server";

// アカウント申請の受付。顧客 JWT 発行前（未ログイン）の bootstrap のため
// supabaseAdmin（service_role）を使う。tenant_id はアプリ層で明示フィルタする。
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTenant, getTenantId } from "@/lib/tenant";
import { notifyAdmins } from "@/lib/notifications";

export type SubmitApplicationInput = {
  companyName: string;
  contactName?: string;
  phone?: string;
  email: string;
  note?: string;
};

export type SubmitApplicationResult = { ok: true } | { ok: false; error: string };

// 簡易メール形式チェック（厳密 RFC ではなく実用上の最低限）。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitApplication(
  input: SubmitApplicationInput
): Promise<SubmitApplicationResult> {
  const companyName = input.companyName.trim();
  const email = input.email.trim();
  const contactName = input.contactName?.trim() || null;
  const phone = input.phone?.trim() || null;
  const note = input.note?.trim() || null;

  if (!companyName) return { ok: false, error: "会社名を入力してください" };
  if (!email) return { ok: false, error: "メールアドレスを入力してください" };
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "メールアドレスの形式が正しくありません" };
  }

  const tenant = await getTenant();
  if (!tenant.customer_self_registration) {
    return { ok: false, error: "現在アカウント申請を受け付けていません" };
  }

  // 同一テナント内で同じメールの pending 申請があれば二重申請として弾く
  // （DB 側の部分 unique index がバックストップ）。
  const { data: existing } = await supabaseAdmin
    .from("customer_applications")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("status", "pending")
    .ilike("contact_email", email)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "このメールアドレスの申請は既に受付済みです。承認をお待ちください。",
    };
  }

  const { error } = await supabaseAdmin.from("customer_applications").insert({
    tenant_id: tenant.id,
    company_name: companyName,
    contact_name: contactName,
    phone,
    contact_email: email,
    note,
    status: "pending",
  });

  if (error) {
    // 競合で unique 違反になった場合も二重申請として扱う。
    if ((error as { code?: string }).code === "23505") {
      return {
        ok: false,
        error: "このメールアドレスの申請は既に受付済みです。承認をお待ちください。",
      };
    }
    console.error("submitApplication insert error", error);
    return { ok: false, error: "申請の送信に失敗しました。時間をおいて再度お試しください。" };
  }

  // リース会社（admin）へ通知。in-app + email + 共有チャンネル（Slack 等）。
  const tenantId = await getTenantId();
  notifyAdmins(tenantId, "admin_new_application", {
    orderNumber: "",
    companyName,
    contactName: contactName ?? "",
  });

  return { ok: true };
}
