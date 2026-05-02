"use client";

import { useState, useTransition } from "react";
import type { AdminUserRow } from "@/lib/admin-data";
import { addAdminUser, removeAdminUser } from "@/app/admin/actions";

export default function AdminUsersView({
  users,
  currentEmail,
}: {
  users: AdminUserRow[];
  currentEmail: string | null;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const handleAdd = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await addAdminUser(formData);
        setEmail("");
        showToast("追加しました");
      } catch (e) {
        setError(e instanceof Error ? e.message : "追加に失敗しました");
      }
    });
  };

  const handleRemove = (u: AdminUserRow) => {
    if (!confirm(`${u.email} を許可リストから削除しますか？`)) return;
    startTransition(async () => {
      try {
        await removeAdminUser(u.id);
        showToast("削除しました");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "削除に失敗しました");
      }
    });
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-accent mb-2">管理ユーザー</h1>
      <p className="text-sm text-subtle mb-6">
        ここに登録されたメールアドレスは、/admin/login からマジックリンクで管理画面にサインインできます。
      </p>

      <section className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-6">
        <form action={handleAdd} className="flex gap-2">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className="flex-1 px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
          >
            {isPending ? "追加中..." : "+ 追加"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          許可リスト ({users.length}件)
        </h2>
        {users.length === 0 ? (
          <p className="text-sm text-subtle text-center py-8 bg-surface border border-border rounded-xl">
            登録されたユーザーはいません
          </p>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {users.map((u) => {
              const isMe =
                currentEmail &&
                u.email.toLowerCase() === currentEmail.toLowerCase();
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-accent truncate">
                        {u.email}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                          自分
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-subtle mt-0.5">
                      登録: {new Date(u.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(u)}
                    disabled={isPending || !!isMe}
                    className="text-xs px-2.5 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-surface-muted disabled:hover:text-muted"
                    title={isMe ? "自分自身は削除できません" : "削除"}
                  >
                    削除
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none">
          <div className="bg-surface rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-accent">{toast}</p>
          </div>
        </div>
      )}
    </main>
  );
}
