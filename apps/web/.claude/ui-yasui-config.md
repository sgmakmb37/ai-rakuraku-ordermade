# UI Yasui デザイン設定

## ベース情報
- ブランド: Apple
- 作成日: 2026-04-10
- 最終更新: 2026-04-10

## 技術
- フレームワーク: Next.js 16 (App Router) + React 19 + TypeScript
- UIライブラリ: shadcn/ui
- CSSフレームワーク: Tailwind CSS v4

## カラー（ライトモード）
- メイン: #0071e3（Apple Blue — ボタン・リンク・フォーカスリング専用）
- 背景: #f5f5f7（薄いブルーグレー）
- 背景（白セクション）: #ffffff
- 文字: #1d1d1f（ほぼ黒、純黒より温かみがある）
- 文字（セカンダリ）: rgba(0, 0, 0, 0.8)
- 文字（薄い）: rgba(0, 0, 0, 0.48)
- リンク: #0066cc
- アクセント: #0071e3
- 成功: #34c759（Apple Green）
- 警告: #ff9f0a（Apple Orange）
- エラー: #ff3b30（Apple Red）
- 枠線: rgba(0, 0, 0, 0.04)
- ボタン背景（セカンダリ）: #fafafc
- ボタンアクティブ: #ededf2
- カード影: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px

## カラー（ダークモード）
- メイン: #0071e3（Apple Blue — 変わらない）
- 背景: #000000（純黒）
- 背景（セカンダリ）: #1d1d1f
- 文字: #ffffff
- 文字（セカンダリ）: rgba(255, 255, 255, 0.8)
- 文字（薄い）: rgba(255, 255, 255, 0.48)
- リンク: #2997ff（ダーク用の明るい青）
- アクセント: #2997ff
- 枠線: rgba(255, 255, 255, 0.08)
- カード背景: #272729
- カード背景（高い）: #2a2a2d
- ナビゲーション: rgba(0, 0, 0, 0.8) + backdrop-filter: saturate(180%) blur(20px)

## フォント
- 見出し: Inter, 600 weight（SF Pro Display の代替）
- 本文: Inter, 400 weight（SF Pro Text の代替）
- 日本語: Noto Sans JP（見出し 600, 本文 400）
- フォールバック: Helvetica Neue, Helvetica, Arial, sans-serif
- サイズ基準: 17px（Apple標準のbodyサイズ）

### タイポグラフィスケール
| 役割 | サイズ | ウェイト | 行間 | 字間 |
|------|--------|---------|------|------|
| Display Hero | 56px (3.50rem) | 600 | 1.07 | -0.28px |
| Section Heading | 40px (2.50rem) | 600 | 1.10 | normal |
| Tile Heading | 28px (1.75rem) | 400 | 1.14 | 0.196px |
| Card Title | 21px (1.31rem) | 700 | 1.19 | 0.231px |
| Sub-heading | 21px (1.31rem) | 400 | 1.19 | 0.231px |
| Body | 17px (1.06rem) | 400 | 1.47 | -0.374px |
| Body Emphasis | 17px (1.06rem) | 600 | 1.24 | -0.374px |
| Button | 17px (1.06rem) | 400 | 1.00 | normal |
| Link/Caption | 14px (0.88rem) | 400 | 1.43 | -0.224px |
| Micro | 12px (0.75rem) | 400 | 1.33 | -0.12px |

## 部品スタイル
- ボタンの角丸: 8px
- カードの角丸: 8px
- カードの影: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px（控えめ、使う場面は限定的）
- カードの枠線: なし（Appleはカードに枠線を使わない）
- 入力欄の角丸: 11px
- 入力欄の枠線: 3px solid rgba(0, 0, 0, 0.04)
- ピル型CTA角丸: 980px（カプセル型）
- メディアコントロール角丸: 50%（円形）

### ボタンバリエーション
| 種類 | 背景 | 文字色 | 用途 |
|------|------|--------|------|
| Primary (Blue) | #0071e3 | #ffffff | メインCTA（「購入」「開始」） |
| Primary (Dark) | #1d1d1f | #ffffff | セカンダリCTA |
| Pill Link | transparent + 1px border | #0066cc / #2997ff | 「詳しく見る」系リンク |
| Filter | #fafafc | rgba(0,0,0,0.8) | フィルター・検索 |

## スペーシング
- 基準単位: 8px
- スケール: 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 96px
- セクション間: 大きな余白（映画的リズム）

## アニメーション
- 度合い: 控えめ
- 標準の変化時間: 200ms
- イージング: ease-in-out
- 適用対象: ボタンホバー（色・透明度変化）、ページ要素のフェードイン、フォーカスリング

## アイコン
- ライブラリ: Lucide Icons

## 言語
- UI表示: 日本語 + 英語（切り替え対応）

## レイアウト
- 方向性: Apple映画的リズム（セクション背景色交互、大きな余白）
- 最大幅: 980px
- ブレークポイント: 360px, 480px, 640px, 834px, 1024px, 1070px, 1440px

## ダークモード
- 対応: する（ライト/ダーク切り替え）
- ダークのナビゲーション: 半透明ガラス効果（blur + saturate）

## オリジナルデザイン定義（Appleから取得）

# Design System Inspired by Apple

## 1. Visual Theme & Atmosphere

Apple's website is a masterclass in controlled drama — vast expanses of pure black and near-white serve as cinematic backdrops for products that are photographed as if they were sculptures in a gallery. The design philosophy is reductive to its core: every pixel exists in service of the product, and the interface itself retreats until it becomes invisible. This is not minimalism as aesthetic preference; it is minimalism as reverence for the object.

The typography anchors everything. San Francisco (SF Pro Display for large sizes, SF Pro Text for body) is Apple's proprietary typeface, engineered with optical sizing that automatically adjusts letterforms depending on point size. At display sizes (56px), weight 600 with a tight line-height of 1.07 and subtle negative letter-spacing (-0.28px) creates headlines that feel machined rather than typeset — precise, confident, and unapologetically direct. At body sizes (17px), the tracking loosens slightly (-0.374px) and line-height opens to 1.47, creating a reading rhythm that is comfortable without ever feeling slack.

The color story is starkly binary. Product sections alternate between pure black (#000000) backgrounds with white text and light gray (#f5f5f7) backgrounds with near-black text (#1d1d1f). This creates a cinematic pacing — dark sections feel immersive and premium, light sections feel open and informational. The only chromatic accent is Apple Blue (#0071e3), reserved exclusively for interactive elements: links, buttons, and focus states. This singular accent color in a sea of neutrals gives every clickable element unmistakable visibility.

**Key Characteristics:**
- SF Pro Display/Text with optical sizing — letterforms adapt automatically to size context
- Binary light/dark section rhythm: black (#000000) alternating with light gray (#f5f5f7)
- Single accent color: Apple Blue (#0071e3) reserved exclusively for interactive elements
- Product-as-hero photography on solid color fields — no gradients, no textures, no distractions
- Extremely tight headline line-heights (1.07-1.14) creating compressed, billboard-like impact
- Full-width section layout with centered content — the viewport IS the canvas
- Pill-shaped CTAs (980px radius) creating soft, approachable action buttons
- Generous whitespace between sections allowing each product moment to breathe

## 2. Color Palette & Roles

### Primary
- **Pure Black** (#000000): Hero section backgrounds, immersive product showcases.
- **Light Gray** (#f5f5f7): Alternate section backgrounds, informational areas.
- **Near Black** (#1d1d1f): Primary text on light backgrounds, dark button fills.

### Interactive
- **Apple Blue** (#0071e3): Primary CTA backgrounds, focus rings. The ONLY chromatic color.
- **Link Blue** (#0066cc): Inline text links. Slightly darker for text-level readability.
- **Bright Blue** (#2997ff): Links on dark backgrounds. Higher luminance for contrast on black.

### Text
- **White** (#ffffff): Text on dark backgrounds.
- **Near Black** (#1d1d1f): Primary body text on light backgrounds.
- **Black 80%** (rgba(0, 0, 0, 0.8)): Secondary text, nav items.
- **Black 48%** (rgba(0, 0, 0, 0.48)): Tertiary text, disabled states.

### Surface & Dark Variants
- **Dark Surface 1** (#272729): Card backgrounds in dark sections.
- **Dark Surface 2** (#262628): Subtle surface variation in dark contexts.
- **Dark Surface 3** (#28282a): Elevated cards on dark backgrounds.
- **Dark Surface 4** (#2a2a2d): Highest dark surface elevation.

### Shadows
- **Card Shadow** (rgba(0, 0, 0, 0.22) 3px 5px 30px 0px): Soft, diffused elevation.

## 3. Typography Rules

### Font Family (Original)
- **Display**: SF Pro Display (→ Inter as web substitute)
- **Body**: SF Pro Text (→ Inter as web substitute)
- **Japanese**: Noto Sans JP

## 4. Component Stylings

### Buttons
- Primary Blue: bg #0071e3, text white, padding 8px 15px, radius 8px
- Primary Dark: bg #1d1d1f, text white, padding 8px 15px, radius 8px
- Pill Link: transparent bg, border 1px solid, radius 980px
- Filter: bg #fafafc, radius 11px, border 3px solid rgba(0,0,0,0.04)

### Cards & Containers
- Background: #f5f5f7 (light) or #272729-#2a2a2d (dark)
- Border: none
- Radius: 5px-8px
- Shadow: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px (elevated only)

### Navigation
- Background: rgba(0, 0, 0, 0.8) with backdrop-filter: saturate(180%) blur(20px)
- Height: 48px
- Text: white, 12px, weight 400

## 5. Layout Principles

### Spacing System
- Base unit: 8px

### Grid & Container
- Max content width: 980px
- Hero: full-viewport-width sections with centered content

### Border Radius Scale
- Micro (5px), Standard (8px), Comfortable (11px), Large (12px), Full Pill (980px), Circle (50%)

## 6. Depth & Elevation
- Flat: no shadow
- Navigation Glass: backdrop-filter blur
- Subtle Lift: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px
- Focus: 2px solid #0071e3

## 7. Do's and Don'ts

### Do
- Use Apple Blue (#0071e3) ONLY for interactive elements
- Alternate between black and light gray (#f5f5f7) section backgrounds
- Use 980px pill radius for CTA links
- Keep negative letter-spacing at all text sizes
- Use translucent dark glass for sticky navigation

### Don't
- Don't introduce additional accent colors
- Don't use heavy shadows or multiple shadow layers
- Don't use borders on cards or containers
- Don't add textures, patterns, or gradients to backgrounds
- Don't center-align body text (only headlines center)

## 8. Responsive Behavior

### Breakpoints
- Small Mobile: <360px
- Mobile: 360-480px
- Tablet Small: 640-834px
- Tablet: 834-1024px
- Desktop: 1070-1440px
- Large Desktop: >1440px
