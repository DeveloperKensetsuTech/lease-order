@AGENTS.md

## デザインシステム参照

カラートークン・命名規則は kensetsu-tech 配下の共有ドキュメントを canonical とする：

@../design-system/COLOR_TOKENS.md
@../design-system/per-app/lease-order.md

- このアプリは現状 canonical と命名・構造が乖離している（`--color-brand` を使用）
- accent 系のみ独自値（navy #04384c）。これは設計通り
- UI 改善フェーズで canonical 準拠への移行を検討。今すぐリネームしない
- 新規にトークンを追加する時は canonical の命名（`--color-surface`, `--color-foreground` 等）に従う
