-- カテゴリ
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 資材
create table materials (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  image_url text,
  description text,
  spec jsonb, -- { "サイズ": "1200x600", "重量": "12kg", ... }
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 発注
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  company_name text not null,
  contact_name text not null,
  phone text,
  email text,
  note text,
  status text not null default 'pending', -- pending, confirmed, shipped, completed, cancelled
  created_at timestamptz not null default now()
);

-- 発注明細
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  material_id uuid not null references materials(id),
  material_name text not null,
  quantity int not null,
  created_at timestamptz not null default now()
);

-- インデックス
create index idx_materials_category on materials(category_id);
create index idx_materials_active on materials(is_active) where is_active = true;
create index idx_orders_status on orders(status);
create index idx_order_items_order on order_items(order_id);

-- シードデータ: カテゴリ
insert into categories (name, slug, sort_order) values
  ('仮囲い', 'karigakoi', 1),
  ('保安機材', 'hoan-kizai', 2),
  ('枠組み足場', 'wakugumi-ashiba', 3),
  ('単管足場', 'tankan-ashiba', 4),
  ('吊足場', 'tsuri-ashiba', 5),
  ('鉄骨足場関連', 'tekkotsu-ashiba', 6),
  ('アルミ・室内足場', 'arumi-shitsunai', 7),
  ('型枠・土木機材', 'katawaku-doboku', 8),
  ('支保工・支保梁', 'shihokou', 9),
  ('仮設備品', 'kasetsu-bihin', 10),
  ('昇降式足場', 'shoukou-ashiba', 11),
  ('注目機材', 'chuumoku', 12);

-- シードデータ: 資材（主要なもの）
insert into materials (category_id, name, slug, description, spec, sort_order) values
  -- 仮囲い
  ((select id from categories where slug = 'karigakoi'), 'ガルバ鋼板', 'galva-kouban', 'ガルバリウム鋼板製の仮囲いパネル', '{"高さ": "3000mm", "幅": "500mm"}', 1),
  ((select id from categories where slug = 'karigakoi'), '環境フェンス', 'kankyou-fence', '防音・防塵対応の環境配慮型フェンス', '{"高さ": "3000mm", "幅": "500mm"}', 2),
  ((select id from categories where slug = 'karigakoi'), 'クロスゲート', 'cross-gate', '伸縮式のクロスゲート', '{"幅": "2000〜6000mm"}', 3),
  ((select id from categories where slug = 'karigakoi'), 'フロアゲート', 'floor-gate', '車両出入口用フロアゲート', '{}', 4),
  ((select id from categories where slug = 'karigakoi'), '潜り戸', 'kugurido', '仮囲い用の通行戸', '{}', 5),
  ((select id from categories where slug = 'karigakoi'), 'パネルゲート', 'panel-gate', 'パネル式の大型ゲート', '{}', 6),

  -- 保安機材
  ((select id from categories where slug = 'hoan-kizai'), 'カラーコーン', 'color-cone', '現場区画用カラーコーン', '{"高さ": "700mm"}', 1),
  ((select id from categories where slug = 'hoan-kizai'), 'コーンバー', 'cone-bar', 'コーン間連結バー', '{"長さ": "2000mm"}', 2),
  ((select id from categories where slug = 'hoan-kizai'), 'ベストフェンス', 'best-fence', '安全区画用フェンス', '{}', 3),
  ((select id from categories where slug = 'hoan-kizai'), '単管バリケード', 'tankan-barricade', '単管パイプ製バリケード', '{}', 4),

  -- 枠組み足場
  ((select id from categories where slug = 'wakugumi-ashiba'), '建枠', 'tatewaku', '枠組足場の基本フレーム', '{"高さ": "1700mm", "幅": "610mm"}', 1),
  ((select id from categories where slug = 'wakugumi-ashiba'), '調整枠', 'chousei-waku', '高さ調整用フレーム', '{}', 2),
  ((select id from categories where slug = 'wakugumi-ashiba'), '手摺り', 'tesuri', '安全手摺り', '{"長さ": "1800mm"}', 3),
  ((select id from categories where slug = 'wakugumi-ashiba'), 'スジカイ', 'sujikai', '補強用筋交い', '{}', 4),
  ((select id from categories where slug = 'wakugumi-ashiba'), '階段', 'kaidan', '昇降用階段', '{}', 5),

  -- 単管足場
  ((select id from categories where slug = 'tankan-ashiba'), 'パイプ', 'pipe', '単管パイプ（φ48.6）', '{"径": "φ48.6mm", "長さ": "各種"}', 1),
  ((select id from categories where slug = 'tankan-ashiba'), 'クランプ', 'clamp', '直交・自在クランプ', '{}', 2),
  ((select id from categories where slug = 'tankan-ashiba'), '足場板', 'ashibaita', 'スチール製足場板', '{"幅": "240mm", "長さ": "4000mm"}', 3),

  -- 吊足場
  ((select id from categories where slug = 'tsuri-ashiba'), 'クイックデッキ', 'quick-deck', '吊り下げ式作業足場システム', '{}', 1),
  ((select id from categories where slug = 'tsuri-ashiba'), 'セーフティSKパネル', 'safety-sk-panel', '安全パネル式吊足場', '{}', 2),

  -- 鉄骨足場関連
  ((select id from categories where slug = 'tekkotsu-ashiba'), '親綱支柱', 'oyazuna-shichuu', '親綱固定用支柱', '{}', 1),
  ((select id from categories where slug = 'tekkotsu-ashiba'), 'ラッセルネット', 'russel-net', '落下防止用ネット', '{}', 2),

  -- アルミ・室内足場
  ((select id from categories where slug = 'arumi-shitsunai'), '脚立', 'kyatatsu', 'アルミ製脚立', '{}', 1),
  ((select id from categories where slug = 'arumi-shitsunai'), 'はしご', 'hashigo', 'アルミ製はしご', '{}', 2),
  ((select id from categories where slug = 'arumi-shitsunai'), 'コンスタワー', 'cons-tower', '室内用ローリングタワー', '{}', 3),

  -- 型枠・土木機材
  ((select id from categories where slug = 'katawaku-doboku'), 'バタ', 'bata', '型枠締付用バタ材', '{}', 1),
  ((select id from categories where slug = 'katawaku-doboku'), 'ホームタイ', 'home-tie', '型枠締付金具', '{}', 2),
  ((select id from categories where slug = 'katawaku-doboku'), 'メッシュロード', 'mesh-road', '仮設道路用メッシュパネル', '{}', 3),

  -- 支保工・支保梁
  ((select id from categories where slug = 'shihokou'), 'OKサポート', 'ok-support', '型枠支保工', '{}', 1),
  ((select id from categories where slug = 'shihokou'), 'パイプサポート', 'pipe-support', 'パイプ式サポート', '{}', 2),
  ((select id from categories where slug = 'shihokou'), '強力サポート', 'kyouryoku-support', '高耐荷重サポート', '{}', 3),

  -- 仮設備品
  ((select id from categories where slug = 'kasetsu-bihin'), '仮設ハウス', 'kasetsu-house', '現場事務所用プレハブ', '{}', 1),
  ((select id from categories where slug = 'kasetsu-bihin'), '仮設トイレ', 'kasetsu-toilet', '仮設トイレユニット', '{}', 2),

  -- 昇降式足場
  ((select id from categories where slug = 'shoukou-ashiba'), 'リフトクライマー', 'lift-climber', '自走式昇降足場', '{}', 1),
  ((select id from categories where slug = 'shoukou-ashiba'), '工事用エレベーター', 'kouji-elevator', '建設工事用エレベーター', '{}', 2),

  -- 注目機材
  ((select id from categories where slug = 'chuumoku'), 'Iqシステム', 'iq-system', '次世代足場システム。階高1900mm、先行手すり標準装備', '{"階高": "1900mm"}', 1);
