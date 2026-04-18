import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, statusLabels } from "@/lib/admin-data";
import OrderActions from "./order-actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const st = statusLabels[order.status];
  const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const approvedTotalQty = order.items.reduce(
    (sum, it) => sum + (it.approved_quantity ?? it.quantity),
    0
  );

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* パンくず */}
      <nav className="flex items-center gap-1.5 text-sm text-subtle mb-6">
        <Link href="/admin" className="hover:text-accent transition-colors">
          管理
        </Link>
        <Chevron />
        <Link href="/admin/orders" className="hover:text-accent transition-colors">
          発注管理
        </Link>
        <Chevron />
        <span className="text-accent font-medium">{order.order_number}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-accent">{order.order_number}</h1>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}
          >
            {st.label}
          </span>
        </div>
        <p className="text-sm text-subtle">
          {new Date(order.created_at).toLocaleString("ja-JP")}
        </p>
      </div>

      {/* ステータスタイムライン */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">
          ステータス履歴
        </h2>
        <div className="bg-surface rounded-xl border border-border p-4 space-y-2 text-sm">
          <TimelineRow label="受付" value={order.created_at} />
          <TimelineRow
            label="承認"
            value={order.approved_at}
            extra={order.approved_by ? `by ${order.approved_by}` : undefined}
          />
          <TimelineRow label="出荷" value={order.shipped_at} />
          <TimelineRow label="完了" value={order.completed_at} />
          <TimelineRow label="却下" value={order.rejected_at} />
        </div>
        {order.reject_reason && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-700 mb-1">却下理由</p>
            <p className="text-sm text-red-800 whitespace-pre-wrap">
              {order.reject_reason}
            </p>
          </div>
        )}
      </section>

      {/* 発注者情報 */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">
          発注者情報
        </h2>
        <div className="bg-surface rounded-xl border border-border p-4 space-y-2">
          <Row label="会社名" value={order.company_name} />
          <Row label="担当者" value={order.contact_name} />
          {order.phone && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">電話番号</span>
              <a
                href={`tel:${order.phone}`}
                className="text-accent font-medium underline"
              >
                {order.phone}
              </a>
            </div>
          )}
          {order.email && <Row label="メール" value={order.email} />}
        </div>
        {order.note && (
          <div className="mt-3 bg-surface-muted rounded-xl p-4">
            <p className="text-xs text-subtle mb-1">備考</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {order.note}
            </p>
          </div>
        )}
      </section>

      {/* 注文明細 */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">
          注文明細（{order.items.length}品目 / {totalQty}点
          {order.status !== "pending" && approvedTotalQty !== totalQty
            ? ` → 承認 ${approvedTotalQty}点`
            : ""}
          ）
        </h2>
        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {order.items.map((item) => {
            const approved = item.approved_quantity;
            const isModified = approved !== null && approved !== item.quantity;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-accent truncate">
                    {item.material_name}
                  </p>
                  {item.variant_name && (
                    <p className="text-xs text-subtle truncate">
                      {item.variant_name}
                    </p>
                  )}
                </div>
                <div className="text-sm font-medium text-muted flex-shrink-0 ml-2">
                  {approved !== null ? (
                    isModified ? (
                      <>
                        <span className="text-subtle line-through mr-1">
                          &times; {item.quantity}
                        </span>
                        <span className="text-accent">&times; {approved}</span>
                      </>
                    ) : (
                      <span>&times; {approved}</span>
                    )
                  ) : (
                    <span>&times; {item.quantity}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ステータス変更 */}
      <section>
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">
          操作
        </h2>
        <OrderActions order={order} />
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-accent font-medium">{value}</span>
    </div>
  );
}

function TimelineRow({
  label,
  value,
  extra,
}: {
  label: string;
  value: string | null;
  extra?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={value ? "text-accent" : "text-subtle"}>
        {value ? new Date(value).toLocaleString("ja-JP") : "—"}
        {extra && value && (
          <span className="text-subtle text-xs ml-2">{extra}</span>
        )}
      </span>
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
