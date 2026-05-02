"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireCustomer } from "@/lib/customer-auth";

export type UpdateProfileInput = {
  phone?: string | null;
  defaultAddress?: string | null;
  contactEmail?: string | null;
};

export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  const customer = await requireCustomer({ allowMustChangePassword: true });

  const patch: Record<string, string | null> = {};
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;
  if (input.defaultAddress !== undefined) patch.default_address = input.defaultAddress?.trim() || null;
  if (input.contactEmail !== undefined) patch.contact_email = input.contactEmail?.trim() || null;

  const { error } = await supabaseAdmin
    .from("customers")
    .update(patch)
    .eq("id", customer.id)
    .eq("tenant_id", customer.tenant_id);

  if (error) {
    console.error("updateProfile error", error);
    return { ok: false, error: "更新に失敗しました" };
  }

  revalidatePath("/account");
  return { ok: true };
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResult = { ok: true; mustChangePasswordCleared: boolean } | { ok: false; error: string };

export async function changePassword(input: ChangePasswordInput): Promise<ChangePasswordResult> {
  const customer = await requireCustomer({ allowMustChangePassword: true });

  if (!input.currentPassword || !input.newPassword) {
    return { ok: false, error: "現在のパスワードと新しいパスワードを入力してください" };
  }
  if (input.newPassword.length < 8) {
    return { ok: false, error: "新しいパスワードは 8 文字以上で入力してください" };
  }
  if (input.newPassword === input.currentPassword) {
    return { ok: false, error: "新しいパスワードは現在のパスワードと異なるものにしてください" };
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("password_hash, must_change_password")
    .eq("id", customer.id)
    .eq("tenant_id", customer.tenant_id)
    .maybeSingle();

  if (error || !data) {
    console.error("changePassword fetch error", error);
    return { ok: false, error: "ユーザー情報の取得に失敗しました" };
  }

  const ok = await bcrypt.compare(input.currentPassword, data.password_hash);
  if (!ok) {
    return { ok: false, error: "現在のパスワードが正しくありません" };
  }

  const newHash = await bcrypt.hash(input.newPassword, 12);
  const { error: updateErr } = await supabaseAdmin
    .from("customers")
    .update({ password_hash: newHash, must_change_password: false })
    .eq("id", customer.id)
    .eq("tenant_id", customer.tenant_id);

  if (updateErr) {
    console.error("changePassword update error", updateErr);
    return { ok: false, error: "パスワードの更新に失敗しました" };
  }

  revalidatePath("/account");
  return { ok: true, mustChangePasswordCleared: data.must_change_password };
}
