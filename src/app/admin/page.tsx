import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-brand mb-6">管理画面</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-brand mb-1">発注管理</h2>
          <p className="text-sm text-gray-500">受注の確認・ステータス管理</p>
        </Link>
        <Link
          href="/admin/materials"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-brand mb-1">資材マスタ</h2>
          <p className="text-sm text-gray-500">資材の登録・編集・画像管理</p>
        </Link>
      </div>
    </main>
  );
}
