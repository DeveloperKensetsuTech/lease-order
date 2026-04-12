"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

type SubmitOrderInput = {
  companyName: string;
  contactName: string;
  phone: string;
  note: string;
  items: { materialId: string; quantity: number }[];
};

export type SubmitOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

export async function submitOrder(
  input: SubmitOrderInput
): Promise<SubmitOrderResult> {
  const companyName = input.companyName.trim();
  const contactName = input.contactName.trim();

  if (!companyName) return { ok: false, error: "会社名を入力してください" };
  if (!contactName) return { ok: false, error: "担当者名を入力してください" };
  if (!input.items.length) return { ok: false, error: "カートが空です" };

  const items = input.items
    .map((i) => ({
      materialId: String(i.materialId),
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 0)),
    }))
    .filter((i) => i.materialId);

  if (!items.length) return { ok: false, error: "有効な明細がありません" };

  const { data: materials, error: matErr } = await supabaseAdmin
    .from("materials")
    .select("id, name")
    .eq("tenant_id", TENANT_ID)
    .in(
      "id",
      items.map((i) => i.materialId)
    );

  if (matErr) {
    console.error("submitOrder: materials lookup failed", matErr);
    return { ok: false, error: "発注の登録に失敗しました" };
  }

  const materialMap = new Map(materials?.map((m) => [m.id, m.name]) ?? []);
  const missing = items.filter((i) => !materialMap.has(i.materialId));
  if (missing.length) {
    return { ok: false, error: "存在しない資材が含まれています" };
  }

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({
      tenant_id: TENANT_ID,
      order_number: orderNumber,
      company_name: companyName,
      contact_name: contactName,
      phone: input.phone.trim() || null,
      note: input.note.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("submitOrder: order insert failed", orderErr);
    return { ok: false, error: "発注の登録に失敗しました" };
  }

  const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      material_id: i.materialId,
      material_name: materialMap.get(i.materialId)!,
      quantity: i.quantity,
    }))
  );

  if (itemsErr) {
    console.error("submitOrder: order_items insert failed", itemsErr);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "発注の登録に失敗しました" };
  }

  return { ok: true, orderNumber };
}
