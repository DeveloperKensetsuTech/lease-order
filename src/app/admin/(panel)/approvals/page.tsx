import { listPendingApprovals } from "@/lib/approvals-data";
import { getOffices } from "@/lib/data";
import { PageHeader } from "@/components/admin/ui";
import ApprovalsInbox from "./approvals-inbox";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const [items, offices] = await Promise.all([
    listPendingApprovals(),
    getOffices(),
  ]);
  const officeOptions = offices.map((o) => ({ id: o.id, name: o.name }));

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="承認インボックス"
        description="顧客からの未対応の申請を、種類をまたいでここで一括して確認・処理します。"
      />
      <ApprovalsInbox items={items} offices={officeOptions} />
    </main>
  );
}
