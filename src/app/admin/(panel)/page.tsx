import Link from "next/link";
import {
  countActiveMaterials,
  countOrdersInMonth,
  countPendingOrders,
  listRecentOrders,
  statusLabels,
} from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pending, monthlyTotal, monthlyCompleted, materialCount, recent] =
    await Promise.all([
      countPendingOrders(),
      countOrdersInMonth(),
      countOrdersInMonth("completed"),
      countActiveMaterials(),
      listRecentOrders(5),
    ]);

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-accent mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          label="未確認の発注"
          value={pending}
          highlight={pending > 0}
          href="/admin/orders?status=pending"
        />
        <StatCard label="今月の発注" value={monthlyTotal} />
        <StatCard label="今月の完了" value={monthlyCompleted} />
        <StatCard
          label="公開中の資材"
          value={materialCount}
          href="/admin/materials"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">直近の発注</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-subtle hover:text-accent transition-colors"
          >
            すべて見る →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-subtle text-sm bg-surface rounded-xl border border-border px-4 py-8 text-center">
            まだ発注はありません
          </p>
        ) : (
          <div className="bg-surface rounded-xl border border-border divide-y divide-border">
            {recent.map((order) => {
              const st = statusLabels[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-muted">
                        {order.order_number}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-accent truncate">
                      {order.company_name}
                    </p>
                  </div>
                  <p className="text-xs text-subtle flex-shrink-0">
                    {new Date(order.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight,
  href,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  href?: string;
}) {
  const content = (
    <div
      className={`p-4 sm:p-5 rounded-xl border transition-all ${
        highlight
          ? "bg-yellow-50 border-yellow-200"
          : "bg-surface border-border"
      } ${href ? "hover:shadow-sm hover:border-border-strong" : ""}`}
    >
      <p className="text-xs text-subtle mb-2">{label}</p>
      <p
        className={`text-2xl sm:text-3xl font-bold ${
          highlight ? "text-yellow-700" : "text-accent"
        }`}
      >
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
