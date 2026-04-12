-- ============================================================
-- Phase 1 initial schema
-- ============================================================

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  slug text not null,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index idx_categories_tenant on categories(tenant_id);

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

create table images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  url text not null,
  caption text,
  source text,
  created_at timestamptz not null default now(),
  unique (tenant_id, url)
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

create table email_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  order_id uuid references orders(id) on delete set null,
  to_address text not null,
  subject text not null,
  body text,
  kind text not null,
  status text not null default 'sent',
  error text,
  sent_at timestamptz not null default now()
);
create index idx_email_logs_order on email_logs(order_id);
create index idx_email_logs_tenant on email_logs(tenant_id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  actor text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_tenant on audit_logs(tenant_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
