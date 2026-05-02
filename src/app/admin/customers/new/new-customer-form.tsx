"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createCustomer } from "../actions";

type CreatedCustomer = { id: string; companyId: string; tempPassword: string; name: string };

export default function NewCustomerForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCustomer | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createCustomer({
        name,
        phone: phone || undefined,
        defaultAddress: defaultAddress || undefined,
        contactEmail: contactEmail || undefined,
      });
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      setCreated({ id: result.id, companyId: result.companyId, tempPassword: result.tempPassword, name });
    });
  }

  if (created) {
    return <CredentialsCard customer={created} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="会社名" required>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="電話番号">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="既定の配送先住所" hint="発注時に配送先のデフォルトとして自動入力されます">
        <input
          type="text"
          value={defaultAddress}
          onChange={(e) => setDefaultAddress(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="連絡先メールアドレス" hint="リース会社からの連絡用">
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="input"
        />
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
          {isPending ? "作成中…" : "作成して ID/PW を発行"}
        </button>
        <Link href="/admin/customers" className="text-sm text-muted hover:text-foreground">
          キャンセル
        </Link>
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
    </form>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-subtle mt-1">{hint}</p>}
    </div>
  );
}

function CredentialsCard({ customer }: { customer: CreatedCustomer }) {
  const [copied, setCopied] = useState<"id" | "pw" | null>(null);

  async function copy(value: string, kind: "id" | "pw") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-green-50 border border-green-200 text-green-900 rounded-md px-4 py-3 text-sm">
        <p className="font-semibold">「{customer.name}」を作成しました</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-md px-4 py-3 text-sm">
        <p className="font-semibold">⚠️ パスワードはこの画面でしか表示されません</p>
        <p className="text-xs mt-1">画面を閉じると再表示できません。コピーして安全な方法で顧客に伝えてください。</p>
      </div>

      <div className="space-y-3">
        <CredentialRow label="会社 ID" value={customer.companyId} copied={copied === "id"} onCopy={() => copy(customer.companyId, "id")} />
        <CredentialRow label="初期パスワード" value={customer.tempPassword} copied={copied === "pw"} onCopy={() => copy(customer.tempPassword, "pw")} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/admin/customers"
          className="px-5 h-10 inline-flex items-center bg-accent text-white text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          一覧に戻る
        </Link>
        <Link href={`/admin/customers/${customer.id}`} className="text-sm text-muted hover:text-foreground">
          詳細を見る
        </Link>
      </div>
    </div>
  );
}

function CredentialRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm font-medium text-muted">{label}</div>
      <code className="flex-1 px-3 py-2 bg-surface-muted border border-border rounded-md font-mono text-sm">{value}</code>
      <button
        type="button"
        onClick={onCopy}
        className="px-3 h-9 inline-flex items-center text-xs font-semibold border border-border-strong rounded-md hover:bg-surface-muted transition-colors"
      >
        {copied ? "コピー済" : "コピー"}
      </button>
    </div>
  );
}
