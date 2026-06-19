import { listPendingApplications } from "@/lib/admin-data";
import { PageHeader, ButtonLink } from "@/components/admin/ui";
import ApplicationsList from "./applications-list";

export const dynamic = "force-dynamic";

export default async function AdminCustomerApplicationsPage() {
  const applications = await listPendingApplications();

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="アカウント申請"
        description="顧客からのアカウント申請を承認・却下します。承認するとアカウントが発行され、会社 ID と初期パスワードが申請メール宛に送信されます。"
        actions={<ButtonLink href="/admin/customers" variant="secondary">顧客一覧</ButtonLink>}
      />

      <ApplicationsList applications={applications} />
    </main>
  );
}
