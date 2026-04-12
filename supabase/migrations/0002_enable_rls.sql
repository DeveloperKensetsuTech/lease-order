-- ============================================================
-- Enable RLS on all tables
-- Read-side tables: allow anon SELECT (catalog is public)
-- Write-side tables: no anon policies (service_role only)
-- ============================================================

alter table tenants enable row level security;
alter table categories enable row level security;
alter table materials enable row level security;
alter table material_variants enable row level security;
alter table images enable row level security;
alter table material_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table email_logs enable row level security;
alter table audit_logs enable row level security;

-- Public read policies for the catalog
create policy "anon read tenants"
  on tenants for select
  to anon
  using (true);

create policy "anon read categories"
  on categories for select
  to anon
  using (true);

create policy "anon read materials"
  on materials for select
  to anon
  using (is_active = true);

create policy "anon read material_variants"
  on material_variants for select
  to anon
  using (is_active = true);

create policy "anon read images"
  on images for select
  to anon
  using (true);

create policy "anon read material_images"
  on material_images for select
  to anon
  using (true);

-- orders / order_items / email_logs / audit_logs:
-- no policies for anon → all access from client with the publishable key is denied.
-- Server code uses the service_role key which bypasses RLS.
