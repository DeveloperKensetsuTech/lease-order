-- ============================================================
-- 営業所マスタ + orders に配送/引取・リース期間カラムを追加
-- ============================================================

create table offices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  area text,
  address text,
  phone text,
  fax text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_offices_tenant on offices(tenant_id);
create index idx_offices_active on offices(is_active) where is_active = true;

alter table offices enable row level security;

create policy "anon read offices"
  on offices for select
  to anon
  using (is_active = true);

alter table orders
  add column delivery_method text not null default 'delivery',
  add column delivery_address text,
  add column lease_start_date date,
  add column lease_end_date date,
  add column pickup_office_id uuid references offices(id);

alter table orders
  add constraint orders_delivery_method_check
  check (delivery_method in ('delivery', 'pickup'));

alter table orders
  add constraint orders_lease_dates_order_check
  check (lease_end_date is null or lease_start_date is null or lease_end_date >= lease_start_date);
