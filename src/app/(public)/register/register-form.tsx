"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitApplication } from "./actions";

export default function RegisterForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const result = await submitApplication({
        companyName,
        contactName: contactName || undefined,
        phone: phone || undefined,
        email,
        note: note || undefined,
      });
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="px-4 py-3 rounded-lg border border-accent/30 bg-[var(--color-accent-soft)] text-sm text-foreground"
        >
          <p className="font-semibold">申請を受け付けました</p>
          <p className="mt-1 leading-relaxed text-muted">
            リース会社による承認後、ログイン情報を入力いただいたメールアドレスにお送りします。
            しばらくお待ちください。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          ← カタログに戻る
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full h-11 px-3.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="companyName" className={labelClass}>
          会社名 <span className="text-danger">*</span>
        </label>
        <input
          id="companyName"
          type="text"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contactName" className={labelClass}>
          ご担当者名
        </label>
        <input
          id="contactName"
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          電話番号
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          メールアドレス <span className="text-danger">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="example@company.co.jp"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-subtle leading-relaxed">
          承認後のログイン情報の連絡に使用します。受信できるアドレスをご入力ください。
        </p>
      </div>

      <div>
        <label htmlFor="note" className={labelClass}>
          備考（任意）
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-colors resize-y"
        />
      </div>

      {errorMessage && (
        <div role="alert" className="px-3 py-2 rounded-lg border border-danger/30 bg-danger-soft text-sm text-danger">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !companyName.trim() || !email.trim()}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-[background,transform] duration-150 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-[0.99] inline-flex items-center justify-center gap-2"
      >
        {isPending ? "送信中…" : "申請する"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
