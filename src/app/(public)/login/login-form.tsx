"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";

export default function LoginForm({ next }: { next?: string }) {
  const [companyId, setCompanyId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const result = await login({ companyId, password, next });
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      router.push(next || "/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="companyId" className="block text-sm font-medium text-foreground mb-1.5">
          会社 ID
        </label>
        <input
          id="companyId"
          name="companyId"
          type="text"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          autoComplete="username"
          placeholder="C-2026-001"
          className="w-full h-11 px-3.5 bg-surface border border-border-strong rounded-md text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full h-11 px-3.5 bg-surface border border-border-strong rounded-md text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
        />
      </div>

      {errorMessage && (
        <div role="alert" className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !companyId || !password}
        className="w-full h-11 bg-accent text-white rounded-md text-sm font-semibold tracking-wide hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
