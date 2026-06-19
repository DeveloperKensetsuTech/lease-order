"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTenant, getTenantId } from "@/lib/tenant";
import { nextCompanyId } from "@/lib/customer-id";
import { sendTransactionalEmail } from "@/lib/mailer";

export type CreateCustomerInput = {
  name: string;
  phone?: string;
  defaultAddress?: string;
  contactEmail?: string;
};

export type CreateCustomerResult =
  | { ok: true; id: string; companyId: string; tempPassword: string }
  | { ok: false; error: string };

const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateTempPassword(length = 12): string {
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_ALPHABET[buf[i] % PASSWORD_ALPHABET.length];
  }
  return out;
}

// company_id 採番 → 仮 PW 生成 → bcrypt hash → customers insert を 1 箇所に集約する。
// admin の手動発行（createCustomer）と申請の承認（approveApplication）の両方から使う。
async function issueCustomerAccount(input: {
  tenantId: string;
  name: string;
  phone?: string | null;
  defaultAddress?: string | null;
  contactEmail?: string | null;
  // 申請承認のように、入力メールを検証済み扱いにできる場合は true。
  emailVerified: boolean;
  selfRegistered: boolean;
}): Promise<CreateCustomerResult> {
  const companyId = await nextCompanyId(input.tenantId);
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      tenant_id: input.tenantId,
      company_id: companyId,
      name: input.name,
      password_hash: passwordHash,
      phone: input.phone?.trim() || null,
      default_address: input.defaultAddress?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      email_verified: input.emailVerified,
      self_registered: input.selfRegistered,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("issueCustomerAccount error", error);
    return { ok: false, error: "顧客の作成に失敗しました" };
  }
  return { ok: true, id: data.id, companyId, tempPassword };
}

export async function createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "会社名は必須です" };

  const tenantId = await getTenantId();
  const result = await issueCustomerAccount({
    tenantId,
    name,
    phone: input.phone,
    defaultAddress: input.defaultAddress,
    contactEmail: input.contactEmail,
    // admin が入力したメールは検証済み扱い（無ければ false）。
    emailVerified: !!input.contactEmail?.trim(),
    selfRegistered: false,
  });
  if (result.ok) revalidatePath("/admin/customers");
  return result;
}

export type UpdateCustomerInput = {
  id: string;
  name?: string;
  phone?: string | null;
  defaultAddress?: string | null;
  contactEmail?: string | null;
};

export async function updateCustomer(input: UpdateCustomerInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const tenantId = await getTenantId();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;
  if (input.defaultAddress !== undefined) patch.default_address = input.defaultAddress?.trim() || null;
  if (input.contactEmail !== undefined) {
    const e = input.contactEmail?.trim() || null;
    patch.contact_email = e;
    // admin が入力したメールは検証済み扱い（クリア時は false）。
    patch.email_verified = !!e;
  }

  const { error } = await supabaseAdmin
    .from("customers")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", input.id);
  if (error) {
    console.error("updateCustomer error", error);
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${input.id}`);
  return { ok: true };
}

export async function resetCustomerPassword(id: string): Promise<{ ok: true; tempPassword: string } | { ok: false; error: string }> {
  const tenantId = await getTenantId();
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const { data, error } = await supabaseAdmin
    .from("customers")
    .update({ password_hash: passwordHash, must_change_password: true })
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("id");
  if (error) {
    console.error("resetCustomerPassword error", error);
    return { ok: false, error: "パスワードのリセットに失敗しました" };
  }
  // 0 行更新（別テナントの id・削除済み等）を成功扱いにしない。
  if (!data || data.length === 0) {
    console.error("resetCustomerPassword: no rows updated", { tenantId, id });
    return { ok: false, error: "対象の顧客が見つかりませんでした" };
  }
  revalidatePath(`/admin/customers/${id}`);
  return { ok: true, tempPassword };
}

export async function setCustomerActive(id: string, isActive: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
  const tenantId = await getTenantId();
  const { error } = await supabaseAdmin
    .from("customers")
    .update({ is_active: isActive })
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) {
    console.error("setCustomerActive error", error);
    return { ok: false, error: "ステータスの変更に失敗しました" };
  }
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { ok: true };
}

// 現在のリクエスト host から顧客向けログイン URL を組み立てる。
async function customerLoginUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}/login`;
}

export type ApproveApplicationResult =
  | { ok: true; companyId: string; tempPassword: string; emailSent: boolean; contactEmail: string }
  | { ok: false; error: string };

// 申請を承認し、customers 行を発行 → 資格情報（会社 ID＋仮 PW）を申請メール宛に送る。
// 申請は admin が内容を確認済みのため email_verified=true 扱い。メール不達に備え、
// 生成した資格情報は戻り値として admin 画面にも表示する。
export async function approveApplication(id: string): Promise<ApproveApplicationResult> {
  const tenantId = await getTenantId();

  const { data: app, error: fetchError } = await supabaseAdmin
    .from("customer_applications")
    .select("id, company_name, contact_name, phone, contact_email, status")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (fetchError) {
    console.error("approveApplication fetch error", fetchError);
    return { ok: false, error: "申請の取得に失敗しました" };
  }
  if (!app) return { ok: false, error: "対象の申請が見つかりませんでした" };
  if (app.status !== "pending") return { ok: false, error: "この申請は既に処理済みです" };

  const issued = await issueCustomerAccount({
    tenantId,
    name: app.company_name,
    phone: app.phone,
    contactEmail: app.contact_email,
    emailVerified: true,
    selfRegistered: true,
  });
  if (!issued.ok) return issued;

  // 申請を承認済みにして customers 行へリンク。
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("customer_applications")
    .update({
      status: "approved",
      customer_id: issued.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (updateError || !updated || updated.length === 0) {
    // customers 行は発行済み。申請の状態更新に失敗しても顧客は使えるので
    // エラーにはせずログだけ残す（二重発行は status='pending' ガードで防止）。
    console.error("approveApplication: application update failed", { id, updateError });
  }

  // 資格情報メールを送信（admin が内容確認済みのため到達確認も兼ねる）。
  const tenant = await getTenant();
  const loginUrl = await customerLoginUrl();
  const sent = await sendTransactionalEmail({
    to: app.contact_email,
    fromName: tenant.slug,
    subject: "【発注 for リース】アカウント発行のお知らせ",
    text: [
      `${app.company_name}${app.contact_name ? ` ${app.contact_name} 様` : " 御中"}`,
      "",
      "アカウント申請を承認いたしました。下記の情報でログインいただけます。",
      "",
      `会社 ID: ${issued.companyId}`,
      `初期パスワード: ${issued.tempPassword}`,
      "",
      `ログイン: ${loginUrl}`,
      "",
      "初回ログイン時にパスワードの変更をお願いいたします。",
    ].join("\n"),
  });

  revalidatePath("/admin/customers");
  revalidatePath("/admin/customers/applications");
  return {
    ok: true,
    companyId: issued.companyId,
    tempPassword: issued.tempPassword,
    emailSent: sent.ok,
    contactEmail: app.contact_email,
  };
}

export async function rejectApplication(
  id: string,
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const tenantId = await getTenantId();
  const { data, error } = await supabaseAdmin
    .from("customer_applications")
    .update({
      status: "rejected",
      reject_reason: reason?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) {
    console.error("rejectApplication error", error);
    return { ok: false, error: "却下に失敗しました" };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "対象の申請が見つからないか、既に処理済みです" };
  }
  revalidatePath("/admin/customers/applications");
  return { ok: true };
}
