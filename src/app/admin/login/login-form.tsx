"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    setErrorMessage(null);

    const supabase = createSupabaseBrowserClient();
    const callbackUrl = new URL("/admin/auth/callback", window.location.origin);
    if (next) callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center text-center py-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">メールを送信しました</p>
        <p className="text-sm text-muted leading-relaxed">
          <span className="font-medium text-foreground">{email}</span> 宛のログインリンクを開いてください。
        </p>
        <p className="text-xs text-subtle mt-3">
          届かない場合は迷惑メールフォルダもご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full h-11 px-3.5 bg-surface border border-border-strong rounded-md text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-rose-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !email}
        className="w-full h-11 bg-accent text-white rounded-md text-sm font-semibold tracking-wide hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "sending" ? "送信中…" : "ログインリンクを送信"}
      </button>
    </form>
  );
}
