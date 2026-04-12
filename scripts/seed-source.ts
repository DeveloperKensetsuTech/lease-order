import type { Category, Material } from "../src/lib/types";

export const categories: Category[] = [
  { id: "cat-1", name: "仮囲い", slug: "karigakoi", image_url: "/images/materials/0449.jpg", sort_order: 1 },
  { id: "cat-2", name: "保安機材", slug: "hoan-kizai", image_url: "/images/materials/0484.jpg", sort_order: 2 },
  { id: "cat-3", name: "Iqシステム", slug: "iq-system", image_url: "/images/materials/kn9_img.png", sort_order: 3 },
  { id: "cat-4", name: "枠組足場", slug: "wakugumi-ashiba", image_url: "/images/materials/0502.jpg", sort_order: 4 },
  { id: "cat-5", name: "昇降式足場", slug: "shoukou-ashiba", image_url: "/images/materials/kn6_img.png", sort_order: 5 },
  { id: "cat-6", name: "単管足場", slug: "tankan-ashiba", image_url: "/images/materials/0501.jpg", sort_order: 6 },
  { id: "cat-7", name: "吊足場", slug: "tsuri-ashiba", image_url: "/images/materials/ch_2.jpg", sort_order: 7 },
  { id: "cat-8", name: "鉄骨足場", slug: "tekkotsu-ashiba", image_url: "/images/materials/0484.jpg", sort_order: 8 },
  { id: "cat-9", name: "アルミ・室内足場", slug: "arumi-shitsunai", image_url: "/images/materials/ksp6.jpg", sort_order: 9 },
  { id: "cat-10", name: "型枠／土木", slug: "katawaku-doboku", image_url: "/images/materials/0501.jpg", sort_order: 10 },
  { id: "cat-11", name: "支保工／支保梁", slug: "shihokou", image_url: "/images/materials/0502.jpg", sort_order: 11 },
  { id: "cat-12", name: "ハウス／トイレ／備品", slug: "kasetsu-bihin", image_url: "/images/materials/ksp72.jpg", sort_order: 12 },
];

// catalog_page + 17 = file number
function catalogPage(n: number): string {
  return `/images/catalog-pages/page_${n + 17}.webp`;
}

export const materials: Material[] = [
  // ===== 仮囲い =====
  { id: "m-1", category_id: "cat-1", name: "ガルバ鋼板", slug: "galva-kouban", image_url: catalogPage(2), description: "ガルバリウム鋼板製の仮囲いパネル", spec: { "規格": "2M / 3M", "重量": "12.0kg / 18.1kg", "材質": "JIS G3321 SGLCC" }, sort_order: 1, is_active: true, catalog_pages: [catalogPage(2), catalogPage(3)] },
  { id: "m-2", category_id: "cat-1", name: "環境フェンス", slug: "kankyou-fence", image_url: catalogPage(4), description: "防音・防塵対応の環境配慮型フェンス", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(4), catalogPage(5)] },
  { id: "m-3", category_id: "cat-1", name: "クロスゲート", slug: "cross-gate", image_url: catalogPage(6), description: "伸縮式のクロスゲート", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(6)] },
  { id: "m-3b", category_id: "cat-1", name: "フロアゲート", slug: "floor-gate", image_url: catalogPage(6), description: "車両出入口用フロアゲート", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(6)] },
  { id: "m-3c", category_id: "cat-1", name: "潜り戸", slug: "kugurido", image_url: catalogPage(6), description: "仮囲い用の通行戸", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(6)] },
  { id: "m-4", category_id: "cat-1", name: "パネルゲート", slug: "panel-gate", image_url: catalogPage(7), description: "パネル式の大型ゲート", spec: {}, sort_order: 6, is_active: true, catalog_pages: [catalogPage(7), catalogPage(8)] },

  // ===== 保安機材 =====
  { id: "m-5a", category_id: "cat-2", name: "カラーコーン", slug: "color-cone", image_url: catalogPage(10), description: "現場区画用カラーコーン", spec: { "重量": "1.0kg" }, sort_order: 1, is_active: true, catalog_pages: [catalogPage(10)] },
  { id: "m-5b", category_id: "cat-2", name: "コーンベッド", slug: "cone-bed", image_url: catalogPage(10), description: "カラーコーン用ベッド", spec: { "重量": "1.5kg" }, sort_order: 2, is_active: true, catalog_pages: [catalogPage(10)] },
  { id: "m-5c", category_id: "cat-2", name: "コーンバー", slug: "cone-bar", image_url: catalogPage(10), description: "コーン間連結バー", spec: { "重量": "1.0kg" }, sort_order: 3, is_active: true, catalog_pages: [catalogPage(10)] },
  { id: "m-6a", category_id: "cat-2", name: "単管バリケード", slug: "tankan-barricade", image_url: catalogPage(10), description: "単管パイプ製バリケード", spec: { "重量": "4.0kg" }, sort_order: 4, is_active: true, catalog_pages: [catalogPage(10)] },
  { id: "m-6b", category_id: "cat-2", name: "進入防止ドア", slug: "shinnyuu-boushi-door", image_url: catalogPage(10), description: "足場階段用の進入防止ドア", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(10)] },

  // ===== Iqシステム =====
  { id: "m-7", category_id: "cat-3", name: "アイキューシステム", slug: "iq-system-parts", image_url: "/images/materials/kn9_img.png", description: "くさび緊結式足場（抜け止め機能付き）。階高1900mm、先行手すり標準装備", spec: { "階高": "1900mm", "タイプ": "くさび緊結式" }, sort_order: 1, is_active: true, catalog_pages: [catalogPage(12), catalogPage(13), catalogPage(14), catalogPage(15), catalogPage(16)] },

  // ===== 枠組足場 =====
  { id: "m-8a", category_id: "cat-4", name: "建枠", slug: "tatewaku", image_url: catalogPage(22), description: "枠組足場の基本フレーム", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(22), catalogPage(23)] },
  { id: "m-8b", category_id: "cat-4", name: "調整枠", slug: "chousei-waku", image_url: catalogPage(24), description: "高さ調整用フレーム", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(24)] },
  { id: "m-8c", category_id: "cat-4", name: "拡げ枠", slug: "hiroge-waku", image_url: catalogPage(25), description: "幅拡張用フレーム", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(25)] },
  { id: "m-8d", category_id: "cat-4", name: "梯子枠", slug: "hashigo-waku", image_url: catalogPage(25), description: "梯子付きフレーム", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(25)] },
  { id: "m-9a", category_id: "cat-4", name: "連結ピン", slug: "renketsu-pin", image_url: catalogPage(27), description: "枠組足場の連結用ピン", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(27)] },
  { id: "m-9b", category_id: "cat-4", name: "布板", slug: "nunobita", image_url: catalogPage(27), description: "足場用布板", spec: {}, sort_order: 6, is_active: true, catalog_pages: [catalogPage(27)] },
  { id: "m-9c", category_id: "cat-4", name: "コーナー板", slug: "corner-ita", image_url: catalogPage(28), description: "コーナー部用板材", spec: {}, sort_order: 7, is_active: true, catalog_pages: [catalogPage(28)] },
  { id: "m-10a", category_id: "cat-4", name: "スジカイ", slug: "sujikai", image_url: catalogPage(29), description: "補強用筋交い", spec: {}, sort_order: 8, is_active: true, catalog_pages: [catalogPage(29)] },
  { id: "m-10b", category_id: "cat-4", name: "階段", slug: "kaidan", image_url: catalogPage(30), description: "昇降用階段", spec: {}, sort_order: 9, is_active: true, catalog_pages: [catalogPage(30)] },
  { id: "m-10c", category_id: "cat-4", name: "手摺り", slug: "tesuri", image_url: catalogPage(30), description: "安全手摺り", spec: {}, sort_order: 10, is_active: true, catalog_pages: [catalogPage(30), catalogPage(31)] },
  { id: "m-11a", category_id: "cat-4", name: "ジャッキベース", slug: "jack-base", image_url: catalogPage(32), description: "足場の高さ調整用ジャッキ", spec: {}, sort_order: 11, is_active: true, catalog_pages: [catalogPage(32)] },
  { id: "m-11b", category_id: "cat-4", name: "壁つなぎ", slug: "kabe-tsunagi", image_url: catalogPage(33), description: "足場と建物の固定部材", spec: {}, sort_order: 12, is_active: true, catalog_pages: [catalogPage(33)] },
  { id: "m-12", category_id: "cat-4", name: "ローリングタワー", slug: "rolling-tower", image_url: catalogPage(37), description: "移動式足場タワー", spec: {}, sort_order: 13, is_active: true, catalog_pages: [catalogPage(37), catalogPage(38), catalogPage(39), catalogPage(40)] },
  { id: "m-13", category_id: "cat-4", name: "H鋼ブラケット", slug: "h-bracket", image_url: catalogPage(41), description: "H鋼取付用ブラケット", spec: {}, sort_order: 14, is_active: true, catalog_pages: [catalogPage(41)] },
  { id: "m-14", category_id: "cat-4", name: "幅木（セフトバンパー）", slug: "habaki", image_url: catalogPage(42), description: "落下防止用幅木", spec: {}, sort_order: 15, is_active: true, catalog_pages: [catalogPage(42)] },
  { id: "m-15a", category_id: "cat-4", name: "防炎メッシュ", slug: "bouen-mesh", image_url: catalogPage(46), description: "防炎仕様のメッシュシート", spec: {}, sort_order: 16, is_active: true, catalog_pages: [catalogPage(46), catalogPage(47)] },
  { id: "m-15b", category_id: "cat-4", name: "防音シート", slug: "bouon-sheet", image_url: catalogPage(48), description: "防音仕様の養生シート", spec: {}, sort_order: 17, is_active: true, catalog_pages: [catalogPage(48)] },
  { id: "m-16", category_id: "cat-4", name: "防音パネル", slug: "bouon-panel", image_url: catalogPage(49), description: "防音対策パネル", spec: {}, sort_order: 18, is_active: true, catalog_pages: [catalogPage(49), catalogPage(50)] },

  // ===== 昇降式足場 =====
  { id: "m-17", category_id: "cat-5", name: "リフトクライマー", slug: "lift-climber", image_url: "/images/materials/kn6_img.png", description: "自走式昇降足場", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(56), catalogPage(57), catalogPage(58), catalogPage(59)] },
  { id: "m-18", category_id: "cat-5", name: "工事用エレベーター", slug: "kouji-elevator", image_url: catalogPage(60), description: "建設工事用エレベーター", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(60), catalogPage(61), catalogPage(62), catalogPage(63)] },

  // ===== 単管足場 =====
  { id: "m-19a", category_id: "cat-6", name: "パイプ", slug: "pipe", image_url: catalogPage(66), description: "単管パイプ（φ48.6mm）", spec: { "径": "φ48.6mm" }, sort_order: 1, is_active: true, catalog_pages: [catalogPage(66), catalogPage(67)] },
  { id: "m-19b", category_id: "cat-6", name: "クランプ", slug: "clamp", image_url: catalogPage(68), description: "直交・自在クランプ", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(68), catalogPage(69), catalogPage(70)] },
  { id: "m-19c", category_id: "cat-6", name: "足場板", slug: "ashibaita", image_url: catalogPage(71), description: "スチール製足場板", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(71)] },
  { id: "m-20", category_id: "cat-6", name: "プラワンシリーズ", slug: "pla-one", image_url: catalogPage(75), description: "プラスチック製足場板", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(75), catalogPage(76)] },

  // ===== 吊足場 =====
  { id: "m-21", category_id: "cat-7", name: "クイックデッキ", slug: "quick-deck", image_url: "/images/materials/ch_2.jpg", description: "吊り下げ式作業足場システム", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(86), catalogPage(87), catalogPage(88), catalogPage(89), catalogPage(90), catalogPage(91)] },
  { id: "m-22", category_id: "cat-7", name: "セーフティSKパネル", slug: "safety-sk-panel", image_url: "/images/materials/kn5_img.png", description: "安全パネル式吊足場", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(92), catalogPage(93), catalogPage(94), catalogPage(95), catalogPage(96)] },

  // ===== 鉄骨足場 =====
  { id: "m-23a", category_id: "cat-8", name: "親綱支柱", slug: "oyazuna-shichuu", image_url: catalogPage(98), description: "親綱固定用支柱", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(98)] },
  { id: "m-23b", category_id: "cat-8", name: "親綱", slug: "oyazuna", image_url: catalogPage(98), description: "安全帯取付用親綱ロープ", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(98)] },
  { id: "m-23c", category_id: "cat-8", name: "緊張器", slug: "kinchouki", image_url: catalogPage(98), description: "親綱用緊張器", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(98)] },
  { id: "m-24", category_id: "cat-8", name: "リリーフポスト", slug: "relief-post", image_url: catalogPage(100), description: "安全帯取付用ポスト", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(100), catalogPage(101)] },
  { id: "m-25a", category_id: "cat-8", name: "ラッセルネット", slug: "russel-net", image_url: catalogPage(102), description: "落下防止用ラッセルネット", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(102)] },
  { id: "m-25b", category_id: "cat-8", name: "グリーンネット", slug: "green-net", image_url: catalogPage(103), description: "落下防止用グリーンネット", spec: {}, sort_order: 6, is_active: true, catalog_pages: [catalogPage(103)] },
  { id: "m-26", category_id: "cat-8", name: "スタンション", slug: "stanchion", image_url: catalogPage(104), description: "手摺り支柱", spec: {}, sort_order: 7, is_active: true, catalog_pages: [catalogPage(104), catalogPage(105)] },
  { id: "m-27", category_id: "cat-8", name: "安全ブロック", slug: "anzen-block", image_url: catalogPage(106), description: "安全ブロック（墜落防止器具）", spec: {}, sort_order: 8, is_active: true, catalog_pages: [catalogPage(106)] },
  { id: "m-28", category_id: "cat-8", name: "ロックマン", slug: "lockman", image_url: catalogPage(107), description: "ロック式安全器具", spec: {}, sort_order: 9, is_active: true, catalog_pages: [catalogPage(107)] },

  // ===== アルミ・室内足場 =====
  { id: "m-29", category_id: "cat-9", name: "マキシムベース", slug: "maxim-base", image_url: catalogPage(110), description: "アルミ製ベース", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(110)] },
  { id: "m-30a", category_id: "cat-9", name: "ステップキューブ", slug: "step-cube", image_url: catalogPage(111), description: "組立式ステップ", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(111)] },
  { id: "m-30b", category_id: "cat-9", name: "アルミはしご", slug: "arumi-hashigo", image_url: catalogPage(112), description: "アルミ製はしご", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(112)] },
  { id: "m-30c", category_id: "cat-9", name: "天井点検口はしご", slug: "tenjo-hashigo", image_url: catalogPage(112), description: "天井点検口用はしご", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(112)] },
  { id: "m-31", category_id: "cat-9", name: "アルミ脚立", slug: "arumi-kyatatsu", image_url: catalogPage(114), description: "アルミ製脚立", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(114)] },
  { id: "m-31b", category_id: "cat-9", name: "コンステップ", slug: "cons-step", image_url: catalogPage(114), description: "コンパクト作業台", spec: {}, sort_order: 6, is_active: true, catalog_pages: [catalogPage(114)] },
  { id: "m-32", category_id: "cat-9", name: "コンスタワー", slug: "cons-tower", image_url: catalogPage(115), description: "室内用ローリングタワー", spec: {}, sort_order: 7, is_active: true, catalog_pages: [catalogPage(115)] },
  { id: "m-32b", category_id: "cat-9", name: "ライトステップ", slug: "light-step", image_url: catalogPage(115), description: "軽量ステップ", spec: {}, sort_order: 8, is_active: true, catalog_pages: [catalogPage(115)] },
  { id: "m-33", category_id: "cat-9", name: "トラッキング", slug: "tracking", image_url: catalogPage(116), description: "高所作業用トラッキング", spec: {}, sort_order: 9, is_active: true, catalog_pages: [catalogPage(116)] },
  { id: "m-34", category_id: "cat-9", name: "簡易棚", slug: "kani-tana", image_url: catalogPage(119), description: "現場用簡易棚", spec: {}, sort_order: 10, is_active: true, catalog_pages: [catalogPage(119)] },
  { id: "m-35a", category_id: "cat-9", name: "1t台車", slug: "1t-daisha", image_url: catalogPage(129), description: "1トン積載台車", spec: {}, sort_order: 11, is_active: true, catalog_pages: [catalogPage(129)] },
  { id: "m-35b", category_id: "cat-9", name: "アルミ製六輪・四輪台車", slug: "arumi-daisha", image_url: catalogPage(129), description: "アルミ製台車", spec: {}, sort_order: 12, is_active: true, catalog_pages: [catalogPage(129)] },
  { id: "m-35c", category_id: "cat-9", name: "多目的台車", slug: "tamokuteki-daisha", image_url: catalogPage(130), description: "多目的台車", spec: {}, sort_order: 13, is_active: true, catalog_pages: [catalogPage(130)] },
  { id: "m-35d", category_id: "cat-9", name: "システム台車", slug: "system-daisha", image_url: catalogPage(130), description: "システム台車", spec: {}, sort_order: 14, is_active: true, catalog_pages: [catalogPage(130)] },
  { id: "m-36a", category_id: "cat-9", name: "ベランダブラケット", slug: "veranda-bracket", image_url: catalogPage(132), description: "ベランダ用ブラケット", spec: {}, sort_order: 15, is_active: true, catalog_pages: [catalogPage(132)] },
  { id: "m-36b", category_id: "cat-9", name: "ネットブラケット", slug: "net-bracket", image_url: catalogPage(132), description: "ネット取付用ブラケット", spec: {}, sort_order: 16, is_active: true, catalog_pages: [catalogPage(132)] },

  // ===== 型枠／土木 =====
  { id: "m-37a", category_id: "cat-10", name: "バタ", slug: "bata", image_url: catalogPage(136), description: "型枠締付用バタ材", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(136)] },
  { id: "m-37b", category_id: "cat-10", name: "OKマット", slug: "ok-mat", image_url: catalogPage(136), description: "型枠用マット", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(136)] },
  { id: "m-37c", category_id: "cat-10", name: "メッシュロード", slug: "mesh-road", image_url: catalogPage(137), description: "仮設道路用メッシュパネル", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(137)] },
  { id: "m-37d", category_id: "cat-10", name: "法面ブラケット", slug: "norimen-bracket", image_url: catalogPage(138), description: "法面用ブラケット", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(138)] },
  { id: "m-37e", category_id: "cat-10", name: "アルウォーク", slug: "aru-walk", image_url: catalogPage(138), description: "アルミ製歩行通路", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(138)] },
  { id: "m-38", category_id: "cat-10", name: "マルチアングル工法", slug: "multi-angle", image_url: catalogPage(139), description: "マルチアングル工法部材", spec: {}, sort_order: 6, is_active: true, catalog_pages: [catalogPage(139), catalogPage(140), catalogPage(141), catalogPage(142), catalogPage(143), catalogPage(144), catalogPage(145), catalogPage(146)] },

  // ===== 支保工／支保梁 =====
  { id: "m-39", category_id: "cat-11", name: "OKサポート", slug: "ok-support", image_url: catalogPage(148), description: "型枠支保工・OKサポートシステム", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(148), catalogPage(149), catalogPage(150), catalogPage(151), catalogPage(152), catalogPage(153), catalogPage(154), catalogPage(155), catalogPage(156), catalogPage(157), catalogPage(158), catalogPage(159), catalogPage(160), catalogPage(161), catalogPage(162), catalogPage(163), catalogPage(164)] },
  { id: "m-40", category_id: "cat-11", name: "パイプサポート", slug: "pipe-support", image_url: catalogPage(165), description: "パイプ式サポート", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(165), catalogPage(166), catalogPage(167), catalogPage(168), catalogPage(169)] },
  { id: "m-41", category_id: "cat-11", name: "強力サポート", slug: "kyouryoku-support", image_url: catalogPage(170), description: "高耐荷重サポート", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(170), catalogPage(171), catalogPage(172)] },
  { id: "m-42", category_id: "cat-11", name: "四角支柱", slug: "shikaku-shichuu", image_url: catalogPage(173), description: "四角支柱システム", spec: {}, sort_order: 4, is_active: true, catalog_pages: [catalogPage(173), catalogPage(174), catalogPage(175), catalogPage(176), catalogPage(177), catalogPage(178)] },
  { id: "m-43", category_id: "cat-11", name: "ペコビーム", slug: "peco-beam", image_url: catalogPage(179), description: "支保梁ペコビーム", spec: {}, sort_order: 5, is_active: true, catalog_pages: [catalogPage(179), catalogPage(180), catalogPage(181)] },

  // ===== ハウス／トイレ／備品 =====
  { id: "m-44", category_id: "cat-12", name: "仮設ハウス", slug: "kasetsu-house", image_url: "/images/materials/ksp72.jpg", description: "現場事務所用プレハブ", spec: {}, sort_order: 1, is_active: true, catalog_pages: [catalogPage(184), catalogPage(185)] },
  { id: "m-45", category_id: "cat-12", name: "仮設トイレ", slug: "kasetsu-toilet", image_url: "/images/materials/0453.jpg", description: "仮設トイレユニット", spec: {}, sort_order: 2, is_active: true, catalog_pages: [catalogPage(186), catalogPage(187)] },
  { id: "m-46", category_id: "cat-12", name: "備品", slug: "bihin", image_url: "/images/materials/0450.jpg", description: "現場用備品各種", spec: {}, sort_order: 3, is_active: true, catalog_pages: [catalogPage(188), catalogPage(189), catalogPage(190)] },
];

