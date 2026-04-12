# データベース設計

リース会社向け資材発注システムのDB設計ドキュメント。三信産業を初回ターゲットに、横展開（マルチテナント）を前提に設計する。

## 設計方針サマリ

| 項目 | 決定事項 |
|---|---|
| DB分離 | 単一DB。管理側/発注側はアプリ層（Route Groups + 権限）で分離 |
| マルチテナント | 全テーブルに `tenant_id`。サブドメイン方式で識別予定 |
| 発注側ログイン | MVPは無し。Phase2で招待制マジックリンクを検討 |
| 管理側認証 | Phase2で Supabase Auth（マジックリンク） |
| 承認フロー | あり。`pending → approved → shipped → completed` + `rejected/cancelled` |
| 数量修正 | 承認時に修正可（`approved_quantity` カラム） |
| 却下理由 | テキスト保存 |
| 通知 | メール（受付/承認/却下/出荷）。送信ログを保存 |
| 資材バリエーション | `material_variants` テーブルで管理（長さ違い等） |
| 画像 | 多対多（`images` + `material_images`）。1画像N資材OK |
| spec | jsonb のまま（MVPで検索ニーズなし） |
| 監査ログ | あり |
| 在庫表示 | 三信ヒアリングで要確認 |

---

## Phase 1（MVP）スキーマ

### テナント

```sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);
```

### カテゴリ

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  slug text not null,
  image_url text,                     -- カテゴリ代表画像（1:1でMVPに十分）
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index idx_categories_tenant on categories(tenant_id);
```

**注:** カテゴリ画像は1:1で十分なため `image_url` カラムで持つ。資材画像は1画像N資材があるため `images` + `material_images` で多対多管理。Phase3で「カテゴリにも複数画像」が必要になれば `category_images` 中間テーブルを追加。

### 資材

```sql
create table materials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  spec jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index idx_materials_tenant on materials(tenant_id);
create index idx_materials_category on materials(category_id);
create index idx_materials_active on materials(is_active) where is_active = true;
```

`image_url` は廃止。画像は `material_images` 経由で持つ。

### 資材バリエーション

```sql
create table material_variants (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials(id) on delete cascade,
  name text not null,
  spec jsonb,
  sku text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_variants_material on material_variants(material_id);
```

バリエーション無し資材は `material_variants` に行を持たない。発注時は `order_items.variant_id` が null になる。

### 画像（多対多）

```sql
create table images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  url text not null,
  caption text,
  source text,
  created_at timestamptz not null default now()
);

create index idx_images_tenant on images(tenant_id);

create table material_images (
  material_id uuid not null references materials(id) on delete cascade,
  image_id uuid not null references images(id) on delete cascade,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  primary key (material_id, image_id)
);

create index idx_material_images_image on material_images(image_id);
```

### 発注

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  order_number text not null,
  company_name text not null,
  contact_name text not null,
  phone text,
  email text,
  note text,
  status text not null default 'pending',
  approved_at timestamptz,
  approved_by text,
  reject_reason text,
  rejected_at timestamptz,
  shipped_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, order_number)
);

create index idx_orders_tenant on orders(tenant_id);
create index idx_orders_status on orders(status);
```

ステータス: `pending` / `approved` / `rejected` / `shipped` / `completed` / `cancelled`

### 発注明細

```sql
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  material_id uuid not null references materials(id),
  variant_id uuid references material_variants(id),
  material_name text not null,
  variant_name text,
  quantity int not null,
  approved_quantity int,
  created_at timestamptz not null default now()
);

create index idx_order_items_order on order_items(order_id);
```

`material_name` / `variant_name` は発注時点のスナップショット。マスタ変更後も発注書を当時の表記で表示できる。

### メール送信ログ

```sql
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  order_id uuid references orders(id) on delete set null,
  to_address text not null,
  subject text not null,
  body text,
  kind text not null, -- 'order_received' | 'order_approved' | 'order_rejected' | 'order_shipped' | 'admin_new_order'
  status text not null default 'sent', -- 'sent' | 'failed'
  error text,
  sent_at timestamptz not null default now()
);

create index idx_email_logs_order on email_logs(order_id);
create index idx_email_logs_tenant on email_logs(tenant_id);
```

### 監査ログ

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  actor text,                -- 操作者（管理者名 or system）
  action text not null,      -- 'create' | 'update' | 'delete'
  entity_type text not null, -- 'material' | 'category' | 'order' | ...
  entity_id uuid,
  diff jsonb,                -- 変更前後の差分
  created_at timestamptz not null default now()
);

create index idx_audit_logs_tenant on audit_logs(tenant_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
```

---

## Phase 2 候補（三信ヒアリング後に判断）

- **招待制ログイン**: `customers` / `customer_users` テーブル追加。`orders.customer_id` (nullable) を埋める運用へ
- **管理側認証**: Supabase Auth + `admin_users` テーブル
- **在庫表示**: `material_variants.stock_quantity` 等 — 三信の業務実態次第
- **spec のカラム化**: サイズ・長さ検索ニーズが出てきたら
- **承認時の数量修正の正式運用**: 三信で本当に使うか確認後、UI込みで本実装

## Phase 3 候補（将来拡張）

- **現場マスタ**: `sites` / `projects` テーブル。1顧客 N現場
- **再発注機能**: 過去の発注をテンプレ化
- **画像のbounding_box**: 1画像N資材の中で資材位置をハイライト
- **カテゴリにも画像**: `category_images` 中間テーブル
- **画像タグ**: `image_tags` で「カタログ/図面/現場写真」分類
- **画像の soft delete**: 履歴保持
- **承認履歴の詳細ログ**: `order_status_logs` テーブル化（現状は orders のカラムで簡易対応）
- **見積もり/価格**: `materials.unit_price` 追加 → 概算金額表示
- **多段承認**: 複数承認者ワークフロー

---

## 三信ヒアリングで確認すべき項目

DB設計に影響する未確定事項。詳細は `~/.claude/.../sanshin_hearing_items.md` を参照。

- 既存取引先からのリピート発注の割合（→ ログイン要否判断）
- 承認時の数量修正の発生頻度（→ approved_quantity の運用要否）
- 事務員の発注業務量・現状ボトルネック（→ 通知/UIの優先度判断）
- 在庫表示の要否（→ 在庫テーブル設計の要否）

---

## TODO

### スキーマ・シード生成
- スキーマ: `supabase/migrations/0001_init_schema.sql`（手動メンテ。`supabase db push` で本番にも適用）
- デモシード: `supabase/seed.sql`（`scripts/generate-seed.ts` が `src/lib/data.ts` から生成。`supabase db reset` でローカル/デモ環境のみに投入され、本番には流れない）
- 再生成: `npx tsx scripts/generate-seed.ts > supabase/seed.sql`
- 顧客導入時はこのシードを使わず、`tenants` を新規作成して管理画面からカタログを登録する想定

### スキーマ移行
- [ ] `tenants` テーブル新設
- [ ] 既存テーブルへの `tenant_id` 追加 + ユニーク制約変更
- [ ] `material_variants` テーブル新設
- [ ] `images` / `material_images` テーブル新設、`materials.image_url` 廃止
- [ ] `orders` に承認関連カラム追加
- [ ] `order_items` に `variant_id` / `approved_quantity` 追加
- [ ] `email_logs` / `audit_logs` テーブル新設
- [ ] シードデータ更新（tenant_id 込み）

### アプリ分離
- [ ] Route Groups 化: `app/(order)/...` と `app/(admin)/...`
- [ ] レイアウト分離: 発注側に CartProvider・カート付き Header / 管理側は管理用レイアウト
- [ ] 管理側に CartProvider が漏れないことを確認

### 機能実装
- [ ] 管理画面: 発注一覧・詳細・ステータス操作（承認/却下/出荷/完了）
- [ ] 管理画面: 却下理由入力UI
- [ ] 管理画面: 承認時の数量修正UI（要確認後に正式対応）
- [ ] メール送信基盤（Resend想定）
- [ ] メール送信ログ記録
- [ ] 監査ログ記録（マスタ更新時）
