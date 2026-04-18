"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { submitOrder } from "./actions";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!companyName.trim() || !contactName.trim()) return;
    setErrorMessage("");

    startTransition(async () => {
      const result = await submitOrder({
        companyName,
        contactName,
        phone,
        note,
        items: items.map((i) => ({
          materialId: i.material.id,
          quantity: i.quantity,
        })),
      });

      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }

      setOrderNumber(result.orderNumber);
      clearCart();
      setStep("done");
    });
  };

  if (step === "done") {
    return (
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-16 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-accent mb-2">発注を受け付けました</h1>
          <p className="text-sm text-muted mb-1">
            注文番号: <span className="font-mono font-bold text-accent">{orderNumber}</span>
          </p>
          <p className="text-sm text-subtle">担当者より確認のご連絡をいたします。</p>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover"
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
          <svg className="h-16 w-16 text-subtle mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-subtle">カートは空です</p>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover"
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
          <h1 className="text-2xl font-bold text-accent mb-6">カート</h1>
          <div className="space-y-2 mb-8">
            {items.map((item) => (
              <div
                key={item.material.id}
                className="flex items-center gap-3 bg-surface p-4 rounded-xl border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-accent truncate">
                    {item.material.name}
                  </p>
                </div>
                <div className="flex items-center border border-border-strong rounded-full overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.material.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-muted hover:bg-surface-muted text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.material.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-muted hover:bg-surface-muted text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.material.id)}
                  className="text-subtle hover:text-muted transition-colors"
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
            className="w-full py-3 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover"
          >
            発注手続きへ
          </button>
        </>
      )}

      {step === "form" && (
        <>
          <h1 className="text-2xl font-bold text-accent mb-6">発注情報</h1>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                担当者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                備考
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          <div className="bg-surface-muted rounded-xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">注文内容</h3>
            {items.map((item) => (
              <div key={item.material.id} className="flex justify-between text-sm py-1">
                <span className="text-foreground">{item.material.name}</span>
                <span className="text-subtle">&times; {item.quantity}</span>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("cart")}
              disabled={isPending}
              className="flex-1 py-3 border border-border-strong text-foreground rounded-full text-sm font-medium hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={!companyName.trim() || !contactName.trim() || isPending}
              className="flex-1 py-3 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "送信中..." : "発注する"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
