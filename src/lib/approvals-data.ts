import { getSupabaseTenant } from "./supabase-tenant";
import { getTenantId } from "./tenant";
import {
  listPendingRequests,
  listScheduledReturns,
  listPendingApplications,
  type PendingReturnRequest,
  type PendingExtensionRequest,
  type ScheduledReturnRequest,
} from "./admin-data";

// ============================================================
// 承認インボックス（統合トリアージ）の集約データ層。
//
// 「顧客が申請 → 管理者が承認」系の未対応項目を、種類をまたいで 1 ストリームに
// 正規化する。各ソース（発注 pending / 返却・延長 pending / 受領待ち）の取得は
// admin-data.ts の既存関数を流用し、クエリを再発明しない。
//
// ApprovalItem は discriminated union。registration（会員登録）は別ブランチの
// merge 後に Phase 2 で生成側を足すため、型だけ差込口として宣言しておく。
// ============================================================

export type ApprovalOrderItem = {
  kind: "order";
  id: string; // = order id（リスト key 用）
  orderId: string;
  orderNumber: string;
  siteName: string | null;
  companyName: string;
  contactName: string;
  itemCount: number;
  totalQuantity: number;
  requestedAt: string; // orders.created_at
};

export type ApprovalReturnItem = {
  kind: "return";
  id: string;
  requestedAt: string;
  data: PendingReturnRequest;
};

export type ApprovalExtensionItem = {
  kind: "extension";
  id: string;
  requestedAt: string;
  data: PendingExtensionRequest;
};

export type ApprovalReturnReceiptItem = {
  kind: "return_receipt";
  id: string;
  requestedAt: string;
  data: ScheduledReturnRequest;
};

// 会員登録（顧客セルフ申請 customer_applications）の pending。
// 承認はアカウント発行＋初期パスワード表示を伴う深いフローのため、
// インボックスでは表示・トリアージのみ行い、操作は専用の
// /admin/customers/applications に誘導する（発注の数量修正と同じ方針）。
export type ApprovalRegistrationItem = {
  kind: "registration";
  id: string; // = customer_applications.id
  companyName: string;
  contactName: string | null;
  email: string;
  phone: string | null;
  note: string | null;
  requestedAt: string;
};

export type ApprovalItem =
  | ApprovalOrderItem
  | ApprovalReturnItem
  | ApprovalExtensionItem
  | ApprovalReturnReceiptItem
  | ApprovalRegistrationItem;

export type ApprovalKind = ApprovalItem["kind"];

type PendingOrderRaw = {
  id: string;
  order_number: string;
  site_name: string | null;
  company_name: string;
  contact_name: string;
  created_at: string;
  order_items: { quantity: number }[] | null;
};

// 発注の pending を site_name / created_at まで含めて取得する。
// listOrders は site_name を返さないため、インボックスのカード表示用に専用クエリを持つ。
async function listPendingOrderApprovals(): Promise<ApprovalOrderItem[]> {
  const tenantId = await getTenantId();
  const supabase = await getSupabaseTenant();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, site_name, company_name, contact_name, created_at, order_items(quantity)"
    )
    .eq("tenant_id", tenantId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as unknown as PendingOrderRaw[]).map((row) => ({
    kind: "order" as const,
    id: row.id,
    orderId: row.id,
    orderNumber: row.order_number,
    siteName: row.site_name,
    companyName: row.company_name,
    contactName: row.contact_name,
    itemCount: row.order_items?.length ?? 0,
    totalQuantity: (row.order_items ?? []).reduce(
      (sum, it) => sum + (it.quantity ?? 0),
      0
    ),
    requestedAt: row.created_at,
  }));
}

// 未対応の承認項目を種類をまたいで取得し、申請時刻の降順で 1 ストリームに統合する。
export async function listPendingApprovals(): Promise<ApprovalItem[]> {
  const [orders, pendingRequests, scheduled, applications] = await Promise.all([
    listPendingOrderApprovals(),
    listPendingRequests(),
    listScheduledReturns(),
    listPendingApplications(),
  ]);

  const items: ApprovalItem[] = [...orders];

  for (const a of applications) {
    items.push({
      kind: "registration",
      id: a.id,
      companyName: a.company_name,
      contactName: a.contact_name,
      email: a.contact_email,
      phone: a.phone,
      note: a.note,
      requestedAt: a.created_at,
    });
  }

  for (const r of pendingRequests) {
    if (r.type === "return") {
      items.push({ kind: "return", id: r.id, requestedAt: r.requested_at, data: r });
    } else {
      items.push({ kind: "extension", id: r.id, requestedAt: r.requested_at, data: r });
    }
  }

  for (const s of scheduled) {
    items.push({
      kind: "return_receipt",
      id: s.id,
      requestedAt: s.requested_at,
      data: s,
    });
  }

  items.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return items;
}

// サイドバーの badge 用。インボックスのカード数（＝項目数）と一致するよう
// 項目レベルで head count を取り、合算する。
// 発注 pending ＋ 返却 pending ＋ 延長 pending ＋ 受領待ち（scheduled）＋ 登録申請 pending。
export async function countPendingApprovals(): Promise<number> {
  const tenantId = await getTenantId();
  const supabase = await getSupabaseTenant();
  const [
    ordersRes,
    returnsPendingRes,
    extensionsRes,
    returnsScheduledRes,
    applicationsRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pending"),
    supabase
      .from("return_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pending"),
    supabase
      .from("lease_extensions")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pending"),
    supabase
      .from("return_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "scheduled"),
    supabase
      .from("customer_applications")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pending"),
  ]);

  return (
    (ordersRes.count ?? 0) +
    (returnsPendingRes.count ?? 0) +
    (extensionsRes.count ?? 0) +
    (returnsScheduledRes.count ?? 0) +
    (applicationsRes.count ?? 0)
  );
}
