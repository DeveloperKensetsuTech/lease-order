-- テスト借り主アカウント（パスワード 'demo1234'、tenant=sanshin）
-- migration 0006 適用後に実行する。再実行しても重複しないように on conflict do nothing。

insert into customers (tenant_id, company_id, name, password_hash, phone, default_address, contact_email, must_change_password) values
  ('00000000-0000-0000-0000-000000000002', 'C-DEMO-001', 'デモ建設株式会社', '$2a$10$bkHRnvlbdCefWOXHshDVauD.zA5s9KvEM54Mo8/YhgB17v7MvhU.i', '097-000-0001', '大分県大分市新貝6番7号', 'demo@example.com', false)
on conflict (tenant_id, company_id) do nothing;
