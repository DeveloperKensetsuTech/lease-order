"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  approveOrder,
  cancelOrder,
  completeOrder,
  fetchOrderItemsForApproval,
  rejectOrder,
  shipOrder,
  type ApprovalItem,
} from "@/app/admin/actions";
import type { OrderListRow } from "@/lib/admin-data";
import { statusLabels, type OrderStatus } from "@/lib/order-status";
import { COLUMN_ORDER, transitionFor } from "./status-transitions";

type ViewMode = "board" | "list";

type ModalState =
  | { kind: "approve"; orderId: string; items: ApprovalItem[] | null }
  | { kind: "reject"; orderId: string }
  | { kind: "cancel"; orderId: string }
  | null;

export default function OrdersBoardOrList({
  orders,
}: {
  orders: OrderListRow[];
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("board");
  const [modal, setModal] = useState<ModalState>(null);
  const [pendingMoveId, setPendingMoveId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onMoveAttempt = (
    order: OrderListRow,
    target: OrderStatus
  ) => {
    if (order.status === target) return;
    const kind = transitionFor(order.status, target);
    if (!kind) {
      setErrorMsg(
        `${statusLabels[order.status].label} から ${statusLabels[target].label} への変更はできません`
      );
      setTimeout(() => setErrorMsg(null), 2200);
      return;
    }
    if (kind === "approve") {
      setModal({ kind: "approve", orderId: order.id, items: null });
      return;
    }
    if (kind === "reject") {
      setModal({ kind: "reject", orderId: order.id });
      return;
    }
    if (kind === "cancel") {
      setModal({ kind: "cancel", orderId: order.id });
      return;
    }
    // ship / complete — direct
    runMove(order.id, kind);
  };

  const runMove = (orderId: string, kind: "ship" | "complete") => {
    setPendingMoveId(orderId);
    startTransition(async () => {
      try {
        if (kind === "ship") await shipOrder(orderId);
        else await completeOrder(orderId);
        router.refresh();
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "更新に失敗しました");
        setTimeout(() => setErrorMsg(null), 2200);
      } finally {
        setPendingMoveId(null);
      }
    });
  };

  const closeModal = () => setModal(null);

  return (
    <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-accent">発注管理</h1>
        <div className="inline-flex bg-surface-muted rounded-full p-0.5 text-xs font-medium">
          <ToggleButton
            active={view === "board"}
            onClick={() => setView("board")}
          >
            カンバン
          </ToggleButton>
          <ToggleButton
            active={view === "list"}
            onClick={() => setView("list")}
          >
            一覧
          </ToggleButton>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {view === "board" ? (
        <>
          <div className="hidden lg:block">
            <KanbanColumns
              orders={orders}
              pendingMoveId={pendingMoveId}
              onMoveAttempt={onMoveAttempt}
            />
          </div>
          <div className="lg:hidden">
            <PhasedTabs orders={orders} />
          </div>
        </>
      ) : (
        <OrdersTable orders={orders} />
      )}

      {modal?.kind === "approve" && (
        <ApproveModal
          orderId={modal.orderId}
          items={modal.items}
          setItems={(items) =>
            setModal((m) =>
              m && m.kind === "approve" ? { ...m, items } : m
            )
          }
          pending={isPending}
          onClose={closeModal}
          onConfirm={(qtyMap) => {
            startTransition(async () => {
              try {
                await approveOrder(
                  modal.orderId,
                  Object.entries(qtyMap).map(([itemId, q]) => ({
                    itemId,
                    approvedQuantity: q,
                  }))
                );
                closeModal();
                router.refresh();
              } catch (e) {
                setErrorMsg(
                  e instanceof Error ? e.message : "承認に失敗しました"
                );
                setTimeout(() => setErrorMsg(null), 2200);
              }
            });
          }}
        />
      )}

      {modal?.kind === "reject" && (
        <RejectModal
          pending={isPending}
          onClose={closeModal}
          onConfirm={(reason) => {
            startTransition(async () => {
              try {
                await rejectOrder(modal.orderId, reason);
                closeModal();
                router.refresh();
              } catch (e) {
                setErrorMsg(
                  e instanceof Error ? e.message : "却下に失敗しました"
                );
                setTimeout(() => setErrorMsg(null), 2200);
              }
            });
          }}
        />
      )}

      {modal?.kind === "cancel" && (
        <CancelModal
          pending={isPending}
          onClose={closeModal}
          onConfirm={() => {
            startTransition(async () => {
              try {
                await cancelOrder(modal.orderId);
                closeModal();
                router.refresh();
              } catch (e) {
                setErrorMsg(
                  e instanceof Error
                    ? e.message
                    : "キャンセルに失敗しました"
                );
                setTimeout(() => setErrorMsg(null), 2200);
              }
            });
          }}
        />
      )}
    </main>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full transition-colors ${
        active
          ? "bg-surface text-accent shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// Kanban columns (PC)
// ============================================================

function KanbanColumns({
  orders,
  pendingMoveId,
  onMoveAttempt,
}: {
  orders: OrderListRow[];
  pendingMoveId: string | null;
  onMoveAttempt: (order: OrderListRow, target: OrderStatus) => void;
}) {
  const [dragOrderId, setDragOrderId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<OrderStatus | null>(null);

  const byStatus = COLUMN_ORDER.reduce<Record<OrderStatus, OrderListRow[]>>(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<OrderStatus, OrderListRow[]>
  );
  for (const o of orders) byStatus[o.status].push(o);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
      {COLUMN_ORDER.map((status) => {
        const meta = statusLabels[status];
        const items = byStatus[status];
        const dragOrder = orders.find((o) => o.id === dragOrderId);
        const allowed = dragOrder
          ? transitionFor(dragOrder.status, status) !== null ||
            dragOrder.status === status
          : true;
        const isOverDroppable =
          overColumn === status && dragOrder && allowed && dragOrder.status !== status;

        return (
          <div
            key={status}
            onDragOver={(e) => {
              if (!dragOrder) return;
              if (allowed) {
                e.preventDefault();
                setOverColumn(status);
              }
            }}
            onDragLeave={(e) => {
              const related = e.relatedTarget as Node | null;
              if (related && e.currentTarget.contains(related)) return;
              setOverColumn((c) => (c === status ? null : c));
            }}
            onDrop={() => {
              if (!dragOrder) return;
              setOverColumn(null);
              if (dragOrder.status === status) return;
              onMoveAttempt(dragOrder, status);
              setDragOrderId(null);
            }}
            className={`flex-shrink-0 w-72 flex flex-col rounded-xl border transition-colors ${
              isOverDroppable
                ? "border-accent bg-accent/5"
                : dragOrder && !allowed
                  ? "border-border bg-surface-muted opacity-60"
                  : "border-border bg-surface-muted"
            }`}
          >
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}
                >
                  {meta.label}
                </span>
                <span className="text-xs text-subtle">{items.length}</span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2 min-h-[60vh]">
              {items.length === 0 ? (
                <p className="text-xs text-subtle text-center py-6">なし</p>
              ) : (
                items.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    isDragging={dragOrderId === order.id}
                    isPending={pendingMoveId === order.id}
                    onDragStart={() => setDragOrderId(order.id)}
                    onDragEnd={() => {
                      setDragOrderId(null);
                      setOverColumn(null);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  order,
  isDragging,
  isPending,
  onDragStart,
  onDragEnd,
}: {
  order: OrderListRow;
  isDragging: boolean;
  isPending: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`block bg-surface rounded-lg border border-border p-3 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50" : ""
      } ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[11px] text-muted">
          {order.order_number}
        </span>
        <span className="text-[10px] text-subtle">
          {new Date(order.created_at).toLocaleDateString("ja-JP", {
            month: "numeric",
            day: "numeric",
          })}
        </span>
      </div>
      <p className="text-sm font-medium text-accent truncate mb-1">
        {order.company_name}
      </p>
      <p className="text-xs text-subtle truncate">{order.contact_name}</p>
      <p className="text-[10px] text-subtle mt-1.5">
        {order.item_count}品目 / {order.total_quantity}点
      </p>
    </Link>
  );
}

// ============================================================
// Phased tabs (mobile)
// ============================================================

function PhasedTabs({ orders }: { orders: OrderListRow[] }) {
  const [active, setActive] = useState<OrderStatus>("pending");
  const filtered = orders.filter((o) => o.status === active);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {COLUMN_ORDER.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          const isActive = active === status;
          return (
            <button
              key={status}
              onClick={() => setActive(status)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-muted text-muted hover:bg-border"
              }`}
            >
              <span>{statusLabels[status].label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-surface text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-subtle text-center py-12">該当する発注はありません</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block bg-surface p-4 rounded-xl border border-border hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-muted">
                  {order.order_number}
                </span>
                <span className="text-xs text-subtle">
                  {new Date(order.created_at).toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="font-medium text-accent truncate">
                {order.company_name} - {order.contact_name}
              </p>
              <p className="text-xs text-subtle mt-1">
                {order.item_count}品目 / {order.total_quantity}点
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

// ============================================================
// List view (table-like)
// ============================================================

function OrdersTable({ orders }: { orders: OrderListRow[] }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`すべて (${orders.length})`}
        />
        {COLUMN_ORDER.map((s) => {
          const c = orders.filter((o) => o.status === s).length;
          return (
            <FilterChip
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
              label={`${statusLabels[s].label} (${c})`}
            />
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-subtle text-center py-12">発注はありません</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const st = statusLabels[order.status];
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block bg-surface p-4 rounded-xl border border-border hover:bg-surface-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted">
                        {order.order_number}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="font-medium text-accent truncate">
                      {order.company_name} - {order.contact_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-subtle">
                        {new Date(order.created_at).toLocaleString("ja-JP")}
                      </p>
                      <p className="text-xs text-subtle">
                        {order.item_count}品目 / {order.total_quantity}点
                      </p>
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-subtle flex-shrink-0 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface-muted text-muted hover:bg-border"
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================
// Modals
// ============================================================

function ModalShell({
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
        className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-accent">{title}</h2>
            <button
              onClick={onClose}
              className="text-subtle hover:text-muted"
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
  confirmVariant = "accent",
}: {
  pending: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmVariant?: "accent" | "danger";
}) {
  const cls =
    confirmVariant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onCancel}
        disabled={pending}
        className="flex-1 py-2.5 border border-border-strong text-foreground rounded-full text-sm font-medium hover:bg-surface-muted disabled:opacity-40"
      >
        戻る
      </button>
      <button
        onClick={onConfirm}
        disabled={pending || disabled}
        className={`flex-1 py-2.5 rounded-full text-sm font-medium disabled:opacity-40 ${cls}`}
      >
        {pending ? "処理中..." : confirmLabel}
      </button>
    </div>
  );
}

function ApproveModal({
  orderId,
  items,
  setItems,
  pending,
  onClose,
  onConfirm,
}: {
  orderId: string;
  items: ApprovalItem[] | null;
  setItems: (items: ApprovalItem[]) => void;
  pending: boolean;
  onClose: () => void;
  onConfirm: (qtyMap: Record<string, number>) => void;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});

  useEffect(() => {
    if (items === null) {
      fetchOrderItemsForApproval(orderId)
        .then((rows) => {
          setItems(rows);
          setQty(Object.fromEntries(rows.map((r) => [r.id, r.quantity])));
        })
        .catch(() => onClose());
    } else if (Object.keys(qty).length === 0) {
      setQty(Object.fromEntries(items.map((r) => [r.id, r.quantity])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, items]);

  return (
    <ModalShell title="発注を承認" onClose={onClose}>
      {items === null ? (
        <p className="text-sm text-subtle py-6 text-center">読み込み中…</p>
      ) : (
        <>
          <p className="text-sm text-muted mb-4">
            必要に応じて承認数量を修正してください。
          </p>
          <div className="space-y-2 mb-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="text-accent truncate">{it.material_name}</p>
                  {it.variant_name && (
                    <p className="text-xs text-subtle truncate">
                      {it.variant_name}
                    </p>
                  )}
                  <p className="text-xs text-subtle">発注: {it.quantity}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={qty[it.id] ?? it.quantity}
                  onChange={(e) =>
                    setQty((p) => ({
                      ...p,
                      [it.id]: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-20 px-3 py-2 bg-surface-muted rounded-lg text-sm text-right focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
              </div>
            ))}
          </div>
          <ModalFooter
            pending={pending}
            onCancel={onClose}
            onConfirm={() => onConfirm(qty)}
            confirmLabel="承認"
          />
        </>
      )}
    </ModalShell>
  );
}

function RejectModal({
  pending,
  onClose,
  onConfirm,
}: {
  pending: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <ModalShell title="発注を却下" onClose={onClose}>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        却下理由 <span className="text-red-500">*</span>
      </label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder="在庫不足、納期不可 など"
        className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
      />
      <ModalFooter
        pending={pending}
        disabled={!reason.trim()}
        onCancel={onClose}
        onConfirm={() => onConfirm(reason.trim())}
        confirmLabel="却下"
        confirmVariant="danger"
      />
    </ModalShell>
  );
}

function CancelModal({
  pending,
  onClose,
  onConfirm,
}: {
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell title="発注をキャンセル" onClose={onClose}>
      <p className="text-sm text-muted">
        この発注をキャンセル状態にします。元に戻せません。
      </p>
      <ModalFooter
        pending={pending}
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmLabel="キャンセルする"
        confirmVariant="danger"
      />
    </ModalShell>
  );
}
