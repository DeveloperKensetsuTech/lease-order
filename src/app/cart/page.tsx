"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = () => {
    if (!companyName.trim() || !contactName.trim()) return;

    const num = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      order_number: num,
      company_name: companyName,
      contact_name: contactName,
      phone,
      note,
      items: items.map((i) => ({ name: i.material.name, quantity: i.quantity })),
      created_at: new Date().toISOString(),
      status: "pending",
    };

    const existing = JSON.parse(localStorage.getItem("orders") || "[]");
    existing.push(order);
    localStorage.setItem("orders", JSON.stringify(existing));

    setOrderNumber(num);
    clearCart();
    setStep("done");
  };

  if (step === "done") {
    return (
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-16 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-brand mb-2">発注を受け付けました</h1>
          <p className="text-sm text-gray-500 mb-1">
            注文番号: <span className="font-mono font-bold text-brand">{orderNumber}</span>
          </p>
          <p className="text-sm text-gray-400">担当者より確認のご連絡をいたします。</p>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light"
        >
          トップに戻る
        </Link>
      </main>
    );
  }

  if (items.length === 0 && step === "cart") {
    return (
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-16 text-center">
        <div className="mb-6">
          <svg className="h-16 w-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-400">カートは空です</p>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light"
        >
          資材を探す
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
      {step === "cart" && (
        <>
          <h1 className="text-2xl font-bold text-brand mb-6">カート</h1>
          <div className="space-y-2 mb-8">
            {items.map((item) => (
              <div
                key={item.material.id}
                className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand truncate">
                    {item.material.name}
                  </p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.material.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.material.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.material.id)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep("form")}
            className="w-full py-3 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light"
          >
            発注手続きへ
          </button>
        </>
      )}

      {step === "form" && (
        <>
          <h1 className="text-2xl font-bold text-brand mb-6">発注情報</h1>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                担当者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                備考
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition-colors"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">注文内容</h3>
            {items.map((item) => (
              <div key={item.material.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{item.material.name}</span>
                <span className="text-gray-400">&times; {item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("cart")}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={!companyName.trim() || !contactName.trim()}
              className="flex-1 py-3 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              発注する
            </button>
          </div>
        </>
      )}
    </main>
  );
}
