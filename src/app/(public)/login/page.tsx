import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;

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
              ログイン
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              会社 ID とパスワードを入力してください。
            </p>
          </div>

          <LoginForm next={next} />
        </div>

        <p className="text-center text-xs text-subtle mt-6">
          ログイン情報をお忘れの場合はリース会社の担当者までお問い合わせください。
        </p>
      </div>
    </main>
  );
}
