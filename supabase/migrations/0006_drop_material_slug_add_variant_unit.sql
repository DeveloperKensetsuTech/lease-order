-- ============================================================
-- Drop materials.slug (unused; admin uses uuid for routing).
-- Add material_variants.unit (本/枚/m/組 などの単位表記)。
-- ============================================================

-- cascade drops the unique(tenant_id, slug) constraint together with the column.
alter table materials drop column slug cascade;

alter table material_variants add column unit text;
