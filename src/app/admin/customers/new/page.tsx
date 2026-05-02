import Link from "next/link";
import NewCustomerForm from "./new-customer-form";

export const dynamic = "force-dynamic";

export default function NewCustomerPage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <Link href="/admin/customers" className="text-sm text-muted hover:text-foreground transition-colors">
          ← 顧客管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-accent mt-2">顧客を新規追加</h1>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
        <NewCustomerForm />
      </div>
    </main>
  );
}
