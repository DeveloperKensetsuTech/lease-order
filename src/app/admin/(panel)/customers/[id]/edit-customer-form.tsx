"use client";

import { useState, useTransition } from "react";
import { resetCustomerPassword, setCustomerActive, updateCustomer } from "../actions";
import type { AdminCustomerRow } from "@/lib/admin-data";

export default function EditCustomerForm({ customer }: { customer: AdminCustomerRow }) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [defaultAddress, setDefaultAddress] = useState(customer.default_address ?? "");
  const [contactEmail, setContactEmail] = useState(customer.contact_email ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await updateCustomer({ id: customer.id, name, phone, defaultAddress, contactEmail });
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      setSavedAt(new Date().toLocaleTimeString("ja-JP"));
    });
  }

  function onResetPassword() {
    if (!confirm("パスワードを再発行します。新しい初期パスワードを顧客に伝える必要があります。よろしいですか？")) return;
    startTransition(async () => {
      const result = await resetCustomerPassword(customer.id);
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      setResetPassword(result.tempPassword);
    });
  }

  function onToggleActive() {
    const next = !customer.is_active;
    if (!confirm(next ? "このアカウントを有効にしますか？" : "このアカウントを無効にしますか？無効化するとログインできなくなります。")) return;
    startTransition(async () => {
      const result = await setCustomerActive(customer.id, next);
      if (!result.ok) {
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {resetPassword && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-md px-4 py-3 text-sm">
          <p className="font-semibold">⚠️ 新しい初期パスワード</p>
          <p className="text-xs mb-2">この画面を閉じると再表示できません。コピーして顧客に伝えてください。</p>
          <code className="block px-3 py-2 bg-surface border border-border rounded-md font-mono text-sm text-foreground">
            {resetPassword}
          </code>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="会社名" required>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>
        <Field label="電話番号">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </Field>
        <Field label="既定の配送先住所">
          <input type="text" value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} className="input" />
        </Field>
        <Field label="連絡先メールアドレス">
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input" />
        </Field>

        {errorMessage && (
          <div role="alert" className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="px-5 h-10 bg-accent text-white text-sm font-semibold rounded-md hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {isPending ? "保存中…" : "保存"}
          </button>
          {savedAt && <span className="text-xs text-green-700">保存しました（{savedAt}）</span>}
        </div>
      </form>

      <div className="border-t border-border pt-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">操作</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onResetPassword}
            disabled={isPending}
            className="px-4 h-10 inline-flex items-center text-sm font-semibold border border-border-strong rounded-md hover:bg-surface-muted disabled:opacity-50 transition-colors"
          >
            パスワード再発行
          </button>
          <button
            type="button"
            onClick={onToggleActive}
            disabled={isPending}
            className={`px-4 h-10 inline-flex items-center text-sm font-semibold border rounded-md transition-colors disabled:opacity-50 ${
              customer.is_active
                ? "border-red-200 text-red-700 hover:bg-red-50"
                : "border-green-200 text-green-700 hover:bg-green-50"
            }`}
          >
            {customer.is_active ? "アカウントを無効化" : "アカウントを有効化"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.875rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          font-size: 0.875rem;
          color: var(--color-foreground);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(4, 56, 76, 0.12);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
