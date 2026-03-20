"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Order = {
  order_number: string;
  company_name: string;
  contact_name: string;
  phone: string;
  note: string;
  items: { name: string; quantity: number }[];
  created_at: string;
  status: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "未確認", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "確認済", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "出荷済", color: "bg-purple-100 text-purple-800" },
  completed: { label: "完了", color: "bg-green-100 text-green-800" },
  cancelled: { label: "キャンセル", color: "bg-red-100 text-red-800" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const idx = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const data: Order[] = JSON.parse(localStorage.getItem("orders") || "[]").reverse();
    if (data[idx]) {
      setOrder(data[idx]);
    }
  }, [idx]);

  function updateStatus(status: string) {
    const data: Order[] = JSON.parse(localStorage.getItem("orders") || "[]").reverse();
    if (data[idx]) {
      data[idx].status = status;
      localStorage.setItem("orders", JSON.stringify([...data].reverse()));
      setOrder({ ...data[idx] });
    }
  }

  if (!order) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">発注が見つかりません</div>
      </main>
    );
  }

  const st = statusLabels[order.status] || statusLabels.pending;
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* パンくず */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-brand transition-colors">管理</Link>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/admin/orders" className="hover:text-brand transition-colors">発注管理</Link>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-brand font-medium">{order.order_number}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-brand">{order.order_number}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
            {st.label}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {new Date(order.created_at).toLocaleString("ja-JP")}
        </p>
      </div>

      {/* 発注者情報 */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">発注者情報</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">会社名</span>
            <span className="text-brand font-medium">{order.company_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">担当者</span>
            <span className="text-brand font-medium">{order.contact_name}</span>
          </div>
          {order.phone && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">電話番号</span>
              <a href={`tel:${order.phone}`} className="text-brand font-medium underline">{order.phone}</a>
            </div>
          )}
        </div>
        {order.note && (
          <div className="mt-3 bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">備考</p>
            <p className="text-sm text-gray-700">{order.note}</p>
          </div>
        )}
      </section>

      {/* 注文明細 */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          注文明細（{order.items.length}品目 / {totalItems}点）
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-brand">{item.name}</span>
              <span className="text-sm text-gray-500 font-medium">&times; {item.quantity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ステータス変更 */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ステータス変更</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusLabels).map(([key, val]) => (
            <button
              key={key}
              onClick={() => updateStatus(key)}
              disabled={order.status === key}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                order.status === key
                  ? "bg-brand text-white cursor-default"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
