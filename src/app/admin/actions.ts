"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/tenant";

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
  const tenantId = await getTenantId();
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
    .eq("tenant_id", tenantId);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function rejectOrder(orderId: string, reason: string) {
  const tenantId = await getTenantId();
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "rejected",
      reject_reason: reason,
      rejected_at: now,
    })
    .eq("id", orderId)
    .eq("tenant_id", tenantId);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function shipOrder(orderId: string) {
  const tenantId = await getTenantId();
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "shipped", shipped_at: now })
    .eq("id", orderId)
    .eq("tenant_id", tenantId);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function completeOrder(orderId: string) {
  const tenantId = await getTenantId();
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "completed", completed_at: now })
    .eq("id", orderId)
    .eq("tenant_id", tenantId);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function cancelOrder(orderId: string) {
  const tenantId = await getTenantId();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("tenant_id", tenantId);
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

async function uploadImageToStorage(
  file: File,
  tenantId: string,
  pathPrefix: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "webp";
  const path = `${tenantId}/${pathPrefix}/${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("materials")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(`画像アップロードに失敗しました: ${error.message}`);

  const { data } = supabaseAdmin.storage.from("materials").getPublicUrl(path);
  return data.publicUrl;
}

async function upsertMaterialImage(
  tenantId: string,
  materialId: string,
  imageUrl: string
): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from("images")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("url", imageUrl)
    .maybeSingle();

  const imageId =
    existing?.id ??
    (
      await supabaseAdmin
        .from("images")
        .insert({ tenant_id: tenantId, url: imageUrl })
        .select("id")
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    ).id;

  await supabaseAdmin.from("material_images").upsert(
    { material_id: materialId, image_id: imageId, sort_order: 0, is_primary: true },
    { onConflict: "material_id,image_id" }
  );
}

export async function createMaterial(formData: FormData) {
  const tenantId = await getTenantId();
  const input = parseMaterialInput(formData);
  const imageFile = formData.get("image") as File | null;

  const { data, error } = await supabaseAdmin
    .from("materials")
    .insert({
      tenant_id: tenantId,
      category_id: input.categoryId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description || null,
      spec: {},
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (imageFile && imageFile.size > 0) {
    const url = await uploadImageToStorage(imageFile, tenantId, data.id);
    await upsertMaterialImage(tenantId, data.id, url);
  }

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
}

export async function updateMaterial(materialId: string, formData: FormData) {
  const tenantId = await getTenantId();
  const input = parseMaterialInput(formData);
  const imageFile = formData.get("image") as File | null;

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
    .eq("tenant_id", tenantId);
  if (error) throw error;

  if (imageFile && imageFile.size > 0) {
    const url = await uploadImageToStorage(imageFile, tenantId, materialId);
    await upsertMaterialImage(tenantId, materialId, url);
  }

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
}

export async function setMaterialActive(materialId: string, active: boolean) {
  const tenantId = await getTenantId();
  const { error } = await supabaseAdmin
    .from("materials")
    .update({ is_active: active })
    .eq("id", materialId)
    .eq("tenant_id", tenantId);
  if (error) throw error;

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
}

// ============================================================
// Categories
// ============================================================

type CategoryInput = {
  name: string;
  slug: string;
  sortOrder: number;
};

function parseCategoryInput(formData: FormData): CategoryInput {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("カテゴリ名は必須です");

  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = rawSlug ? slugify(rawSlug) : slugify(name);

  return {
    name,
    slug,
    sortOrder: Number(formData.get("sort_order") ?? 0) || 0,
  };
}

export async function createCategory(formData: FormData) {
  const tenantId = await getTenantId();
  const input = parseCategoryInput(formData);
  const imageFile = formData.get("image") as File | null;

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      tenant_id: tenantId,
      name: input.name,
      slug: input.slug,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();
  if (error) throw new Error(`カテゴリの作成に失敗しました: ${error.message}`);

  if (imageFile && imageFile.size > 0) {
    const url = await uploadImageToStorage(
      imageFile,
      tenantId,
      `categories/${data.id}`
    );
    const { error: updErr } = await supabaseAdmin
      .from("categories")
      .update({ image_url: url })
      .eq("id", data.id)
      .eq("tenant_id", tenantId);
    if (updErr) throw updErr;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const tenantId = await getTenantId();
  const input = parseCategoryInput(formData);
  const imageFile = formData.get("image") as File | null;

  const update: {
    name: string;
    slug: string;
    sort_order: number;
    image_url?: string;
  } = {
    name: input.name,
    slug: input.slug,
    sort_order: input.sortOrder,
  };

  if (imageFile && imageFile.size > 0) {
    update.image_url = await uploadImageToStorage(
      imageFile,
      tenantId,
      `categories/${categoryId}`
    );
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .update(update)
    .eq("id", categoryId)
    .eq("tenant_id", tenantId);
  if (error) throw new Error(`カテゴリの更新に失敗しました: ${error.message}`);

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/category/${input.slug}`);
}

export async function deleteCategory(categoryId: string) {
  const tenantId = await getTenantId();

  const { count, error: countErr } = await supabaseAdmin
    .from("materials")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("category_id", categoryId);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) {
    throw new Error("このカテゴリには資材が紐付いているため削除できません");
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("tenant_id", tenantId);
  if (error) throw new Error(`カテゴリの削除に失敗しました: ${error.message}`);

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
}
