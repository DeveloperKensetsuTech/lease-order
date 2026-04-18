import Link from "next/link";
import {
  listOrders,
  statusLabels,
  type OrderStatus,
} from "@/lib/admin-data";

const STATUS_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "pending", label: "未確認" },
  { key: "approved", label: "承認済" },
  { key: "shipped", label: "出荷済" },
  { key: "completed", label: "完了" },
  { key: "rejected", label: "却下" },
  { key: "cancelled", label: "キャンセル" },
];

function isOrderStatus(v: string | undefined): v is OrderStatus {
  return (
    v === "pending" ||
    v === "approved" ||
    v === "rejected" ||
    v === "shipped" ||
    v === "completed" ||
    v === "cancelled"
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter: OrderStatus | "all" = isOrderStatus(status) ? status : "all";
  const orders = await listOrders(activeFilter === "all" ? undefined : activeFilter);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-accent mb-6">発注管理</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {STATUS_FILTERS.map((f) => {
          const href =
            f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`;
          const isActive = activeFilter === f.key;
          return (
            <Link
              key={f.key}
              href={href}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-surface-muted text-muted hover:bg-border"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="text-subtle text-center py-12">発注はありません</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const st = statusLabels[order.status];
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block bg-surface p-4 rounded-xl border border-border hover:bg-surface-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted">
                        {order.order_number}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="font-medium text-accent truncate">
                      {order.company_name} - {order.contact_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-subtle">
                        {new Date(order.created_at).toLocaleString("ja-JP")}
                      </p>
                      <p className="text-xs text-subtle">
                        {order.item_count}品目 / {order.total_quantity}点
                      </p>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-subtle flex-shrink-0 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
