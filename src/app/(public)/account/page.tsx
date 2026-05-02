import { requireCustomer } from "@/lib/customer-auth";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const customer = await requireCustomer({ allowMustChangePassword: true });
  const sp = await searchParams;
  const showResetBanner = customer.must_change_password || sp.reset === "1";

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-accent">マイページ</h1>
        <p className="text-sm text-muted mt-1">会社情報・連絡先・パスワードを確認・変更できます。</p>
      </div>

      {showResetBanner && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50">
          <p className="text-sm font-bold text-yellow-900">初回ログイン: パスワード変更が必要です</p>
          <p className="text-xs text-yellow-800 mt-0.5">
            セキュリティのため、パスワードを変更するまで他のページは利用できません。
          </p>
        </div>
      )}

      <section className="mb-8 bg-surface border border-border rounded-xl p-5 sm:p-6">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">会社情報</h2>
        <dl className="grid grid-cols-1 gap-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-subtle min-w-[5rem]">会社 ID</dt>
            <dd className="font-mono text-foreground">{customer.company_id}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-subtle min-w-[5rem]">会社名</dt>
            <dd className="text-foreground">{customer.name}</dd>
          </div>
        </dl>
        <p className="text-xs text-subtle mt-3">会社 ID と会社名はリース会社が管理します。変更が必要な場合は担当者にご連絡ください。</p>
      </section>

      <section className={`mb-8 bg-surface border rounded-xl p-5 sm:p-6 ${showResetBanner ? "border-yellow-300 ring-2 ring-yellow-100" : "border-border"}`}>
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">パスワード変更</h2>
        <PasswordForm mustChange={showResetBanner} />
      </section>

      <section className="bg-surface border border-border rounded-xl p-5 sm:p-6">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">連絡先情報</h2>
        <ProfileForm
          initialPhone={customer.phone ?? ""}
          initialDefaultAddress={customer.default_address ?? ""}
          initialContactEmail={customer.contact_email ?? ""}
        />
      </section>
    </main>
  );
}
