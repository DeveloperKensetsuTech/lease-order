"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { CustomerSession } from "@/lib/customer-auth";
import type { DeliveryMethod, Office } from "@/lib/types";
import { submitOrder } from "./actions";
import AddressAutocomplete from "./address-autocomplete";

type Props = { offices: Office[]; customer: CustomerSession };

export default function CartForm({ offices, customer }: Props) {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [siteName, setSiteName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [note, setNote] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState(customer.default_address ?? "");
  const [pickupOfficeId, setPickupOfficeId] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState("");
  const [leaseEndDate, setLeaseEndDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const officesByArea = offices.reduce<Record<string, Office[]>>((acc, o) => {
    const key = o.area ?? "その他";
    (acc[key] ??= []).push(o);
    return acc;
  }, {});
  const areaOrder = Array.from(
    new Set(offices.map((o) => o.area ?? "その他"))
  );
  const selectedOffice = offices.find((o) => o.id === pickupOfficeId);

  const isFormValid = (() => {
    if (!siteName.trim() || !contactName.trim()) return false;
    if (!leaseStartDate || !leaseEndDate) return false;
    if (leaseEndDate < leaseStartDate) return false;
    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) return false;
    if (deliveryMethod === "pickup" && !pickupOfficeId) return false;
    return true;
  })();

  const handleSubmit = () => {
    if (!isFormValid) return;
    setErrorMessage("");

    startTransition(async () => {
      const result = await submitOrder({
        siteName,
        contactName,
        phone,
        note,
        deliveryMethod,
        deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : "",
        pickupOfficeId: deliveryMethod === "pickup" ? pickupOfficeId : "",
        leaseStartDate,
        leaseEndDate,
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
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90"
        >
          発注画面に戻る
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
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90"
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
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-subtle hover:text-accent transition-colors mb-3"
          >
            <span aria-hidden>←</span> 発注画面に戻る
          </Link>
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
            className="w-full py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90"
          >
            発注手続きへ
          </button>
        </>
      )}

      {step === "form" && (
        <>
          <button
            type="button"
            onClick={() => setStep("cart")}
            className="inline-flex items-center gap-1 text-sm text-subtle hover:text-accent transition-colors mb-3"
          >
            <span aria-hidden>←</span> カートに戻る
          </button>
          <h1 className="text-2xl font-bold text-accent mb-8">発注情報</h1>
          <div className="space-y-10 mb-10">
            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider">発注元</h2>
              <div className="bg-surface-muted rounded-lg px-4 py-3 text-sm">
                <p className="text-xs text-subtle">会社名</p>
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-xs text-subtle font-mono mt-1">{customer.company_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  現場名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="例: ○○ビル新築工事"
                  className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  現場担当者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
                />
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider">受取方法</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    deliveryMethod === "delivery"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-muted text-foreground border-transparent hover:bg-border"
                  }`}
                >
                  配送
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    deliveryMethod === "pickup"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-muted text-foreground border-transparent hover:bg-border"
                  }`}
                >
                  引取
                </button>
              </div>

              {deliveryMethod === "delivery" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    現場住所 <span className="text-red-500">*</span>
                  </label>
                  <AddressAutocomplete
                    value={deliveryAddress}
                    onChange={setDeliveryAddress}
                    placeholder="例: 大分県大分市新貝6番7号"
                  />
                </div>
              )}

              {deliveryMethod === "pickup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    引取営業所 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pickupOfficeId}
                    onChange={(e) => setPickupOfficeId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
                  >
                    <option value="">営業所を選択</option>
                    {areaOrder.map((area) => (
                      <optgroup key={area} label={area}>
                        {officesByArea[area].map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {selectedOffice?.address && (
                    <div className="mt-3 p-3 bg-surface-muted rounded-lg space-y-2">
                      <p className="text-sm text-foreground leading-relaxed">
                        {selectedOffice.address}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOffice.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Google Maps で開く
                      </a>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider">リース期間</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    終了日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaseEndDate}
                    min={leaseStartDate || undefined}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
                  />
                </div>
              </div>
              <p className="text-xs text-subtle">
                {deliveryMethod === "delivery"
                  ? "開始日に現場へお届けします。"
                  : "開始日に営業所でお引き渡しします。"}
              </p>
            </section>

            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider">備考</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="ご要望やご質問があればこちらへ"
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
              />
            </section>
          </div>

          <div className="bg-surface-muted rounded-xl p-5 mb-8">
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
              disabled={!isFormValid || isPending}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "送信中..." : "発注する"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
