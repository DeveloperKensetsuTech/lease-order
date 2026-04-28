-- ============================================================
-- Admin user allowlist
-- A row here means the email is allowed to sign in to /admin
-- and is bound to a single tenant.
-- The auth.users row is created lazily by Supabase Auth on first
-- magic-link sign-in; this table is the gate.
-- ============================================================

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);
create index idx_admin_users_tenant on admin_users(tenant_id);

alter table admin_users enable row level security;
-- No anon policies → publishable key cannot read.
-- Server code uses service_role to look up the tenant for a signed-in email.
