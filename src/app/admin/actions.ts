"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TENANT_ID_CONST } from "@/lib/admin-data";

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w\-]+/g, "");
  return base || `m-${Date.now().toString(36)}`;
}

// ============================================================
// Orders
// ============================================================

export async function approveOrder(
  orderId: string,
  approvedQuantities: { itemId: string; approvedQuantity: number }[]
) {
  const now = new Date().toISOString();

  for (const { itemId, approvedQuantity } of approvedQuantities) {
    const { error } = await supabaseAdmin
      .from("order_items")
      .update({ approved_quantity: approvedQuantity })
      .eq("id", itemId)
      .eq("order_id", orderId);
    if (error) throw error;
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "approved", approved_at: now })
    .eq("id", orderId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function rejectOrder(orderId: string, reason: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "rejected",
      reject_reason: reason,
      rejected_at: now,
    })
    .eq("id", orderId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function shipOrder(orderId: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "shipped", shipped_at: now })
    .eq("id", orderId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function completeOrder(orderId: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "completed", completed_at: now })
    .eq("id", orderId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function cancelOrder(orderId: string) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

// ============================================================
// Materials
// ============================================================

type MaterialInput = {
  categoryId: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

function parseMaterialInput(formData: FormData): MaterialInput {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("資材名は必須です");

  const categoryId = String(formData.get("category_id") ?? "").trim();
  if (!categoryId) throw new Error("カテゴリは必須です");

  return {
    categoryId,
    name,
    description: String(formData.get("description") ?? "").trim(),
    sortOrder: Number(formData.get("sort_order") ?? 0) || 0,
    isActive: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  };
}

export async function createMaterial(formData: FormData) {
  const input = parseMaterialInput(formData);

  const { error } = await supabaseAdmin.from("materials").insert({
    tenant_id: TENANT_ID_CONST,
    category_id: input.categoryId,
    name: input.name,
    slug: slugify(input.name),
    description: input.description || null,
    spec: {},
    sort_order: input.sortOrder,
    is_active: input.isActive,
  });
  if (error) throw error;

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
}

export async function updateMaterial(materialId: string, formData: FormData) {
  const input = parseMaterialInput(formData);

  const { error } = await supabaseAdmin
    .from("materials")
    .update({
      category_id: input.categoryId,
      name: input.name,
      description: input.description || null,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", materialId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
}

export async function setMaterialActive(materialId: string, active: boolean) {
  const { error } = await supabaseAdmin
    .from("materials")
    .update({ is_active: active })
    .eq("id", materialId)
    .eq("tenant_id", TENANT_ID_CONST);
  if (error) throw error;

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
}
