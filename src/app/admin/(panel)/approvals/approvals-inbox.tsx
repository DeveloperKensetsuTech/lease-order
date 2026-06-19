"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApprovalItem, ApprovalKind } from "@/lib/approvals-data";
import {
  ExtensionRequestActions,
  PendingReturnActions,
  ScheduledReturnActions,
} from "../requests/request-actions";

type OfficeOption = { id: string; name: string };

type FilterKey = "all" | ApprovalKind;

const KIND_BADGE: Record<ApprovalKind, { label: string; className: string }> = {
  order: {
    label: "発注",
    className: "bg-[var(--color-accent-soft)] text-accent",
  },
  return: { label: "返却", className: "bg-info-soft text-info" },
  extension: {
    label: "延長",
    className:
      "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-fg)]",
  },
  return_receipt: {
    label: "受領待ち",
    className:
      "bg-[var(--color-status-shipped-bg)] text-[var(--color-status-shipped-fg)]",
  },
  registration: {
    label: "登録",
    className:
      "bg-[var(--color-status-approved-bg)] text-[var(--color-status-approved-fg)]",
  },
};

// インボックスに常設するフィルタ。登録は Phase 2 で項目が出るまでは
// 件数 0 のため自動的に非表示になる（下の visibleFilters 参照）。
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "order", label: "発注" },
  { key: "return", label: "返却" },
  { key: "extension", label: "延長" },
  { key: "return_receipt", label: "受領待ち" },
  { key: "registration", label: "登録" },
];

function formatDateLong(iso: string | null): string {
  if (!iso) return "未設定";
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 時間前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 日前`;
  return new Date(iso).toLocaleDateString("ja-JP");
}

function transportLabel(
  method: "pickup" | "dropoff" | null,
  officeName: string | null
): string {
  if (method === "pickup") return "取りに来てもらう";
  if (method === "dropoff") return `持ち込み${officeName ? `（${officeName}）` : ""}`;
  return "未指定";
}

export default function ApprovalsInbox({
  items,
  offices,
}: {
  items: ApprovalItem[];
  offices: OfficeOption[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = items.reduce(
    (acc, it) => {
      acc[it.kind] = (acc[it.kind] ?? 0) + 1;
      return acc;
    },
    {} as Record<ApprovalKind, number>
  );

  // 件数 0 の種類フィルタは隠す（"すべて" と現在選択中は常に残す）。
  const visibleFilters = FILTERS.filter(
    (f) => f.key === "all" || f.key === filter || (counts[f.key] ?? 0) > 0
  );

  const filtered =
    filter === "all" ? items : items.filter((it) => it.kind === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="申請の種類で絞り込み">
        {visibleFilters.map((f) => {
          const count = f.key === "all" ? items.length : counts[f.key] ?? 0;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? "border-accent bg-[var(--color-accent-soft)] text-accent"
                  : "border-rule bg-surface text-muted hover:text-foreground"
              }`}
            >
              {f.label}
              <span className="font-[family-name:var(--font-mono)] tabular-nums text-[10px] text-subtle">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 py-14 border border-rule rounded-[var(--radius-lg)] bg-surface">
          <p className="text-sm font-medium text-foreground">
            未対応の項目はありません
          </p>
          <p className="mt-1.5 text-xs text-muted max-w-sm leading-relaxed">
            新しい申請が届くと、ここに表示されます。
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <ApprovalCard item={item} offices={offices} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ApprovalCard({
  item,
  offices,
}: {
  item: ApprovalItem;
  offices: OfficeOption[];
}) {
  return (
    <article className="border border-rule rounded-[var(--radius-lg)] bg-surface overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <KindBadge kind={item.kind} />
          <CardBody item={item} />
        </div>
        <CardActions item={item} offices={offices} />
      </div>
    </article>
  );
}

function KindBadge({ kind }: { kind: ApprovalKind }) {
  const b = KIND_BADGE[kind];
  return (
    <span
      className={`inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold ${b.className}`}
    >
      {b.label}
    </span>
  );
}

function OrderContext({
  orderNumber,
  siteName,
  companyName,
  contactName,
}: {
  orderNumber: string;
  siteName: string | null;
  companyName: string;
  contactName: string;
}) {
  return (
    <div className="mt-1.5">
      <p className="font-[family-name:var(--font-mono)] text-[11px] text-subtle">
        {orderNumber}
      </p>
      <p className="text-sm font-semibold text-foreground truncate">
        {siteName ?? "（現場未設定）"}
      </p>
      <p className="text-xs text-muted mt-0.5">
        {companyName} ／ {contactName}
      </p>
    </div>
  );
}

function CardBody({ item }: { item: ApprovalItem }) {
  switch (item.kind) {
    case "order":
      return (
        <>
          <OrderContext
            orderNumber={item.orderNumber}
            siteName={item.siteName}
            companyName={item.companyName}
            contactName={item.contactName}
          />
          <p className="text-xs text-muted mt-1.5">
            {item.itemCount} 品目 ・ 合計{" "}
            <span className="tabular-nums text-foreground">{item.totalQuantity}</span> 点
          </p>
          <p className="text-xs text-subtle mt-1">{formatRelative(item.requestedAt)}</p>
        </>
      );
    case "return": {
      const r = item.data;
      return (
        <>
          <OrderContext
            orderNumber={r.order_number}
            siteName={r.site_name}
            companyName={r.company_name}
            contactName={r.contact_name}
          />
          <div className="flex items-baseline gap-2 flex-wrap mt-1.5">
            <span className="text-sm font-medium text-foreground">{r.material_name}</span>
            <span className="text-sm text-foreground tabular-nums">
              × {r.requested_quantity_delta}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            希望: {transportLabel(r.transport_method, r.dropoff_office_name)}
            {r.desired_date && ` ・ ${r.desired_date}`}
          </p>
          {r.reason && <p className="text-xs text-muted mt-1">理由: {r.reason}</p>}
          <p className="text-xs text-subtle mt-1">{formatRelative(r.requested_at)}</p>
        </>
      );
    }
    case "extension": {
      const e = item.data;
      return (
        <>
          <OrderContext
            orderNumber={e.order_number}
            siteName={e.site_name}
            companyName={e.company_name}
            contactName={e.contact_name}
          />
          <div className="flex items-baseline gap-2 flex-wrap mt-1.5">
            <span className="text-sm font-medium text-foreground">{e.material_name}</span>
            <span className="text-sm text-foreground tabular-nums">
              {formatDateLong(e.previous_end_date)} → {formatDateLong(e.new_end_date)}
            </span>
          </div>
          {e.reason && <p className="text-xs text-muted mt-1">理由: {e.reason}</p>}
          <p className="text-xs text-subtle mt-1">{formatRelative(e.requested_at)}</p>
        </>
      );
    }
    case "return_receipt": {
      const r = item.data;
      return (
        <>
          <OrderContext
            orderNumber={r.order_number}
            siteName={r.site_name}
            companyName={r.company_name}
            contactName={r.contact_name}
          />
          <div className="flex items-baseline gap-2 flex-wrap mt-1.5">
            <span className="text-sm font-medium text-foreground">{r.material_name}</span>
            <span className="text-sm text-foreground tabular-nums">
              × {r.requested_quantity_delta}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            予定: {r.scheduled_date} ・{" "}
            {transportLabel(r.transport_method, r.dropoff_office_name)}
          </p>
        </>
      );
    }
    case "registration":
      // Phase 2（会員登録ブランチ merge 後）で生成・表示する。
      return (
        <div className="mt-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {item.companyName}
          </p>
          {item.contactName && (
            <p className="text-xs text-muted mt-0.5">{item.contactName}</p>
          )}
        </div>
      );
  }
}

function CardActions({
  item,
  offices,
}: {
  item: ApprovalItem;
  offices: OfficeOption[];
}) {
  switch (item.kind) {
    case "order":
      // 数量修正を伴うため、専用の発注詳細画面で承認する。
      return (
        <Link
          href={`/admin/orders/${item.orderId}`}
          className="px-3 h-8 inline-flex items-center text-xs font-semibold bg-accent text-white rounded hover:bg-accent-hover transition-colors flex-shrink-0"
        >
          確認して承認 →
        </Link>
      );
    case "return":
      return (
        <PendingReturnActions
          requestId={item.data.id}
          label={`${item.data.material_name} ×${item.data.requested_quantity_delta} の返却`}
          desiredDate={item.data.desired_date}
          desiredTransport={item.data.transport_method}
          desiredDropoffOfficeId={item.data.dropoff_office_id}
          offices={offices}
        />
      );
    case "extension":
      return (
        <ExtensionRequestActions
          requestId={item.data.id}
          label={`${item.data.material_name} の期限延長`}
        />
      );
    case "return_receipt":
      return (
        <ScheduledReturnActions
          requestId={item.data.id}
          label={`${item.data.material_name} ×${item.data.requested_quantity_delta} の受領`}
          requestedDelta={item.data.requested_quantity_delta}
          materialName={item.data.material_name}
        />
      );
    case "registration":
      // Phase 2 で RegistrationActions を埋め込む。
      return null;
  }
}
