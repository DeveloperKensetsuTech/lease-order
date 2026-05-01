import type { OrderStatus } from "@/lib/order-status";

export type TransitionKind =
  | "approve"
  | "reject"
  | "ship"
  | "complete"
  | "cancel";

// 各ステータスからどのステータスへ遷移できるか（および何の操作扱いか）。
// approve / reject はカンバン上で確認モーダルを開く。
// ship / complete / cancel は即時実行 + 軽い確認のみ。
const TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderStatus, TransitionKind>>
> = {
  pending: {
    approved: "approve",
    rejected: "reject",
    cancelled: "cancel",
  },
  approved: {
    shipped: "ship",
    cancelled: "cancel",
  },
  shipped: {
    completed: "complete",
    cancelled: "cancel",
  },
  completed: {},
  rejected: {},
  cancelled: {},
};

export function transitionFor(
  from: OrderStatus,
  to: OrderStatus
): TransitionKind | null {
  return TRANSITIONS[from][to] ?? null;
}

export const COLUMN_ORDER: OrderStatus[] = [
  "pending",
  "approved",
  "shipped",
  "completed",
  "rejected",
  "cancelled",
];
