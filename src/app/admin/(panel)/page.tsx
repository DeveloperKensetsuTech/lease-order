import Link from "next/link";
import { listOrdersInRange, listScheduledReturnsInRange } from "@/lib/admin-data";
import { countPendingApprovals } from "@/lib/approvals-data";
import { PageHeader } from "@/components/admin/ui";
import DashboardCalendar from "@/components/admin/dashboard-calendar";
import { computeRange } from "@/components/admin/dashboard-calendar/range";
import type { CalendarView } from "@/components/admin/dashboard-calendar/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  view?: string;
  ym?: string;
  wk?: string;
};

function normalizeView(v: string | undefined): CalendarView {
  return v === "week" ? "week" : "month";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const view = normalizeView(sp.view);
  const range = computeRange(view, sp.ym, sp.wk);
  const [orders, scheduledReturns, pendingApprovalCount] = await Promise.all([
    listOrdersInRange(range.from, range.to),
    listScheduledReturnsInRange(range.from, range.to),
    countPendingApprovals(),
  ]);

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="ダッシュボード"
        description="出荷予定と返却予定をカレンダーで確認します。"
      />
      {pendingApprovalCount > 0 && (
        <Link
          href="/admin/approvals"
          className="mb-6 flex items-center justify-between gap-3 px-5 py-3.5 rounded-[var(--radius-lg)] border border-accent/30 bg-[var(--color-accent-soft)] transition-colors hover:border-accent/50"
        >
          <span className="text-sm text-foreground">
            未対応の申請が{" "}
            <span className="font-semibold tabular-nums text-accent">
              {pendingApprovalCount}
            </span>{" "}
            件あります
          </span>
          <span className="text-xs font-semibold text-accent whitespace-nowrap">
            承認インボックスへ →
          </span>
        </Link>
      )}
      <DashboardCalendar
        view={view}
        range={range}
        orders={orders}
        scheduledReturns={scheduledReturns}
      />
    </main>
  );
}
