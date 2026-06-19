"use server";

// 認証 bootstrap: 顧客 JWT 発行前の credential 照合のため supabaseAdmin を使う。
// RLS の tenant_id 強制は login 後の `getSupabaseTenant()` 経路で効く。
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTenant } from "@/lib/tenant";
import { setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(input: { companyId: string; password: string; next?: string }): Promise<LoginResult> {
  const companyId = input.companyId.trim();
  // 仮パスワードのコピペで混入しがちな前後の空白/改行を吸収する（保存側も trim 済み）。
  const password = input.password.trim();
  if (!companyId || !password) {
    return { ok: false, error: "会社 ID とパスワードを入力してください" };
  }

  const tenant = await getTenant();
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, password_hash, is_active")
    .eq("tenant_id", tenant.id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    console.error("login lookup error", error);
    return { ok: false, error: "ログインに失敗しました。時間をおいて再度お試しください。" };
  }

  const dummyHash = "$2a$12$0000000000000000000000000000000000000000000000000000ab";
  const hash = data?.password_hash ?? dummyHash;
  const ok = await bcrypt.compare(password, hash);

  if (!data || !data.is_active || !ok) {
    // レスポンスは enumeration 対策で曖昧なまま。原因切り分け用にログだけ区別する。
    const reason = !data ? "lookup_miss" : !data.is_active ? "inactive" : "password_mismatch";
    console.warn(`login failed: ${reason} tenant=${tenant.slug} companyId=${companyId}`);
    return { ok: false, error: "会社 ID またはパスワードが正しくありません" };
  }

  await setCustomerSession(data.id, tenant.id);
  return { ok: true };
}

export async function logout(): Promise<void> {
  await clearCustomerSession();
  redirect("/login");
}
