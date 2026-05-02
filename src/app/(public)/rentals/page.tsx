import Link from "next/link";
import { requireCustomer } from "@/lib/customer-auth";
import { listRentalsByCustomer } from "@/lib/rentals-data";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export default async function RentalsPage() {
  const customer = await requireCustomer();
  const { overdueItems, sites, hasAny } = await listRentalsByCustomer(customer.id, customer.tenant_id);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-accent">レンタル品管理</h1>
        <p className="text-sm text-muted mt-1">現場ごとに、現在借りている資材を確認できます。</p>
      </div>

      {overdueItems.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">期限超過: {overdueItems.length} 件</p>
              <p className="text-xs text-red-700 mt-1 mb-3">返却期限を過ぎた資材があります。返却または期限延長の手続きをしてください。</p>
              <ul className="space-y-1.5">
                {overdueItems.slice(0, 5).map((o) => (
                  <li key={o.item.id}>
                    <Link
                      href={`/rentals/${o.order_id}`}
                      className="text-sm text-red-800 hover:underline inline-flex flex-wrap gap-x-2 items-baseline"
                    >
                      <span className="font-medium">{o.item.material_name}</span>
                      <span className="text-xs">× {o.item.remaining} / 期限 {formatDate(o.item.lease_end_date)}</span>
                      <span className="text-xs text-red-600">（{o.site_name ?? "現場未設定"}）</span>
                    </Link>
                  </li>
                ))}
                {overdueItems.length > 5 && (
                  <li className="text-xs text-red-700">…他 {overdueItems.length - 5} 件</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!hasAny ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center text-sm text-muted">
          <p>現在借りているレンタル品はありません</p>
          <Link
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90"
          >
            資材を発注する
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <section key={site.site_name} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-surface-muted/40">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground truncate">{site.site_name}</h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {site.overdue_item_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        期限超過 {site.overdue_item_count}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {site.active_order_count} 件
                    </span>
                  </div>
                </div>
                {site.soonest_end_date && (
                  <p className="text-xs text-subtle mt-1">最早返却日: {formatDate(site.soonest_end_date)}</p>
                )}
              </div>
              <div>
                {site.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/rentals/${o.id}`}
                    className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-foreground">{o.order_number}</p>
                      <p className="text-xs text-subtle mt-0.5">
                        {o.active_item_count} 品目
                        {o.lease_end_date && <> ・ 期限 {formatDate(o.lease_end_date)}</>}
                      </p>
                    </div>
                    {o.overdue_item_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex-shrink-0">
                        {o.overdue_item_count}
                      </span>
                    )}
                    <svg className="h-4 w-4 text-subtle flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
