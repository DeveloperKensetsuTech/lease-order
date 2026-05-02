import { cache } from "react";
import { supabaseAdmin } from "./supabase-admin";
import { getTenantId } from "./tenant";
import type { Category, DeliveryMethod, Material } from "./types";

export type AdminCategoryRow = Category & { material_count: number };

type AdminMaterialRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  spec: Record<string, string> | null;
  sort_order: number;
  is_active: boolean;
  material_images:
    | {
        sort_order: number;
        is_primary: boolean;
        images: { url: string } | null;
      }[]
    | null;
};

export const listCategoriesForAdmin = cache(
  async (): Promise<AdminCategoryRow[]> => {
    const tenantId = await getTenantId();
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug, image_url, sort_order, materials(id)")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;

    type Row = Category & { materials: { id: string }[] | null };
    return ((data ?? []) as unknown as Row[]).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image_url: row.image_url,
      sort_order: row.sort_order,
      material_count: row.materials?.length ?? 0,
    }));
  }
);

export const listMaterialsForAdmin = cache(async (): Promise<Material[]> => {
  const tenantId = await getTenantId();
  const { data, error } = await supabaseAdmin
    .from("materials")
    .select(
      "id, category_id, name, slug, description, spec, sort_order, is_active, material_images(sort_order, is_primary, images(url))"
    )
    .eq("tenant_id", tenantId)
    .order("sort_order");
  if (error) throw error;

  return ((data ?? []) as unknown as AdminMaterialRow[]).map((row) => {
    const imgs = (row.material_images ?? [])
      .filter((mi) => mi.images?.url)
      .sort((a, b) => a.sort_order - b.sort_order);
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return {
      id: row.id,
      category_id: row.category_id,
      name: row.name,
      slug: row.slug,
      image_url: primary?.images?.url ?? null,
      description: row.description,
      spec: row.spec,
      sort_order: row.sort_order,
      is_active: row.is_active,
      catalog_pages: imgs.map((i) => i.images!.url),
    };
  });
});

export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "shipped"
  | "completed"
  | "cancelled";

export type OrderListRow = {
  id: string;
  order_number: string;
  company_name: string;
  contact_name: string;
  status: OrderStatus;
  created_at: string;
  item_count: number;
  total_quantity: number;
};

export type OrderItemRow = {
  id: string;
  material_id: string;
  variant_id: string | null;
  material_name: string;
  variant_name: string | null;
  quantity: number;
  approved_quantity: number | null;
};

export type OrderPickupOffice = {
  id: string;
  name: string;
  area: string | null;
  address: string | null;
  phone: string | null;
};

export type OrderDetail = {
  id: string;
  order_number: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  delivery_method: DeliveryMethod;
  delivery_address: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  pickup_office: OrderPickupOffice | null;
  status: OrderStatus;
  approved_at: string | null;
  approved_by: string | null;
  reject_reason: string | null;
  rejected_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  created_at: string;
  items: OrderItemRow[];
};

type OrdersListRaw = {
  id: string;
  order_number: string;
  company_name: string;
  contact_name: string;
  status: OrderStatus;
  created_at: string;
  order_items: { quantity: number }[] | null;
};

export async function listOrders(
  filterStatus?: OrderStatus
): Promise<OrderListRow[]> {
  const tenantId = await getTenantId();
  let query = supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, company_name, contact_name, status, created_at, order_items(quantity)"
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as OrdersListRaw[]).map((row) => ({
    id: row.id,
    order_number: row.order_number,
    company_name: row.company_name,
    contact_name: row.contact_name,
    status: row.status,
    created_at: row.created_at,
    item_count: row.order_items?.length ?? 0,
    total_quantity: (row.order_items ?? []).reduce(
      (sum, it) => sum + (it.quantity ?? 0),
      0
    ),
  }));
}

type OrderDetailRaw = {
  id: string;
  order_number: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  delivery_method: DeliveryMethod;
  delivery_address: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  pickup_office_id: string | null;
  status: OrderStatus;
  approved_at: string | null;
  approved_by: string | null;
  reject_reason: string | null;
  rejected_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  created_at: string;
  order_items: (OrderItemRow & { created_at: string })[] | null;
  offices:
    | { id: string; name: string; area: string | null; address: string | null; phone: string | null }
    | null;
};

export const getOrder = cache(async (id: string): Promise<OrderDetail | null> => {
  const tenantId = await getTenantId();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, company_name, contact_name, phone, email, note, delivery_method, delivery_address, lease_start_date, lease_end_date, pickup_office_id, status, approved_at, approved_by, reject_reason, rejected_at, shipped_at, completed_at, created_at, order_items(id, material_id, variant_id, material_name, variant_name, quantity, approved_quantity, created_at), offices:pickup_office_id(id, name, area, address, phone)"
    )
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const raw = data as unknown as OrderDetailRaw;
  const items = (raw.order_items ?? [])
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((it) => ({
      id: it.id,
      material_id: it.material_id,
      variant_id: it.variant_id,
      material_name: it.material_name,
      variant_name: it.variant_name,
      quantity: it.quantity,
      approved_quantity: it.approved_quantity,
    }));

  return {
    id: raw.id,
    order_number: raw.order_number,
    company_name: raw.company_name,
    contact_name: raw.contact_name,
    phone: raw.phone,
    email: raw.email,
    note: raw.note,
    delivery_method: raw.delivery_method,
    delivery_address: raw.delivery_address,
    lease_start_date: raw.lease_start_date,
    lease_end_date: raw.lease_end_date,
    pickup_office: raw.offices ?? null,
    status: raw.status,
    approved_at: raw.approved_at,
    approved_by: raw.approved_by,
    reject_reason: raw.reject_reason,
    rejected_at: raw.rejected_at,
    shipped_at: raw.shipped_at,
    completed_at: raw.completed_at,
    created_at: raw.created_at,
    items,
  };
});

export type AdminCustomerRow = {
  id: string;
  company_id: string;
  name: string;
  phone: string | null;
  default_address: string | null;
  contact_email: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
};

export async function listCustomersForAdmin(): Promise<AdminCustomerRow[]> {
  const tenantId = await getTenantId();
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, company_id, name, phone, default_address, contact_email, is_active, must_change_password, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminCustomerRow[];
}

export async function getCustomerForAdmin(id: string): Promise<AdminCustomerRow | null> {
  const tenantId = await getTenantId();
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, company_id, name, phone, default_address, contact_email, is_active, must_change_password, created_at")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as AdminCustomerRow) ?? null;
}

export async function countCustomers(): Promise<number> {
  const tenantId = await getTenantId();
  const { count, error } = await supabaseAdmin
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

export async function countPendingOrders(): Promise<number> {
  const tenantId = await getTenantId();
  const { count, error } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

export async function countActiveMaterials(): Promise<number> {
  const tenantId = await getTenantId();
  const { count, error } = await supabaseAdmin
    .from("materials")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

export const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "未確認", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "承認済", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "却下", color: "bg-red-100 text-red-800" },
  shipped: { label: "出荷済", color: "bg-purple-100 text-purple-800" },
  completed: { label: "完了", color: "bg-green-100 text-green-800" },
  cancelled: { label: "キャンセル", color: "bg-surface-muted text-muted" },
};
