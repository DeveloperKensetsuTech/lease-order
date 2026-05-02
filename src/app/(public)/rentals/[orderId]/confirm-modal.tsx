"use client";

import { useEffect } from "react";
import type { RentalItemRow } from "@/lib/rentals-data";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export default function ConfirmModal({
  returns,
  extensions,
  isPending,
  onConfirm,
  onCancel,
}: {
  returns: RentalItemRow[];
  extensions: { item: RentalItemRow; newEndDate: string }[];
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isPending) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, isPending]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-surface w-full sm:max-w-md sm:rounded-xl rounded-t-xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">手続きの確認</h2>
          <p className="text-sm text-muted mt-0.5">以下の内容で確定します。</p>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {returns.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-2">返却 ({returns.length})</h3>
              <ul className="space-y-1.5">
                {returns.map((it) => (
                  <li key={it.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-foreground truncate">{it.material_name}</span>
                    <span className="text-subtle text-xs flex-shrink-0">× {it.quantity}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {extensions.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-2">期限延長 ({extensions.length})</h3>
              <ul className="space-y-1.5">
                {extensions.map(({ item, newEndDate }) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-foreground truncate">{item.material_name}</span>
                    <span className="text-blue-700 text-xs flex-shrink-0">{formatDate(item.lease_end_date)} → {formatDate(newEndDate)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 h-10 text-sm font-medium text-muted hover:text-foreground disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 h-10 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? "処理中…" : "確定する"}
          </button>
        </div>
      </div>
    </div>
  );
}
