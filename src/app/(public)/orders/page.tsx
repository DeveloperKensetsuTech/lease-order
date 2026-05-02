import Link from "next/link";
import { requireCustomer } from "@/lib/customer-auth";
import { listAllOrdersByCustomer, type OrderStatusFilter } from "@/lib/rentals-data";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "未確認", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "承認済", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "出荷済", color: "bg-purple-100 text-purple-800" },
  completed: { label: "完了", color: "bg-green-100 text-green-800" },
  cancelled: { label: "キャンセル", color: "bg-surface-muted text-muted" },
};

const FILTER_TABS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "active", label: "進行中" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

function formatDateLong(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${y}/${Number(m)}/${Number(d)}`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const customer = await requireCustomer();
  const sp = await searchParams;
  const filter: OrderStatusFilter = (
    ["all", "active", "completed", "cancelled"].includes(sp.status ?? "")
      ? sp.status
      : "all"
  ) as OrderStatusFilter;

  const orders = await listAllOrdersByCustomer(customer.id, customer.tenant_id, filter);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-accent">発注履歴</h1>
        <p className="text-sm text-muted mt-1">これまでの発注を確認できます。</p>
      </div>

      <div className="mb-5 flex gap-1 border-b border-border overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const active = tab.value === filter;
          return (
            <Link
              key={tab.value}
              href={`/orders${tab.value === "all" ? "" : `?status=${tab.value}`}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center text-sm text-muted">
          該当する発注がありません
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {orders.map((o) => {
            const statusMeta = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-surface-muted text-muted" };
            return (
              <Link
                key={o.id}
                href={`/rentals/${o.id}?from=orders`}
                className="flex items-start gap-3 px-5 py-4 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {o.site_name ?? "現場未設定"}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                    {o.overdue_item_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        期限超過 {o.overdue_item_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-subtle mt-0.5">{o.order_number}</p>
                  <p className="text-xs text-subtle mt-0.5">
                    {o.item_count} 品目
                    {o.lease_start_date && o.lease_end_date && (
                      <> ・ {formatDateLong(o.lease_start_date)} 〜 {formatDate(o.lease_end_date)}</>
                    )}
                  </p>
                </div>
                <svg className="h-4 w-4 text-subtle flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
