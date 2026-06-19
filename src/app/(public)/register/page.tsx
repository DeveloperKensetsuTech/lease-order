import Image from "next/image";
import Link from "next/link";
import { getTenant } from "@/lib/tenant";
import RegisterForm from "./register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const tenant = await getTenant();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-20 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <Image
            src="/images/logo-union.webp"
            alt="union"
            width={486}
            height={823}
            priority
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold tracking-tight text-accent leading-none">
            発注<span className="text-[10px] font-medium ml-0.5 align-baseline">for リース</span>
          </span>
        </div>

        {tenant.customer_self_registration ? (
          <>
            <h1 className="text-lg font-bold text-foreground mb-1">アカウント申請</h1>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              発注に必要なアカウントを申請できます。リース会社の承認後、ログイン情報をメールでお送りします。
            </p>
            <RegisterForm />
            <p className="text-xs text-subtle mt-8 leading-relaxed">
              既にアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-accent hover:underline">
                ログイン
              </Link>
              。
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <h1 className="text-lg font-bold text-foreground">アカウント申請</h1>
            <p className="text-sm text-muted leading-relaxed">
              現在、アカウント申請は受け付けておりません。アカウントの発行については、リース会社の担当者までお問い合わせください。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              ← ログインに戻る
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
