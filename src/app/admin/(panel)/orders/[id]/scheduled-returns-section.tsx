import "server-only";
import { getSupabaseTenant } from "@/lib/supabase-tenant";
import { getTenantId } from "@/lib/tenant";
import { SectionRule } from "@/components/admin/ui";

type ScheduledReturn = {
  id: string;
  status: "pending" | "scheduled";
  material_name: string;
  requested_quantity_delta: number;
  transport_method: "pickup" | "dropoff" | null;
  desired_date: string | null;
  scheduled_date: string | null;
  requested_at: string | null;
  dropoff_office_name: string | null;
};

async function loadScheduledReturns(
  orderId: string,
  tenantId: string
): Promise<ScheduledReturn[]> {
  const supabase = await getSupabaseTenant();
  const { data: rows } = await supabase
    .from("return_requests")
    .select(
      `id, status, requested_quantity_delta, transport_method, desired_date,
       scheduled_date, requested_at,
       order_items!inner(material_name, order_id),
       offices:dropoff_office_id(name)`
    )
    .eq("tenant_id", tenantId)
    .eq("order_items.order_id", orderId)
    .in("status", ["pending", "scheduled"])
    .order("scheduled_date", { ascending: true, nullsFirst: true })
    .order("requested_at", { ascending: true });
  if (!rows || rows.length === 0) return [];

  type Row = {
    id: string;
    status: "pending" | "scheduled";
    requested_quantity_delta: number;
    transport_method: "pickup" | "dropoff" | null;
    desired_date: string | null;
    scheduled_date: string | null;
    requested_at: string | null;
    order_items: { material_name: string } | null;
    offices: { name: string } | null;
  };
  const typed = rows as unknown as Row[];

  return typed.map((r) => ({
    id: r.id,
    status: r.status,
    material_name: r.order_items?.material_name ?? "(不明)",
    requested_quantity_delta: r.requested_quantity_delta,
    transport_method: r.transport_method,
    desired_date: r.desired_date,
    scheduled_date: r.scheduled_date,
    requested_at: r.requested_at,
    dropoff_office_name: r.offices?.name ?? null,
  }));
}

function fmtDate(s: string | null): string {
  return s ? new Date(s + "T00:00:00").toLocaleDateString("ja-JP") : "—";
}

function transportLabel(
  method: "pickup" | "dropoff" | null,
  officeName: string | null
): string {
  if (method === "pickup") return "取りに来てもらう";
  if (method === "dropoff") return `業所に持ち込み${officeName ? `（${officeName}）` : ""}`;
  return "—";
}

export default async function ScheduledReturnsSection({
  orderId,
}: {
  orderId: string;
}) {
  const tenantId = await getTenantId();
  const items = await loadScheduledReturns(orderId, tenantId);
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionRule
        label="返却予定"
        right={
          <span className="font-[family-name:var(--font-mono)] tabular-nums text-[11px] text-subtle">
            {items.length} 件
          </span>
        }
        className="mb-3"
      />
      <ul className="space-y-3">
        {items.map((r) => {
          const isScheduled = r.status === "scheduled";
          return (
            <li
              key={r.id}
              className="border border-rule rounded-[var(--radius-lg)] bg-surface px-4 py-3"
            >
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {r.material_name}{" "}
                    <span className="text-subtle text-xs tabular-nums">
                      ×{r.requested_quantity_delta}
                    </span>
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {isScheduled
                      ? `返却日 ${fmtDate(r.scheduled_date)}`
                      : `希望日 ${fmtDate(r.desired_date)}`}
                    {" ・ "}
                    {transportLabel(r.transport_method, r.dropoff_office_name)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 h-[20px] rounded-full text-[10px] font-semibold ${
                    isScheduled
                      ? "bg-info-soft text-info"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  {isScheduled ? "返却予定" : "申請中"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
