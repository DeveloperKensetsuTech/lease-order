import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerForAdmin } from "@/lib/admin-data";
import EditCustomerForm from "./edit-customer-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerForAdmin(id);
  if (!customer) notFound();

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <Link href="/admin/customers" className="text-sm text-muted hover:text-foreground transition-colors">
          ← 顧客管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-accent mt-2">{customer.name}</h1>
        <p className="text-sm text-muted mt-1 font-mono">{customer.company_id}</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
        <EditCustomerForm customer={customer} />
      </div>
    </main>
  );
}
