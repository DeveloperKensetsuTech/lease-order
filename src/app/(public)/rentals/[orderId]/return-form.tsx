"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RentalItemRow } from "@/lib/rentals-data";
import { processItemActions } from "../actions";
import ExtendDialog from "./extend-dialog";
import ConfirmModal from "./confirm-modal";

type RowState =
  | { kind: "return" }
  | { kind: "extend"; newEndDate: string; reason: string }
  | { kind: "skip" };

type Props = {
  orderId: string;
  items: RentalItemRow[];
  extensions: Record<string, { previous_end_date: string; new_end_date: string; reason: string | null; requested_at: string }[]>;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export default function ReturnForm({ orderId, items, extensions }: Props) {
  const router = useRouter();
  const [states, setStates] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    for (const it of items) init[it.id] = { kind: "return" };
    return init;
  });
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const returns = items.filter((it) => states[it.id]?.kind === "return");
    const extendsItems = items.filter((it) => states[it.id]?.kind === "extend");
    return { returns, extendsItems };
  }, [items, states]);

  function handleToggle(itemId: string, checked: boolean) {
    setStates((prev) => ({ ...prev, [itemId]: checked ? { kind: "return" } : { kind: "skip" } }));
  }

  function handleExtendOpen(itemId: string) {
    setExtendingId(itemId);
  }

  function handleExtendConfirm(itemId: string, newEndDate: string, reason: string) {
    setStates((prev) => ({ ...prev, [itemId]: { kind: "extend", newEndDate, reason } }));
    setExtendingId(null);
  }

  function handleExtendCancel(itemId: string) {
    setStates((prev) => ({ ...prev, [itemId]: { kind: "return" } }));
  }

  const extendingItem = extendingId ? items.find((it) => it.id === extendingId) ?? null : null;

  function handleSubmit() {
    const actions = items
      .map((it) => {
        const s = states[it.id];
        if (!s) return null;
        if (s.kind === "return") {
          return { type: "return" as const, orderItemId: it.id, returnedQuantity: it.quantity };
        }
        if (s.kind === "extend") {
          return { type: "extend" as const, orderItemId: it.id, newEndDate: s.newEndDate, reason: s.reason };
        }
        return null;
      })
      .filter((a): a is NonNullable<typeof a> => Boolean(a));

    if (actions.length === 0) {
      setErrorMessage("操作対象がありません");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await processItemActions({ orderId, actions });
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      setShowConfirm(false);
      router.push("/rentals");
      router.refresh();
    });
  }

  const hasAnyAction = summary.returns.length > 0 || summary.extendsItems.length > 0;

  return (
    <>
      <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
        {items.map((it) => {
          const state = states[it.id] ?? { kind: "return" as const };
          const checked = state.kind === "return";
          const overdueBorder = it.is_overdue ? "border-l-4 border-l-red-500" : "";
          return (
            <div key={it.id} className={`px-4 py-4 sm:px-5 ${overdueBorder}`}>
              <div className="flex items-start gap-3">
                <input
                  id={`r-${it.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleToggle(it.id, e.target.checked)}
                  disabled={state.kind === "extend"}
                  className="mt-1 h-5 w-5 rounded border-border-strong text-accent focus:ring-accent/30 disabled:opacity-40"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={`r-${it.id}`} className="block">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-foreground">{it.material_name}</span>
                      {it.is_overdue && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          期限超過
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-subtle mt-0.5">
                      数量 {it.quantity}
                      {it.returned_quantity > 0 && <> ・ 返却済 {it.returned_quantity}</>}
                      {it.lease_end_date && <> ・ 期限 {formatDate(it.lease_end_date)}</>}
                    </div>
                  </label>

                  {state.kind === "extend" && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
                      <span>延長予定: {formatDate(state.newEndDate)}</span>
                      <button
                        type="button"
                        onClick={() => handleExtendCancel(it.id)}
                        className="text-blue-700 hover:text-blue-900 underline"
                      >
                        取消
                      </button>
                    </div>
                  )}

                  {extensions[it.id]?.length > 0 && (
                    <details className="mt-2 text-xs text-subtle">
                      <summary className="cursor-pointer hover:text-foreground">延長履歴 ({extensions[it.id].length})</summary>
                      <ul className="mt-1 space-y-0.5 ml-3">
                        {extensions[it.id].map((e, i) => (
                          <li key={i}>
                            {formatDate(e.previous_end_date)} → {formatDate(e.new_end_date)}
                            {e.reason && <> （{e.reason}）</>}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {state.kind !== "extend" && (
                    <button
                      type="button"
                      onClick={() => handleExtendOpen(it.id)}
                      className="px-3 h-8 inline-flex items-center text-xs font-semibold border border-border-strong rounded-md hover:bg-surface-muted transition-colors"
                    >
                      延長
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div role="alert" className="mt-4 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border px-4 py-3 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 text-xs text-muted">
            {summary.returns.length > 0 && <span className="mr-3">返却 {summary.returns.length} 件</span>}
            {summary.extendsItems.length > 0 && <span className="mr-3">延長 {summary.extendsItems.length} 件</span>}
            {!hasAnyAction && <span>操作対象を選択してください</span>}
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!hasAnyAction || isPending}
            className="px-5 h-11 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            返却手続きへ進む
          </button>
        </div>
      </div>

      {extendingItem && (
        <ExtendDialog
          item={extendingItem}
          onConfirm={(newEndDate, reason) => handleExtendConfirm(extendingItem.id, newEndDate, reason)}
          onCancel={() => setExtendingId(null)}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          returns={summary.returns}
          extensions={summary.extendsItems.map((it) => {
            const s = states[it.id];
            return { item: it, newEndDate: s?.kind === "extend" ? s.newEndDate : "" };
          })}
          isPending={isPending}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
