import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/customer-auth";
import { getRentalOrder } from "@/lib/rentals-data";
import ReturnForm from "./return-form";

export const dynamic = "force-dynamic";

function formatDateLong(iso: string | null): string {
  if (!iso) return "未設定";
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export default async function RentalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const customer = await requireCustomer();
  const { orderId } = await params;
  const { from } = await searchParams;
  const order = await getRentalOrder(orderId, customer.id, customer.tenant_id);
  if (!order) notFound();

  const activeItems = order.items.filter((i) => i.remaining > 0);
  const completedItems = order.items.filter((i) => i.remaining === 0);
  const isClosed = order.status === "completed" || order.status === "cancelled";
  const isReadOnly = isClosed;

  const backHref = from === "orders" ? "/orders" : "/rentals";
  const backLabel = from === "orders" ? "発注履歴に戻る" : "レンタル品管理に戻る";

  return (
    <main className={`flex-1 max-w-3xl mx-auto w-full px-4 py-6 ${isReadOnly ? "" : "pb-32"}`}>
      <div className="mb-6">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-subtle hover:text-accent transition-colors mb-3">
          <span aria-hidden>←</span> {backLabel}
        </Link>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-xl font-bold text-accent">{order.site_name ?? "現場未設定"}</h1>
          <span className="text-sm font-mono text-muted">{order.order_number}</span>
        </div>

        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="text-subtle min-w-[5rem]">受取方法</dt>
            <dd className="text-foreground">{order.delivery_method === "delivery" ? "配送" : "引取"}</dd>
          </div>
          {order.delivery_method === "delivery" && order.delivery_address && (
            <div className="flex gap-2 sm:col-span-2">
              <dt className="text-subtle min-w-[5rem]">配送先</dt>
              <dd className="text-foreground">{order.delivery_address}</dd>
            </div>
          )}
          {order.delivery_method === "pickup" && order.pickup_office && (
            <div className="flex gap-2 sm:col-span-2">
              <dt className="text-subtle min-w-[5rem]">引取営業所</dt>
              <dd className="text-foreground">{order.pickup_office.name}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-subtle min-w-[5rem]">リース開始</dt>
            <dd className="text-foreground">{formatDateLong(order.lease_start_date)}</dd>
          </div>
        </dl>
      </div>

      {isClosed && (
        <div className={`mb-6 px-5 py-4 rounded-xl border ${
          order.status === "completed"
            ? "bg-green-50 border-green-200 text-green-900"
            : "bg-surface-muted border-border text-muted"
        }`}>
          <p className="text-sm font-semibold">
            {order.status === "completed" ? "この発注は完了しています" : "この発注はキャンセルされました"}
          </p>
          <p className="text-xs mt-0.5 opacity-80">
            参照のみ可能です。返却・延長操作はできません。
          </p>
        </div>
      )}

      {!isReadOnly && activeItems.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted">
          すべて返却済みです
        </div>
      ) : null}

      {!isReadOnly && activeItems.length > 0 && (
        <ReturnForm orderId={order.id} items={activeItems} extensions={order.extensions} />
      )}

      {isReadOnly && (
        <section>
          <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">明細</h2>
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {order.items.map((it) => (
              <div key={it.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <span className="text-foreground">{it.material_name}</span>
                <span className="text-subtle">× {it.quantity}（返却 {it.returned_quantity}）</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isReadOnly && completedItems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">返却済み</h2>
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {completedItems.map((it) => (
              <div key={it.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <span className="text-foreground">{it.material_name}</span>
                <span className="text-subtle">× {it.quantity} 返却済</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
