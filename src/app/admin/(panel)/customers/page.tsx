import Link from "next/link";
import { listCustomersForAdmin } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await listCustomersForAdmin();

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-accent">顧客管理</h1>
        <Link
          href="/admin/customers/new"
          className="px-4 h-10 inline-flex items-center bg-accent text-white text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          新規追加
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center text-sm text-muted">
          まだ顧客が登録されていません
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_auto] sm:grid-cols-[160px_1fr_120px_auto] gap-4 px-5 py-3 border-b border-border bg-surface-muted text-xs font-medium text-subtle uppercase tracking-wide">
            <div>会社 ID</div>
            <div>会社名</div>
            <div className="hidden sm:block">状態</div>
            <div></div>
          </div>
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/admin/customers/${c.id}`}
              className="grid grid-cols-[140px_1fr_auto] sm:grid-cols-[160px_1fr_120px_auto] gap-4 px-5 py-4 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
            >
              <div className="text-sm font-mono text-foreground">{c.company_id}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
                {c.contact_email && (
                  <div className="text-xs text-subtle truncate">{c.contact_email}</div>
                )}
              </div>
              <div className="hidden sm:flex items-center">
                {c.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    有効
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-muted">
                    無効
                  </span>
                )}
              </div>
              <div className="flex items-center text-subtle">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
