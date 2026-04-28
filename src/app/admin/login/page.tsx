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
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 sm:p-8">
        <h1 className="text-xl font-bold text-accent mb-1">管理画面ログイン</h1>
        <p className="text-sm text-subtle mb-6">
          登録済みのメールアドレスにログインリンクを送信します。
        </p>
        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
            {errorMessage}
          </div>
        )}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
