import Link from "next/link";
import { countActiveMaterials, countPendingOrders } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pendingCount, materialCount] = await Promise.all([
    countPendingOrders(),
    countActiveMaterials(),
  ]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-brand mb-6">管理画面</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand mb-1">発注管理</h2>
              <p className="text-sm text-gray-500">受注の確認・ステータス管理</p>
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
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand mb-1">資材マスタ</h2>
              <p className="text-sm text-gray-500">資材の登録・編集・画像管理</p>
            </div>
            <span className="text-xs text-gray-400">{materialCount}件</span>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand mb-1">カテゴリマスタ</h2>
              <p className="text-sm text-gray-500">カテゴリの登録・編集・画像管理</p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
