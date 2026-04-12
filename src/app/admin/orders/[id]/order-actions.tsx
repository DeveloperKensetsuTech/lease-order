"use client";

import { useState, useTransition } from "react";
import {
  approveOrder,
  cancelOrder,
  completeOrder,
  rejectOrder,
  shipOrder,
} from "@/app/admin/actions";
import type { OrderDetail, OrderStatus } from "@/lib/admin-data";

type Props = {
  order: OrderDetail;
};

export default function OrderActions({ order }: Props) {
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<null | "approve" | "reject" | "cancel">(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvedQtys, setApprovedQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      order.items.map((it) => [it.id, it.approved_quantity ?? it.quantity])
    )
  );
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        setModal(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  };

  const status: OrderStatus = order.status;
  const canApprove = status === "pending";
  const canReject = status === "pending";
  const canShip = status === "approved";
  const canComplete = status === "shipped";
  const canCancel = status === "pending" || status === "approved" || status === "shipped";
  const noActions = !canApprove && !canReject && !canShip && !canComplete && !canCancel;

  if (noActions) {
    return (
      <p className="text-sm text-gray-400">この発注は {status} 状態のため操作できません。</p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <button
            onClick={() => setModal("approve")}
            disabled={isPending}
            className="text-sm px-4 py-2 rounded-full bg-brand text-white font-medium hover:bg-brand-light disabled:opacity-40"
          >
            承認する
          </button>
        )}
        {canReject && (
          <button
            onClick={() => setModal("reject")}
            disabled={isPending}
            className="text-sm px-4 py-2 rounded-full bg-red-50 text-red-700 font-medium hover:bg-red-100 disabled:opacity-40"
          >
            却下する
          </button>
        )}
        {canShip && (
          <button
            onClick={() =>
              run(async () => {
                await shipOrder(order.id);
              })
            }
            disabled={isPending}
            className="text-sm px-4 py-2 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-40"
          >
            出荷済にする
          </button>
        )}
        {canComplete && (
          <button
            onClick={() =>
              run(async () => {
                await completeOrder(order.id);
              })
            }
            disabled={isPending}
            className="text-sm px-4 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-40"
          >
            完了にする
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setModal("cancel")}
            disabled={isPending}
            className="text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 disabled:opacity-40"
          >
            キャンセル
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {modal === "approve" && (
        <Modal title="発注を承認" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500 mb-4">
            必要に応じて承認数量を修正してください。
          </p>
          <div className="space-y-2 mb-6">
            {order.items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="text-brand truncate">{it.material_name}</p>
                  {it.variant_name && (
                    <p className="text-xs text-gray-400 truncate">
                      {it.variant_name}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">発注: {it.quantity}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={approvedQtys[it.id]}
                  onChange={(e) =>
                    setApprovedQtys((prev) => ({
                      ...prev,
                      [it.id]: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-20 px-3 py-2 bg-gray-100 rounded-lg text-sm text-right focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand"
                />
              </div>
            ))}
          </div>
          <ModalFooter
            pending={isPending}
            onCancel={() => setModal(null)}
            onConfirm={() =>
              run(async () => {
                await approveOrder(
                  order.id,
                  order.items.map((it) => ({
                    itemId: it.id,
                    approvedQuantity: approvedQtys[it.id] ?? it.quantity,
                  }))
                );
              })
            }
            confirmLabel="承認"
          />
        </Modal>
      )}

      {modal === "reject" && (
        <Modal title="発注を却下" onClose={() => setModal(null)}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            却下理由 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="在庫不足、納期不可 など"
            className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand mb-6"
          />
          <ModalFooter
            pending={isPending}
            disabled={!rejectReason.trim()}
            onCancel={() => setModal(null)}
            onConfirm={() =>
              run(async () => {
                await rejectOrder(order.id, rejectReason.trim());
              })
            }
            confirmLabel="却下"
            confirmVariant="danger"
          />
        </Modal>
      )}

      {modal === "cancel" && (
        <Modal title="発注をキャンセル" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500 mb-6">
            この発注をキャンセル状態にします。元に戻せません。
          </p>
          <ModalFooter
            pending={isPending}
            onCancel={() => setModal(null)}
            onConfirm={() =>
              run(async () => {
                await cancelOrder(order.id);
              })
            }
            confirmLabel="キャンセルする"
            confirmVariant="danger"
          />
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalFooter({
  pending,
  disabled,
  onCancel,
  onConfirm,
  confirmLabel,
  confirmVariant = "brand",
}: {
  pending: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmVariant?: "brand" | "danger";
}) {
  const confirmClass =
    confirmVariant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-brand text-white hover:bg-brand-light";
  return (
    <div className="flex gap-3">
      <button
        onClick={onCancel}
        disabled={pending}
        className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
      >
        戻る
      </button>
      <button
        onClick={onConfirm}
        disabled={pending || disabled}
        className={`flex-1 py-2.5 rounded-full text-sm font-medium disabled:opacity-40 ${confirmClass}`}
      >
        {pending ? "処理中..." : confirmLabel}
      </button>
    </div>
  );
}
