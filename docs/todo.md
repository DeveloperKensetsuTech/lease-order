# TODO

## アーキテクチャ決定事項

### 管理画面と発注画面の分離方針

- **パス分離 + 認証**方式を採用
  - `/admin` 以下 → 管理画面（Supabase Auth で認証保護）
  - `/` 以下 → 発注画面（ログイン不要）
- テナント展開時は**サブドメイン**でテナントを識別
  - 例: `sanshin.example.com/` → 三信の発注画面
  - 例: `sanshin.example.com/admin` → 三信の管理画面
- サブドメインで管理/発注を分けるのではなく、サブドメインはテナント識別に使う
- 1つの Next.js アプリ + 1つの Supabase DB で運用

### 画像管理

- Supabase Storage を使用（バケット: `materials`）
- パス構成: `{tenant_id}/{material_id}/{timestamp}.{ext}`
- テナントごとにパスで分離（バケットは1つ）

### ブランチ・環境戦略

- `develop` → staging（Vercel Preview + staging Supabase）
- `main` → production（Vercel Production + prod Supabase）
- ローカル開発は staging DB を共用
- GitHub Actions で `supabase/migrations/**` 変更時にマイグレーション自動実行

---

## タスク一覧

### インフラ・環境

- [ ] prod 用 Supabase プロジェクト作成・GitHub Secrets 登録（`SUPABASE_PROJECT_REF_PROD` / `SUPABASE_DB_PASSWORD_PROD`）
- [ ] Vercel 環境変数の設定（Preview → staging DB / Production → prod DB）

### 画像

- [ ] 既存画像（public/images/ 198ファイル）を Supabase Storage に一括移行スクリプト作成・実行
- [ ] DB の images / material_images テーブルを Storage URL に更新
- [ ] 移行完了後 public/images/ を git から削除

### 認証・テナント

- [x] テナント解決を ENV 駆動に（`TENANT_SLUG` → `tenants.slug` → UUID。`src/lib/tenant.ts`）
- [x] seed.sql に 2 tenant 投入（`union` = デモ汎用 / `sanshin` = 三信産業）
- [x] カテゴリ CRUD 管理画面（`/admin/categories`）
- [x] 管理画面（/admin）に Supabase Auth マジックリンク認証を追加（`src/proxy.ts` で保護 + `admin_users` 許可リスト）
- [ ] Supabase ダッシュボードで Email プロバイダ有効化 + Site URL / Redirect URL 設定（staging / prod）
- [x] テナント別サブドメインルーティングの実装（`src/lib/tenant.ts` で Host から `<slug>.lease-order.kensetsu-tech.com` パターンで動的抽出 → tenant_id 解決。`TENANT_SLUG` env var は override として継続）
