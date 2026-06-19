-- ============================================================
-- 顧客アカウント申請（customer_applications）
--
-- 顧客が自分でアカウントを申請 → リース会社(admin)が承認すると
-- customers 行を発行する、という保留付きセルフ申請フローのための表。
--
-- customers に直接 inactive 行を作らない理由:
--   - customers.password_hash は NOT NULL。申請者はパスワードを設定せず、
--     承認時に admin 側で仮 PW を発行する方針のため、placeholder PW で
--     inactive 行を作るのは不適切。
--   - 申請を別表に分離すれば、ログイン経路（customers 引き）を汚さない。
--
-- 承認可否のテナント設定は既存の tenants.customer_self_registration（0032）
-- を再利用する（このフローで初めて意味を持たせる）。
--
-- アクセス方針は customers と同様:
--   - RLS 有効・anon ポリシー無し。
--   - 公開フォームからの insert（未ログイン）は service_role で bootstrap。
--   - admin の一覧/承認/却下は authenticated の tenant_isolation policy 経由
--     （JWT claim の tenant_id で分離）。
-- ============================================================

create table customer_applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_name text not null,
  contact_name text,
  phone text,
  contact_email text not null,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  -- 承認時に発行した customers 行へのリンク。
  customer_id uuid references customers(id) on delete set null,
  reject_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index customer_applications_tenant_status_idx
  on customer_applications (tenant_id, status, created_at desc);

-- 同一テナント内で同じメールの pending 申請を 1 件に制限（二重申請防止）。
-- approved/rejected は履歴として残せるよう、pending のみ部分 unique。
create unique index customer_applications_unique_pending_email_idx
  on customer_applications (tenant_id, lower(contact_email))
  where status = 'pending';

alter table customer_applications enable row level security;

create policy "tenant_isolation_select" on customer_applications for select to authenticated
  using (tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid));
create policy "tenant_isolation_insert" on customer_applications for insert to authenticated
  with check (tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid));
create policy "tenant_isolation_update" on customer_applications for update to authenticated
  using (tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid))
  with check (tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid));
create policy "tenant_isolation_delete" on customer_applications for delete to authenticated
  using (tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid));
