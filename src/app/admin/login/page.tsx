import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string; next?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  not_allowed: "このメールアドレスは管理画面のアクセス権がありません。",
  invalid_code: "ログインリンクが無効か期限切れです。再度メールを送信してください。",
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, next } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-xl shadow-sm p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c1.105 0 2-.895 2-2V7a2 2 0 10-4 0v2c0 1.105.895 2 2 2zm-6 1h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1z"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              管理画面ログイン
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              登録済みのメールアドレス宛に
              <br className="sm:hidden" />
              ログインリンクを送信します。
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 rounded-md border border-rose-200 bg-rose-50 text-sm text-rose-800"
            >
              {errorMessage}
            </div>
          )}

          <LoginForm next={next} />
        </div>

        <p className="text-center text-xs text-subtle mt-6">
          アクセス権が必要な場合は管理者までお問い合わせください。
        </p>
      </div>
    </main>
  );
}
