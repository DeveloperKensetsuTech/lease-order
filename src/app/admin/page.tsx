import Link from "next/link";
import { countActiveMaterials, countCustomers, countPendingOrders } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pendingCount, materialCount, customerCount] = await Promise.all([
    countPendingOrders(),
    countActiveMaterials(),
    countCustomers(),
  ]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-accent mb-6">管理画面</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/orders"
          className="bg-surface p-6 rounded-xl border border-border-strong hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-accent mb-1">発注管理</h2>
              <p className="text-sm text-muted">受注の確認・ステータス管理</p>
            </div>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                {pendingCount}
              </span>
            )}
          </div>
        </Link>
        <Link
          href="/admin/materials"
          className="bg-surface p-6 rounded-xl border border-border-strong hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-accent mb-1">資材マスタ</h2>
              <p className="text-sm text-muted">資材の登録・編集・画像管理</p>
            </div>
            <span className="text-xs text-subtle">{materialCount}件</span>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="bg-surface p-6 rounded-xl border border-border-strong hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-accent mb-1">カテゴリマスタ</h2>
              <p className="text-sm text-muted">カテゴリの登録・編集・画像管理</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/customers"
          className="bg-surface p-6 rounded-xl border border-border-strong hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-accent mb-1">顧客管理</h2>
              <p className="text-sm text-muted">借り主アカウントの発行・管理</p>
            </div>
            <span className="text-xs text-subtle">{customerCount}件</span>
          </div>
        </Link>
      </div>
    </main>
  );
}
