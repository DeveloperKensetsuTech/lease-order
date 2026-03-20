"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  order_number: string;
  company_name: string;
  contact_name: string;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(data.reverse());
  }, []);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-brand mb-6">発注管理</h1>

      {orders.length === 0 ? (
        <p className="text-gray-400 text-center py-12">発注はまだありません</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order, idx) => {
            const st = statusLabels[order.status] || statusLabels.pending;
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <Link
                key={idx}
                href={`/admin/orders/${idx}`}
                className="block bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">{order.order_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="font-medium text-brand">{order.company_name} - {order.contact_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString("ja-JP")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.items.length}品目 / {itemCount}点
                      </p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
