# UI Yasui デザイン設定

## ベース情報
- ブランド: Tesla
- 作成日: 2026-04-17
- 最終更新: 2026-04-17

## 技術
- フレームワーク: Next.js 16 (App Router) + TypeScript
- UIライブラリ: shadcn/ui
- CSSフレームワーク: Tailwind CSS v4

## カラー（ライトモード）
- メイン: #3E6AE1（Electric Blue — CTAボタン専用）
- 背景: #FFFFFF（Pure White）
- 文字: #171A20（Carbon Dark — 見出し・ナビ）
- 本文: #393C41（Graphite — 本文テキスト）
- 薄い文字: #5C5E62（Pewter — 補助テキスト）
- プレースホルダー: #8E8E8E（Silver Fog）
- アクセント: #3E6AE1（Electric Blue — メインと同一、唯一の有彩色）
- 成功: #22C55E（標準グリーン）
- 警告: #F59E0B（標準アンバー）
- エラー: #EF4444（標準レッド）
- 枠線: #EEEEEE（Cloud Gray）
- 薄い枠線: #D0D1D2（Pale Silver）
- 代替背景: #F4F4F4（Light Ash — セクション区切り用）
- ダーク面: #171A20（Carbon Dark — ヒーロー背景等）
- フロストガラス: rgba(255, 255, 255, 0.75)（ナビゲーション用）

## カラー（ダークモード）
- 対応しない

## フォント
- 見出し: Inter, 500
- 本文: Inter, 400
- 日本語: Noto Sans JP（見出し 500, 本文 400）
- フォールバック: -apple-system, Arial, sans-serif
- サイズ基準: 14px

### タイポグラフィ階層
| 役割 | サイズ | ウェイト | 行高 | 備考 |
|------|--------|---------|------|------|
| ヒーロータイトル | 40px (2.50rem) | 500 | 1.20 | 白文字、ダーク背景上 |
| セクション見出し | 22px (1.38rem) | 500 | 1.30 | |
| 商品名・カード見出し | 17px (1.06rem) | 500 | 1.18 | |
| ナビ項目 | 14px (0.88rem) | 500 | 1.20 | |
| 本文 | 14px (0.88rem) | 400 | 1.43 | |
| ボタンラベル | 14px (0.88rem) | 500 | 1.20 | |
| サブリンク | 14px (0.88rem) | 400 | 1.43 | |

## 部品スタイル
- ボタンの角丸: 4px
- カードの角丸: 4px（大きいカード: 12px）
- カードの影: none（影なし — Teslaの哲学）
- 入力欄の枠線: 1px solid #EEEEEE
- ボタン最小高さ: 40px
- ボタン幅（CTA）: 200px

## スペーシング
- 基準単位: 8px
- スケール: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 96px

## アニメーション
- 度合い: 控えめ
- 標準の変化時間: 330ms
- イージング: cubic-bezier(0.5, 0, 0, 0.75)
- 適用対象: ボタンの色変化、背景色変化、ボーダー色変化のみ
- 禁止: scale/translate によるホバーアニメーション

## アイコン
- ライブラリ: Lucide Icons

## 言語
- UI表示: 日本語 + 英語（切り替え対応）

## レイアウト
- 方向性: ゆったり（余白たっぷり）
- 最大幅: 1383px
- ブレークポイント: 768px, 1024px, 1440px
- ヒーローセクション: 100vh（フルビューポート）
- ホワイトスペース哲学: 余白は高級感の表現。1画面1メッセージ。

## ダークモード
- 対応: しない

## デザイン原則（Tesla準拠）
- 装飾ゼロ: 影なし、グラデーションなし、ボーダーなし、パターンなし
- 有彩色は1色のみ（Electric Blue）、それ以外はモノクロ
- 写真とホワイトスペースで魅せる
- タイポグラフィはウェイト400-500のみ。太字(700)や細字(300)は使わない
- 大文字変換(uppercase)は使わない
- 1画面に最大2つのCTAボタンまで

## オリジナルデザイン定義（Teslaから取得）

# Design System Inspired by Tesla

## 1. Visual Theme & Atmosphere

Tesla's website is an exercise in radical subtraction — a digital showroom where the product is everything and the interface is almost nothing. The page opens with a full-viewport hero that fills the entire screen with cinematic car photography: three vehicles arranged on polished concrete against a hazy cityscape sky, with a single model name floating above in translucent white type. There are no decorative borders, no gradients, no patterns, no shadows. The UI exists only to provide just enough navigational structure to get out of the way. Every pixel that isn't product imagery is white space, and that restraint is the design system's most powerful statement.

The color philosophy is almost ascetic: a single blue (`#3E6AE1`) for primary calls to action, three shades of dark gray for text hierarchy, and white for everything else. The entire emotional weight is carried by photography — sprawling landscape shots, studio-lit vehicle profiles, and atmospheric environmental compositions that stretch edge-to-edge across each viewport-height section. The UI chrome dissolves into the imagery. The navigation bar floats above the hero with no visible background, border, or shadow — the TESLA wordmark and five navigation labels simply exist in the space, trusting the content beneath them to provide sufficient contrast.

Typography recently transitioned from Gotham to Universal Sans — a custom family split into "Display" for headlines and "Text" for body/UI elements — unifying the website, mobile app, and in-car software into a single typographic voice. The Display variant renders hero titles at 40px weight 500, while the Text variant handles everything from navigation (14px/500) to body copy (14px/400). The font carries a geometric precision with slightly humanist terminals that feels engineered rather than designed — exactly matching Tesla's brand identity of technology that doesn't need to announce itself. There are no text shadows, no text gradients, no decorative type treatments. Every letterform earns its place through clarity alone.

**Key Characteristics:**
- Full-viewport hero sections (100vh) dominated by cinematic car photography with minimal overlay UI
- Near-zero UI decoration: no shadows, no gradients, no borders, no patterns anywhere on the page
- Single accent color — Electric Blue (`#3E6AE1`) — used exclusively for primary CTA buttons
- Universal Sans font family (Display + Text) unifying web, app, and in-car interfaces
- Photography-first presentation where product imagery carries all emotional weight
- Frosted-glass navigation concept with transparent/white nav that floats over hero content
- 0.33s cubic-bezier transitions as the universal timing for all interactive state changes
- Carousel-driven hero with dot indicators and edge arrow navigation for multiple vehicle showcases

## 2. Color Palette & Roles

### Primary
- **Electric Blue** (`#3E6AE1`): Primary CTA button background
- **Pure White** (`#FFFFFF`): Dominant background color

### Surface & Background
- **White Canvas** (`#FFFFFF`): Page background, navigation panel, dropdown menus
- **Light Ash** (`#F4F4F4`): Subtle alternate surface
- **Carbon Dark** (`#171A20`): Dark surface color for hero text overlays
- **Frosted Glass** (`rgba(255, 255, 255, 0.75)`): Semi-transparent white for navigation

### Neutrals & Text
- **Carbon Dark** (`#171A20`): Primary heading and navigation text
- **Graphite** (`#393C41`): Body text and secondary content
- **Pewter** (`#5C5E62`): Tertiary text
- **Silver Fog** (`#8E8E8E`): Placeholder text
- **Cloud Gray** (`#EEEEEE`): Light borders and divider lines
- **Pale Silver** (`#D0D1D2`): Subtle UI borders

## 3. Typography Rules

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Hero Title | 40px (2.50rem) | 500 | 48px (1.20) | normal | White on dark hero imagery |
| Product Name | 17px (1.06rem) | 500 | 20px (1.18) | normal | Model names in nav panel and cards |
| Nav Item | 14px (0.88rem) | 500 | 16.8px (1.20) | normal | Primary navigation labels |
| Body Text | 14px (0.88rem) | 400 | 20px (1.43) | normal | Paragraph and descriptive content |
| Button Label | 14px (0.88rem) | 500 | 16.8px (1.20) | normal | CTA button text |
| Sub-link | 14px (0.88rem) | 400 | 20px (1.43) | normal | Tertiary links |
| Promo Text | 22px (1.38rem) | 400 | 20px (0.91) | normal | Promotional text on hero |

## 4. Component Stylings

### Buttons
- Primary CTA: bg #3E6AE1, text #FFFFFF, borderRadius 4px, minHeight 40px, width 200px
- Secondary CTA: bg #FFFFFF, text #393C41, borderRadius 4px, minHeight 40px
- Transition: border-color 0.33s, background-color 0.33s, color 0.33s

### Cards & Containers
- Background: transparent or #FFFFFF
- Border: none
- Shadow: none
- Category Card: 12px border-radius, overflow hidden

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 96px

### Grid & Container
- Max width: 1383px
- Hero: Full-bleed, edge-to-edge, 100vh sections

### Border Radius Scale
| Value | Context |
|-------|---------|
| 0px | Most elements |
| 4px | Buttons |
| 12px | Large cards |
| 50% | Dot indicators |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow, no border | Default for all elements |
| Level 1 (Frost) | rgba(255,255,255,0.75) backdrop | Navigation bar on scroll |
| Level 2 (Overlay) | rgba(128,128,128,0.65) | Modal overlays |
| Level 3 (Subtle) | rgba(0,0,0,0.05) | Rare hover states |

## 7. Do's and Don'ts

### Do
- Use Electric Blue (#3E6AE1) exclusively for primary CTAs
- Maintain viewport-height sections for major content blocks
- Keep typography at weight 400-500 only
- Use 4px border-radius for all interactive elements
- Trust whitespace as a luxury signal
- Keep all transitions at 0.33s

### Don't
- Add shadows to any element
- Use more than one chromatic color besides the blue CTA
- Apply gradients, patterns, or decorative backgrounds
- Use text larger than 40px
- Add borders to cards or containers
- Use uppercase text transforms
- Introduce rounded-pill buttons or large border-radii
- Add hover animations with scale/translate transforms
- Clutter the viewport with multiple CTAs

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single-column, hamburger nav, hero ~28px, CTAs stack vertically |
| Tablet | 768-1024px | 2-column, CTAs side-by-side, reduced padding |
| Desktop | 1024-1440px | Full horizontal nav, hero 40px, side-by-side CTAs |
| Large Desktop | >1440px | Content centered, max-width container |
